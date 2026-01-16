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
 
  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
  
  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
  
  <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

  <select value={service} onChange={(e) => setService(e.target.value)} required>
    <option value="" disabled>Select a Service</option>
    <option value="Consultation">Consultation</option>
    <option value="Haircut">Haircut</option>
    <option value="Coloring">Coloring</option>
  </select>

  {/* The 'step="600"' forces 10-minute increments in many browsers */}
  <input 
    type="datetime-local" 
    step="600" 
    value={date} 
    onChange={(e) => setDate(e.target.value)} 
    required 
  />

  <textarea 
    placeholder="Any special requests or notes?" 
    value={notes} 
    onChange={(e) => setNotes(e.target.value)}
  />

  <label style={{ fontSize: '12px', color: '#ccc' }}>
    <input 
      type="checkbox" 
      checked={consent} 
      onChange={(e) => setConsent(e.target.checked)} 
      required 
    />
    I consent to receive email confirmation and be contacted by the shop.
  </label>

  <button type="submit">Confirm Booking</button>
</form>
    </div>
  )
}

export default App