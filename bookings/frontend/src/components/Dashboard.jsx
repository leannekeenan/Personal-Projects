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
  
  const hd = new Holidays('US');

  // Restored: Service is now a single string, defaulted to your first option
  const [formData, setFormData] = useState({
    clientName: '',
    email: '', 
    phone: '',
    service: 'Consultation', 
    date: '', 
    notes: 'Phone booking',
    consent: true 
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const checkAvailability = async () => {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${yyyy}-${mm}-${dd}`);
        setBookedTimes(res.data.map(apt => new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));
      } catch (err) { console.error("Availability error:", err); }
    };
    checkAvailability();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const isHoliday = hd.isHoliday(date);
      return (isHoliday && isHoliday.some(h => h.type === 'public'));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("✅ Appointment added and Email Sent!");
      setShowAddForm(false);
      fetchData();
    } catch (err) { 
      alert("❌ " + (err.response?.data?.message || "Error saving booking")); 
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "+ Add Manual Booking"}
        </button>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <form className="manual-form" onSubmit={handleManualSubmit}>
            <h3>Manual Call-in Entry</h3>
            
            <input type="text" placeholder="Client Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input type="email" placeholder="Customer Email Address" required onChange={e => setFormData({...formData, email: e.target.value})} />
            
            {/* RESTORED: Dropdown Menu */}
            <label>Service Type:</label>
            <select 
              className="service-dropdown"
              value={formData.service} 
              required 
              onChange={e => setFormData({...formData, service: e.target.value})}
            >
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
            </select>
            
            <h4>Select a date:</h4>
            <div className="calendar-box">
               <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} tileDisabled={tileDisabled} />
            </div>

            <h4>Choose a Time:</h4>
            <input type="time" required onChange={e => {
                const [h, m] = e.target.value.split(':');
                const d = new Date(selectedDate); d.setHours(h, m);
                setFormData({...formData, date: d});
            }} />

            {bookedTimes.length > 0 && (
              <div className="booked-warning">Already Booked: {bookedTimes.join(', ')}</div>
            )}
            
            <button type="submit" className="save-btn">Confirm Appointment</button>
          </form>
        </div>
      )}

      {/* Table remains the same */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(apt => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td>
              <td>{apt.phone}</td>
              <td>{apt.email}</td>
              <td>{new Date(apt.date).toLocaleString()}</td>
              <td>
                <button className="delete-btn" onClick={async () => { 
                  if(window.confirm("Are you sure?")) { 
                    await axios.delete(`http://localhost:5000/api/admin/appointments/${apt._id}`); 
                    fetchData(); 
                  } 
                }}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;