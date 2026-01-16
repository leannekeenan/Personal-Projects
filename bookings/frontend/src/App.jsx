import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/appointments', {
        clientName: name,
        service: service,
        date: date
      });
      alert('Appointment Booked Successfully!');
      console.log(response.data);
    } catch (err) {
      alert('Error booking appointment');
      console.error(err);
    }
  }

  return (
    <div className="App">
      <h1>Book an Appointment</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Service" value={service} onChange={(e) => setService(e.target.value)} required />
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button type="submit">Submit Booking</button>
      </form>
    </div>
  )
}

export default App