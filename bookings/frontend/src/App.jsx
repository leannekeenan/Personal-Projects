import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // 1. All State Hooks (Tracking your new inputs)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  // 2. Updated Submit Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/appointments', {
        clientName: name,
        email: email,
        phone: phone,
        service: service,
        date: date,
        new: isNewClient, // This matches your schema "new" field
        notes: notes,
        consent: consent
      });
      alert('✅ Appointment Booked Successfully!');
      console.log(response.data);
    } catch (err) {
      alert('❌ Error booking appointment');
      console.error(err);
    }
  }

  // 3. Clean HTML Structure (Separation of Concerns)
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
          <option value="one">One</option>
          <option value="two">Two</option>
        </select>

        {/* Date and Time (Step 600 = 10 mins) */}
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

export default App;