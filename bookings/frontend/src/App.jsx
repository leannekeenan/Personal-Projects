import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import Holidays from 'date-holidays';
import 'react-calendar/dist/Calendar.css';
import './App.css';

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookedTimes, setBookedTimes] = useState([]);
    const [formData, setFormData] = useState({ 
        clientName: '', 
        email: '', 
        phone: '', 
        service: 'Consultation', // Default selection
        notes: '', // Added notes to state
        date: '', 
        consent: false 
    });
    
    const hd = new Holidays('US');

    useEffect(() => {
        const fetchAvailability = async () => {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            try {
                const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
                
                // Count occurrences of each time slot
                const counts = {};
                res.data.forEach(a => {
                    const time = new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    counts[time] = (counts[time] || 0) + 1;
                });

                // Only "block" the time if it has been booked 2 or more times
                const blocked = Object.keys(counts).filter(time => counts[time] >= 2);
                setBookedTimes(blocked);
            } catch (e) { console.error("API Error", e); }
        };
        fetchAvailability();
    }, [selectedDate]);

    const isDateDisabled = ({ date }) => {
        const holiday = hd.isHoliday(date);
        // Weekends are enabled; only public holidays are disabled
        return (holiday && holiday.some(h => h.type === 'public'));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const d = new Date(formData.date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Enforce 8 AM to 6 PM Operating Hours
        if (hours < 8 || hours >= 18) {
            alert("❌ Please choose a time between 8:00 AM and 6:00 PM.");
            return;
        }

        // Enforce 15-Minute Intervals
        if (![0, 15, 30, 45].includes(minutes)) {
            alert("❌ Appointments must be booked in 15-minute increments (e.g., :00, :15, :30, :45).");
            return;
        }

        // Prevent Double Booking (Max 2 slots)
        if (bookedTimes.includes(timeString)) {
            alert(`❌ The ${timeString} slot is fully booked. Please choose another time.`);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/appointments', formData);
            alert("✅ Booking Confirmed! A confirmation email has been sent.");
            window.location.reload();
        } catch (err) { alert(err.response?.data?.message || "Error"); }
    };

    return (
        <div className="booking-container">
            <h2>Book Appointment</h2>
            <form onSubmit={handleFormSubmit}>
                <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
                <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="tel" placeholder="Phone" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                {/* RESTORED: Service Dropdown for Customer */}
                <label className="field-label">Select Service:</label>
                <select 
                    className="service-dropdown"
                    value={formData.service} 
                    required 
                    onChange={e => setFormData({...formData, service: e.target.value})}
                >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                </select>

                <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} tileDisabled={isDateDisabled} />
                
                <input type="time" required onChange={e => {
                    const [h, m] = e.target.value.split(':');
                    const d = new Date(selectedDate); d.setHours(h, m);
                    setFormData({...formData, date: d});
                }} />

                {/* Notes Textarea */}
                <textarea 
                    placeholder="Notes (optional)" 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                ></textarea>

                {bookedTimes.length > 0 && <div className="booked-list">Fully Booked (2/2): {bookedTimes.join(', ')}</div>}
                
                <label className="consent-label">
                    <input type="checkbox" required onChange={e => setFormData({...formData, consent: e.target.checked})} /> 
                    I Consent to accept a confirmation email regarding my booking
                </label>
                
                <button type="submit">Confirm</button>
            </form>
        </div>
    );
}