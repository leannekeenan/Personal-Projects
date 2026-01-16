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
        clientName: '', email: '', phone: '', service: 'Consultation', date: '', consent: false 
    });
    
    const hd = new Holidays('US');

    useEffect(() => {
        const fetchAvailability = async () => {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            try {
                const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
                setBookedTimes(res.data.map(a => new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));
            } catch (e) { console.error("API Error", e); }
        };
        fetchAvailability();
    }, [selectedDate]);

    const isDateDisabled = ({ date }) => {
        const holiday = hd.isHoliday(date);
        return (holiday && holiday.some(h => h.type === 'public'));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/appointments', formData);
            alert("✅ Booking Confirmed");
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
                
                <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} tileDisabled={isDateDisabled} />
                
                <input type="time" required onChange={e => {
                    const [h, m] = e.target.value.split(':');
                    const d = new Date(selectedDate); d.setHours(h, m);
                    setFormData({...formData, date: d});
                }} />

                {bookedTimes.length > 0 && <div className="booked-list">Taken: {bookedTimes.join(', ')}</div>}
                <label><input type="checkbox" required onChange={e => setFormData({...formData, consent: e.target.checked})} /> I Consent to accept a confirmation email regarding my booking</label>
                <button type="submit">Confirm</button>
            </form>
        </div>
    );
}