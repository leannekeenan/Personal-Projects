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

  const [formData, setFormData] = useState({
    clientName: '',
    email: '', 
    phone: '',
    service: 'Consultation', 
    date: '', 
    notes: '', 
    consent: true 
  });

  useEffect(() => { fetchData(); }, []);

  // RESTORED & UPDATED: Capacity-aware availability check
  useEffect(() => {
    const fetchAvailability = async () => {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        try {
            const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
            
            // Count occurrences of each time slot
            const counts = {};
            res.data.forEach(a => {
                const time = new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                counts[time] = (counts[time] || 0) + 1;
            });

            // Only "block" the time if it has been booked 2 or more times
            const blocked = Object.keys(counts).filter(time => counts[time] >= 2);
            setBookedTimes(blocked);
        } catch (e) { console.error("API Error", e); }
    };
    fetchAvailability();
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
    
    // Safety check for Admin manual entry
    const timeString = new Date(formData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (bookedTimes.includes(timeString)) {
        alert(`❌ This slot (${timeString}) is already at max capacity (2 bookings).`);
        return;
    }

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

            <textarea 
                placeholder="Admin Notes (e.g., Phone booking details)" 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>

            {/* This will now only show times that have hit the 2-person limit */}
            {bookedTimes.length > 0 && (
              <div className="booked-warning">Fully Booked (2/2): {bookedTimes.join(', ')}</div>
            )}
            
            <button type="submit" className="save-btn">Confirm Appointment</button>
          </form>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
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
          {appointments.map(apt => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td>
              <td>{apt.phone}</td>
              <td>{apt.email}</td>
              <td>{apt.service}</td>
              <td>{apt.notes}</td>
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