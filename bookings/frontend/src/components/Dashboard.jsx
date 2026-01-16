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
    email: 'walk-in@example.com', 
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
      } catch (err) { console.error(err); }
    };
    checkAvailability();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      setAppointments(res.data);
    } catch (err) { console.error(err); }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const isHoliday = hd.isHoliday(date);
      return date.getDay() === 0 || date.getDay() === 6 || (isHoliday && isHoliday.some(h => h.type === 'public'));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("✅ Added!");
      setShowAddForm(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Manager</h1>
        <button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Close" : "+ Add Call-in"}</button>
      </div>

      {showAddForm && (
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
          <input type="tel" placeholder="Phone" required onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} tileDisabled={tileDisabled} />
          <input type="time" required onChange={e => {
            const [h, m] = e.target.value.split(':');
            const d = new Date(selectedDate); d.setHours(h, m);
            setFormData({...formData, date: d});
          }} />
          {bookedTimes.length > 0 && <p className="warning">Booked: {bookedTimes.join(', ')}</p>}
          <button type="submit">Save Booking</button>
        </form>
      )}

      <table className="admin-table">
        <thead><tr><th>Client</th><th>Phone</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {appointments.map(apt => (
            <tr key={apt._id}>
              <td>{apt.clientName}</td><td>{apt.phone}</td>
              <td>{new Date(apt.date).toLocaleString()}</td>
              <td><button onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/admin/appointments/${apt._id}`); fetchData(); } }}>Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;