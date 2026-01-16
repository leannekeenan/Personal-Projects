import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // 1. Initial State includes 'consent: true' to satisfy Database requirements
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

  // 2. Fetches from the /api/admin route
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  // 3. Adds via the /api/appointments route (to trigger emails)
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("✅ Booking added successfully!");
      setShowAddForm(false);
      fetchData(); // Refresh the table
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Check console"));
      console.error(err);
    }
  };

  // 4. Deletes via the /api/admin route
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
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <input 
            type="text" 
            placeholder="Client Name" 
            required 
            onChange={e => setFormData({...formData, clientName: e.target.value})} 
          />
          <input 
            type="datetime-local" 
            required 
            onChange={e => setFormData({...formData, date: e.target.value})} 
          />
          <select onChange={e => setFormData({...formData, service: e.target.value})}>
            <option value="Consultation">Consultation</option>
            <option value="Haircut">Haircut</option>
            <option value="Coloring">Coloring</option>
          </select>
          <button type="submit">Save to Database</button>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td>
              <td>{apt.service}</td>
              <td>{new Date(apt.date).toLocaleString()}</td>
              <td>
                <button onClick={() => deleteAppointment(apt._id)} className="delete-btn">
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;