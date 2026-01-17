import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import Holidays from 'date-holidays';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css'; 
import '../App.css'; 

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- State Management ---
    const [appointments, setAppointments] = useState([]);
    const [customers, setCustomers] = useState([]); 
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookedTimes, setBookedTimes] = useState([]);
    const [filterType, setFilterType] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState(''); 
    
    // Quick-Find Search State (Dedicated to the Form only)
    const [crmSearch, setCrmSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '',
        email: '', 
        phone: '',
        service: 'Consultation', 
        date: '', 
        notes: '', 
        consent: true,
        customerType: 'new' 
    });

    const hd = new Holidays('US');

    // --- Data Fetching ---
    useEffect(() => {
        const loggedIn = localStorage.getItem('isAdmin');
        if (loggedIn !== 'true') navigate('/login');
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [aptRes, custRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/appointments'),
                axios.get('http://localhost:5000/api/admin/customers')
            ]);
            setAppointments(aptRes.data || []);
            setCustomers(custRes.data || []);
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const fetchAvailability = async () => {
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            try {
                const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${yyyy}-${mm}-${dd}`);
                const counts = {};
                res.data.forEach(a => {
                    const time = new Date(a.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    counts[time] = (counts[time] || 0) + 1;
                });
                const blocked = Object.keys(counts).filter(time => counts[time] >= 2);
                setBookedTimes(blocked);
            } catch (e) { console.error("Availability error:", e); }
        };
        fetchAvailability();
    }, [selectedDate]);

    // --- Logic Handlers ---
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            ['00', '15', '30', '45'].forEach(min => {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                slots.push(`${hour12}:${min} ${ampm}`);
            });
        }
        return slots;
    };

    // Auto-Populate Logic: Fills the form when a CRM suggestion is clicked
    const autoFillCustomer = (customer) => {
        setFormData({
            ...formData,
            clientName: customer.clientName || '',
            phone: customer.phone || '',
            email: customer.email || '',
            customerType: 'returning'
        });
        setCrmSearch(customer.clientName); 
        setShowSuggestions(false); 
    };

    // Logic for the Quick-Find dropdown list
    const searchResults = (customers || []).filter(c => 
        (c.email || "").toLowerCase().includes(crmSearch.toLowerCase()) || 
        (c.clientName || "").toLowerCase().includes(crmSearch.toLowerCase())
    ).slice(0, 5);

    const handleTimeSelection = (timeStr) => {
        if (!timeStr) return;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        const updatedDate = new Date(selectedDate);
        updatedDate.setHours(hours, minutes, 0, 0);
        setFormData({ ...formData, date: updatedDate });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date) return alert("Please select a time slot.");
        try {
            await axios.post('http://localhost:5000/api/appointments', formData);
            alert("✅ Appointment added and CRM Updated!");
            setShowAddForm(false);
            fetchData();
            setCrmSearch(''); 
            setFormData({ clientName: '', email: '', phone: '', service: 'Consultation', date: '', notes: '', consent: true, customerType: 'new' });
        } catch (err) { alert("❌ " + (err.response?.data?.message || "Error saving booking")); }
    };

    const filteredAppointments = appointments.filter(apt => {
        const aptType = (apt.customerType || 'new').toLowerCase();
        const currentFilter = filterType.toLowerCase();
        const matchesType = currentFilter === 'all' || aptType === currentFilter;
        const searchLower = searchTerm.toLowerCase();
        return matchesType && (
            (apt.clientName || "").toLowerCase().includes(searchLower) || 
            (apt.service || "").toLowerCase().includes(searchLower) ||
            (apt.email && apt.email.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="admin-container">
            <div className="admin-nav" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', borderBottom: '1px solid white', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => navigate('/admin')}>📅 Dashboard</button>
                    <button className={`nav-btn ${location.pathname === '/crm' ? 'active' : ''}`} onClick={() => navigate('/crm')}>👥 CRM</button>
                    <button className={`nav-btn ${location.pathname === '/analytics' ? 'active' : ''}`} onClick={() => navigate('/analytics')}>📈 Analytics</button>
                </div>
                <button className="delete-btn" onClick={() => { localStorage.removeItem('isAdmin'); navigate('/login'); }}>🔒 Lock Grimoire</button>
            </div>

            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-controls">
                    <div className="filter-group">
                        <span>Filter List: </span>
                        <div>
                            <label><input type="radio" name="filter" checked={filterType === 'all'} onChange={() => setFilterType('all')} /> All</label>
                            <label><input type="radio" name="filter" checked={filterType === 'new'} onChange={() => setFilterType('new')} /> New</label>
                            <label><input type="radio" name="filter" checked={filterType === 'returning'} onChange={() => setFilterType('returning')} /> Returning</label>
                        </div>
                    </div>
                    <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? "Close Form" : "+ Add Manual Booking"}
                    </button>
                </div>
            </div>

            <div className="search-bar-container">
                <input type="text" className="search-input" placeholder="Search appointments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {showAddForm && (
                <div className="form-overlay">
                    <form className="manual-form" onSubmit={handleManualSubmit}>
                        <h3>Manual Call-in Entry</h3>
                        
                        <div className="manual-booking-search" style={{ marginBottom: '15px', position: 'relative' }}>
                            <label style={{ color: '#aaa', fontSize: '12px' }}>Quick-Find Returning Customer:</label>
                            <input 
                                type="text"
                                placeholder="Start typing name..."
                                value={crmSearch}
                                onChange={(e) => { 
                                    const val = e.target.value;
                                    setCrmSearch(val); 
                                    setShowSuggestions(true); 
                                }}
                                style={{ width: '100%', padding: '10px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px' }}
                            />
                            {showSuggestions && crmSearch.length > 0 && searchResults.length > 0 && (
                                <ul style={{ position: 'absolute', zIndex: 999, width: '100%', background: '#444', listStyle: 'none', padding: 0, margin: 0, border: '2px solid #00ffcc', borderRadius: '4px' }}>
                                    {searchResults.map(c => (
                                        <li key={c.email || c._id} onClick={() => autoFillCustomer(c)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #555', color: 'white' }}>
                                            <strong>{c.clientName}</strong> — {c.email}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <input 
                            type="text" 
                            placeholder="Name" 
                            required 
                            value={formData.clientName} 
                            onChange={e => setFormData({...formData, clientName: e.target.value})} 
                        />
                        <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        <input type="email" placeholder="Customer Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        
                        <label>Service Type:</label>
                        <select className="service-dropdown" value={formData.service} required onChange={e => setFormData({...formData, service: e.target.value})}>
                            <option value="Consultation">Consultation</option>
                            <option value="Ritual">Ritual</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                        
                        <div className="calendar-box">
                           <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
                        </div>

                        <h4>Choose a Time:</h4>
                        <select className="service-dropdown" required onChange={(e) => handleTimeSelection(e.target.value)}>
                            <option value="">-- Choose a Time --</option>
                            {generateTimeSlots().map(slot => (
                                <option key={slot} value={slot} disabled={bookedTimes.includes(slot)}>
                                    {slot} {bookedTimes.includes(slot) ? "(Full)" : ""}
                                </option>
                            ))}
                        </select>

                        <textarea placeholder="Admin Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                        <button type="submit" className="save-btn">Confirm Appointment</button>
                    </form>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr><th>Type</th><th>Client</th><th>Phone</th><th>Email</th><th>Service</th><th>Notes</th><th>Date & Time</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                    {filteredAppointments.map(apt => (
                        <tr key={apt._id}>
                            <td><span className={`badge ${(apt.customerType || 'new').toLowerCase()}`}>{apt.customerType || 'new'}</span></td>
                            <td>{apt.clientName}</td>
                            <td>{apt.phone}</td>
                            <td>{apt.email}</td>
                            <td>{apt.service}</td>
                            <td>{apt.notes}</td>
                            <td>{new Date(apt.date).toLocaleString()}</td>
                            <td>
                                <select value={apt.status || 'Scheduled'} className={`status-select ${apt.status?.toLowerCase() || 'scheduled'}`} onChange={async (e) => {
                                    await axios.patch(`http://localhost:5000/api/admin/appointments/${apt._id}/status`, { status: e.target.value });
                                    fetchData();
                                }}>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Declined">Declined</option>
                                </select>
                            </td>
                            <td>
                                <button className="delete-btn" onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/admin/appointments/${apt._id}`); fetchData(); } }}>Cancel</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Dashboard;