import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import Holidays from 'date-holidays';
import 'react-calendar/dist/Calendar.css'; 
import '../App.css'; 

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedTimes, setBookedTimes] = useState([]);
  
  // FILTER STATES
  const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState(''); // Added Search State
  
  const hd = new Holidays('US');

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

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

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
    } catch (err) { alert("❌ " + (err.response?.data?.message || "Error saving booking")); }
  };

  // MULTI-FIELD FILTER LOGIC: Handles both Radios and Search Bar
  const filteredAppointments = appointments.filter(apt => {
    // 1. Check Radio Button (New/Returning)
    const matchesType = filterType === 'all' || apt.customerType === filterType;
    
    // 2. Check Search Bar (Name, Service, or Email)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
        apt.clientName.toLowerCase().includes(searchLower) || 
        apt.service.toLowerCase().includes(searchLower) ||
        apt.email.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-filters-bar" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
            {/* SEARCH INPUT FIELD */}
            <input 
                type="text" 
                className="search-input"
                placeholder="Search name, service, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '250px' }}
            />

            <div className="admin-controls" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div className="filter-group">
                    <span>Filter List: </span>
                    <label><input type="radio" name="filter" checked={filterType === 'all'} onChange={() => setFilterType('all')} /> All</label>
                    <label style={{marginLeft: '10px'}}><input type="radio" name="filter" checked={filterType === 'new'} onChange={() => setFilterType('new')} /> New</label>
                    <label style={{marginLeft: '10px'}}><input type="radio" name="filter" checked={filterType === 'returning'} onChange={() => setFilterType('returning')} /> Returning</label>
                </div>
                <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? "Close Form" : "+ Add Manual Booking"}
                </button>
            </div>
        </div>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <form className="manual-form" onSubmit={handleManualSubmit}>
            <h3>Manual Call-in Entry</h3>
            
            <div className="radio-selection">
                <label>
                    <input type="radio" name="custType" value="new" checked={formData.customerType === 'new'} onChange={e => setFormData({...formData, customerType: e.target.value})} /> New Customer
                </label>
                <label style={{marginLeft: '15px'}}>
                    <input type="radio" name="custType" value="returning" checked={formData.customerType === 'returning'} onChange={e => setFormData({...formData, customerType: e.target.value})} /> Returning Customer
                </label>
            </div>

            <input type="text" placeholder="Client Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="email" placeholder="Customer Email Address" required onChange={e => setFormData({...formData, email: e.target.value})} />
            
            <label>Service Type:</label>
            <select className="service-dropdown" value={formData.service} required onChange={e => setFormData({...formData, service: e.target.value})}>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
            </select>
            
            <div className="calendar-box">
               <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
            </div>

            <h4>Choose a Time (15 min intervals):</h4>
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
          <tr>
            <th>Type</th>
            <th>Client</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Service</th>
            <th>Notes</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(apt => (
              <tr key={apt._id}>
                <td><span className={`badge ${apt.customerType || 'new'}`}>{apt.customerType || 'new'}</span></td>
                <td>{apt.clientName}</td>
                <td>{apt.phone}</td>
                <td>{apt.email}</td>
                <td>{apt.service}</td>
                <td>{apt.notes}</td>
                <td>{new Date(apt.date).toLocaleString()}</td>
                <td>
                  <button className="delete-btn" onClick={async () => { 
                    if(window.confirm("Delete this appointment?")) { 
                      await axios.delete(`http://localhost:5000/api/admin/appointments/${apt._id}`); 
                      fetchData(); 
                    } 
                  }}>Cancel</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>No appointments found matching your search.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;