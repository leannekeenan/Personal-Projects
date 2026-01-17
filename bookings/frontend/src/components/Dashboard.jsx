import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css'; 
import '../App.css'; 

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [appointments, setAppointments] = useState([]);
    const [customers, setCustomers] = useState([]); 
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookedTimes, setBookedTimes] = useState([]);
    const [filterType, setFilterType] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [crmSearch, setCrmSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '', email: '', phone: '', service: 'Consultation', 
        date: '', notes: '', consent: true, customerType: 'new' 
    });

    useEffect(() => {
        if (localStorage.getItem('isAdmin') !== 'true') navigate('/login');
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const aptRes = await axios.get('http://localhost:5000/api/admin/appointments');
            setAppointments(Array.isArray(aptRes.data) ? aptRes.data : []);
            const custRes = await axios.get('http://localhost:5000/api/admin/customers');
            setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
        } catch (err) { console.error("Fetch error:", err); }
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            const d = selectedDate;
            const dateStr = d.toISOString().split('T')[0];
            try {
                const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${dateStr}`);
                const counts = {};
                (res.data || []).forEach(a => {
                    const t = new Date(a.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    counts[t] = (counts[t] || 0) + 1;
                });
                setBookedTimes(Object.keys(counts).filter(t => counts[t] >= 2));
            } catch (e) { console.error(e); }
        };
        fetchAvailability();
    }, [selectedDate]);

    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 8; h < 18; h++) {
            ['00', '15', '30', '45'].forEach(m => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                slots.push(`${h12}:${m} ${ampm}`);
            });
        }
        return slots;
    };

    const handleTimeSelection = (timeStr) => {
        if (!timeStr) return;
        const [time, modifier] = timeStr.split(' ');
        let [hrs, mins] = time.split(':');
        if (hrs === '12') hrs = '00';
        if (modifier === 'PM') hrs = parseInt(hrs, 10) + 12;
        const newD = new Date(selectedDate);
        newD.setHours(parseInt(hrs, 10), parseInt(mins, 10), 0, 0);
        setFormData({ ...formData, date: newD });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date) return alert("Select a time.");
        try {
            await axios.post('http://localhost:5000/api/appointments', formData);
            alert("✅ Added!");
            setShowAddForm(false);
            fetchData();
        } catch (err) { alert("❌ Error"); }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesType = filterType === 'all' || (apt.customerType || 'new') === filterType;
        const s = searchTerm.toLowerCase();
        return matchesType && (apt.clientName?.toLowerCase().includes(s) || apt.email?.toLowerCase().includes(s));
    });

    return (
        <div className="admin-container">
            <div className="admin-nav" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', borderBottom: '1px solid #444', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => navigate('/admin')}>📅 Dashboard</button>
                    <button className={`nav-btn ${location.pathname === '/crm' ? 'active' : ''}`} onClick={() => navigate('/crm')}>👥 CRM</button>
                    <button className={`nav-btn ${location.pathname === '/analytics' ? 'active' : ''}`} onClick={() => navigate('/analytics')}>📈 Analytics</button>
                </div>
                <div>
                    <button className="delete-btn" onClick={() => { localStorage.removeItem('isAdmin'); navigate('/login'); }}>🔒 Lock Grimoire</button>
                </div>
            </div>

            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div className="filter-group">
                        <span style={{color: 'white', marginRight: '10px'}}>Filter List:</span>
                        <div>
                            <label><input type="radio" name="filter" checked={filterType === 'all'} onChange={() => setFilterType('all')} /> All</label>
                            <label><input type="radio" name="filter" checked={filterType === 'new'} onChange={() => setFilterType('new')} /> New</label>
                            <label><input type="radio" name="filter" checked={filterType === 'returning'} onChange={() => setFilterType('returning')} /> Returning</label>
                        </div>
                    </div>
                    <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Close" : "+ Manual Booking"}</button>
                </div>
            </div>

            <input type="text" className="search-input" placeholder="Search appointments..." onChange={e => setSearchTerm(e.target.value)} />

            {showAddForm && (
                <div className="form-overlay">
                    <form className="manual-form" onSubmit={handleManualSubmit}>
                        <input type="text" placeholder="Quick Search CRM..." onChange={e => { setCrmSearch(e.target.value); setShowSuggestions(true); }} />
                        {showSuggestions && crmSearch.length > 1 && (
                            <ul className="suggestions">
                                {customers.filter(c => c.clientName.toLowerCase().includes(crmSearch.toLowerCase())).map(c => (
                                    <li key={c.email} onClick={() => { 
                                        setFormData({...formData, clientName: c.clientName, email: c.email, phone: c.phone, customerType: 'returning'});
                                        setShowSuggestions(false);
                                    }}>{c.clientName} ({c.email})</li>
                                ))}
                            </ul>
                        )}
                        <input type="text" placeholder="Name" value={formData.clientName} required onChange={e => setFormData({...formData, clientName:e.target.value})} />
                        <input type="email" placeholder="Email" value={formData.email} required onChange={e => setFormData({...formData, email:e.target.value})} />
                        <input type="tel" placeholder="Phone" value={formData.phone} required onChange={e => setFormData({...formData, phone:e.target.value})} />
                        <Calendar onChange={setSelectedDate} value={selectedDate} />
                        <select required onChange={e => handleTimeSelection(e.target.value)}>
                            <option value="">Select Time</option>
                            {generateTimeSlots().map(s => <option key={s} value={s} disabled={bookedTimes.includes(s)}>{s}</option>)}
                        </select>
                        <button type="submit" className="save-btn">Confirm</button>
                    </form>
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAppointments.map(apt => (
                        <tr key={apt._id}>
                            <td>{apt.customerType}</td>
                            <td>{apt.clientName}</td>
                            <td>{apt.service}</td>
                            <td>{new Date(apt.date).toLocaleString()}</td>
                            <td>
                                <select value={apt.status || 'Scheduled'} onChange={async (e) => {
                                    await axios.patch(`http://localhost:5000/api/admin/appointments/${apt._id}/status`, { status: e.target.value });
                                    fetchData();
                                }}>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Declined">Declined</option>
                                </select>
                            </td>
                            <td><button onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/admin/appointments/${apt._id}`); fetchData(); } }}>X</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Dashboard;