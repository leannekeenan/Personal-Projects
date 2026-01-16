import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  // State for the "Manual Add" form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: 'walk-in@example.com', // Default for call-ins
    phone: '',
    service: 'Consultation',
    date: '',
    new: false,
    notes: 'Phone booking'
  });

  useEffect(() => {
    fetchData();
  }, []);

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
    try {
      // We send this to the regular POST route we already created!
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("Booking added successfully");
      setShowAddForm(false);
      fetchData(); // Refresh table
    } catch (err) {
      alert("Error adding booking");
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm("Delete this booking?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/appointments/${id}`);
        fetchData();
      } catch (err) {
        alert("Error deleting");
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Appointment Manager</h1>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "+ Add Call-in"}
        </button>
      </div>

      {showAddForm && (
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
          <input type="tel" placeholder="Phone" onChange={e => setFormData({...formData, phone: e.target.value})} />
          <select onChange={e => setFormData({...formData, service: e.target.value})}>
            <option value="Consultation">Consultation</option>
            <option value="Haircut">Haircut</option>
            <option value="Coloring">Coloring</option>
          </select>
          <input type="datetime-local" required onChange={e => setFormData({...formData, date: e.target.value})} />
          <button type="submit">Save Booking</button>
        </form>
      )}

      <table className="admin-table">
        {/* ... (Same table structure as before) ... */}
        <thead>
          <tr>
            <th>Client</th>
            <th>Service</th>
            <th>Date & Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td>
              <td>{apt.service}</td>
              <td>{new Date(apt.date).toLocaleString()}</td>
              <td>
                <button onClick={() => deleteAppointment(apt._id)} className="delete-btn">Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;