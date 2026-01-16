import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import './App.css'; 

function PublicBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedTimes, setBookedTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    email: '', 
    phone: '',
    service: 'Consultation',
    date: '', 
    notes: '',
    consent: false 
  });

  // 2026 Holiday List
  const holidays = [
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25", 
    "2026-06-19", "2026-07-04", "2026-09-07", "2026-10-12", 
    "2026-11-11", "2026-11-26", "2026-12-25"
  ];

  // Check availability when a user picks a date
  useEffect(() => {
    const checkAvailability = async () => {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
        const times = res.data.map(apt => 
          new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        setBookedTimes(times);
      } catch (err) {
        console.error("Availability check failed");
      }
    };
    checkAvailability();
  }, [selectedDate]);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      return holidays.includes(dateString) || date.getDay() === 0; // Disables holidays + Sundays
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return alert("Please select a specific time!");
    if (!formData.consent) return alert("You must agree to the terms.");

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      alert("Success! Your appointment is booked. Check your email for confirmation.");
      window.location.reload(); // Reset the form
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Booking failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <h1>Book Your Appointment</h1>
      <p>Select a date and time below. We are closed on major holidays.</p>

      

      <form className="public-booking-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" required 
          onChange={e => setFormData({...formData, clientName: e.target.value})} />

        <input type="email" placeholder="Email Address" required 
          onChange={e => setFormData({...formData, email: e.target.value})} />

        <input type="tel" placeholder="Phone Number" required 
          onChange={e => setFormData({...formData, phone: e.target.value})} />

        <div className="calendar-section">
          <label>Choose a Date:</label>
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate} 
            minDate={new Date()} 
            tileDisabled={tileDisabled} 
          />
        </div>

        <div className="time-section">
          <label>Choose a Time:</label>
          <input type="time" required 
            onChange={e => {
              const [hours, minutes] = e.target.value.split(':');
              const fullDate = new Date(selectedDate);
              fullDate.setHours(hours, minutes);
              setFormData({...formData, date: fullDate});
            }} 
          />
        </div>

        {bookedTimes.length > 0 && (
          <div className="booked-slots-notice">
            <strong>Note:</strong> The following times are already taken today:
            <ul>{bookedTimes.map(t => <li key={t}>{t}</li>)}</ul>
          </div>
        )}

        <div className="consent-section">
          <label>
            <input type="checkbox" required 
              onChange={e => setFormData({...formData, consent: e.target.checked})} />
            I agree to receive a confirmation email.
          </label>
        </div>

        <button type="submit" disabled={isSubmitting} className="book-btn">
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default PublicBooking;