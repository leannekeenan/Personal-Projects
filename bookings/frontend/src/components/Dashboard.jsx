import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import '../App.css'; 

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedTimes, setBookedTimes] = useState([]);
  
  const [formData, setFormData] = useState({
    clientName: '',
    email: 'walk-in@example.com', 
    phone: '',
    service: 'Consultation',
    date: '', 
    notes: 'Phone booking',
    consent: true 
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch taken times whenever the user clicks a new date on the calendar
  useEffect(() => {
    const checkTakenTimes = async () => {
      try {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
        
        // Format the times (e.g., "10:30 AM") for display
        const times = res.data.map(apt => 
          new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        setBookedTimes(times);
      } catch (err) {
        console.error("Error checking availability", err);
      }
    };

    checkTakenTimes();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return alert("Please select a time!");

    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("✅ Booking added successfully!");
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Check server"));
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/appointments/${id}`);
        fetchData(); 
      } catch (err) {
        alert("Error deleting appointment");
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Appointment Manager</h1>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close" : "+ Add Call-in"}
        </button>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <form className="manual-form" onSubmit={handleManualSubmit}>
            <h3>New Manual Booking</h3>
            
            <input type="text" placeholder="Client Name" required 
              onChange={e => setFormData({...formData, clientName: e.target.value})} />

            <input type="tel" placeholder="Phone Number" required 
              onChange={e => setFormData({...formData, phone: e.target.value})} />

            <div className="calendar-box">
              <label>1. Pick Date:</label>
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate} 
                minDate={new Date()} 
              />
            </div>

            <div className="time-box">
              <label>2. Pick Time:</label>
              <input type="time" required 
                onChange={e => {
                  const [hours, minutes] = e.target.value.split(':');
                  const updatedDate = new Date(selectedDate);
                  updatedDate.setHours(hours, minutes);
                  setFormData({...formData, date: updatedDate});
                }} 
              />
            </div>

            {bookedTimes.length > 0 && (
              <div className="booked-warning">
                ⚠️ Already booked on this day: {bookedTimes.join(', ')}
              </div>
            )}

            <select onChange={e => setFormData({...formData, service: e.target.value})}>
              <option value="Consultation">Consultation</option>
              <option value="Service One">Service One</option>
              <option value="Service Two">Service Two</option>
            </select>

            <button type="submit" className="save-btn">Save Appointment</button>
          </form>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Phone</th>
            <th>Service</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td>
              <td>{apt.phone}</td>
              <td>{apt.service}</td>
              <td>{new Date(apt.date).toLocaleString()}</td>
              <td><button onClick={() => deleteAppointment(apt._id)} className="delete-btn">Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;