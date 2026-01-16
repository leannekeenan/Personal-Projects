import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // State handles all required database fields
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

  // Fetches from the /api/admin route
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  // Adds via the main /api/appointments route to trigger email logic
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("✅ Booking added successfully!");
      setShowAddForm(false);
      
      // Reset form to defaults
      setFormData({
        clientName: '',
        email: 'walk-in@example.com',
        phone: '',
        service: 'Consultation',
        date: '',
        notes: 'Phone booking',
        consent: true 
      });

      fetchData(); // Refresh table
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Check server"));
      console.error(err);
    }
  };

  // Deletes via the admin route
  const deleteAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
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
            
            <input 
              type="text" 
              placeholder="Client Name" 
              required 
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})} 
            />

            <input 
              type="tel" 
              placeholder="Phone Number" 
              required 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />

            <input 
              type="email" 
              placeholder="Client Email" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />

            <input 
              type="datetime-local" 
              required 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />
            
            <select 
              value={formData.service}
              onChange={e => setFormData({...formData, service: e.target.value})}
            >
              <option value="Consultation">Consultation</option>
              <option value="One">One</option>
              <option value="Two">Two</option>
            </select>

            <textarea 
              placeholder="Notes (Optional)"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
            
            <button type="submit" className="save-btn">Save to Database</button>
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
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <tr key={apt._id}>
                <td>{apt.clientName}</td>
                <td>{apt.phone}</td>
                <td>{apt.email}</td>
                <td>{apt.service}</td>
                <td>{new Date(apt.date).toLocaleString()}</td>
                <td>
                  <button onClick={() => deleteAppointment(apt._id)} className="delete-btn">
                    Cancel
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No appointments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;