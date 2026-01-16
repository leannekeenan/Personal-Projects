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
  <div className="booking-container">
    <h1>Book an Appointment</h1>
    
    <form className="booking-form" onSubmit={handleSubmit}>
      {/* New Client Toggle */}
      <div className="form-section status-toggle">
        <p>Have you visited us before?</p>
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="newClient" 
              checked={isNewClient === false} 
              onChange={() => setIsNewClient(false)} 
            /> Returning Client
          </label>
          <label>
            <input 
              type="radio" 
              name="newClient" 
              checked={isNewClient === true} 
              onChange={() => setIsNewClient(true)} 
            /> I'm New!
          </label>
        </div>
      </div>

      {/* Contact Info */}
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      {/* Service Selection */}
      <select value={service} onChange={(e) => setService(e.target.value)} required>
        <option value="" disabled>Select a Service</option>
        <option value="Consultation">Consultation</option>
        <option value="Haircut">Haircut</option>
        <option value="Coloring">Coloring</option>
      </select>

      {/* Date and Time */}
      <input type="datetime-local" step="600" value={date} onChange={(e) => setDate(e.target.value)} required />

      <textarea placeholder="Special requests or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />

      {/* Consent */}
      <label className="checkbox-label">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>I consent to be contacted by the shop regarding this booking.</span>
      </label>

      <button type="submit" className="submit-btn">Confirm Booking</button>
    </form>
  </div>
);
}

export default App