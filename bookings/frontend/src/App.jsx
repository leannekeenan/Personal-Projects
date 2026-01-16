import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import Holidays from 'date-holidays';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard'; 
import CRM from './components/CRM';
import 'react-calendar/dist/Calendar.css';
import './App.css';

// --- CLIENT FACING BOOKING COMPONENT ---
function BookingForm() {
    const [customerType, setCustomerType] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookedTimes, setBookedTimes] = useState([]);
    const [formData, setFormData] = useState({ 
        clientName: '', 
        email: '', 
        phone: '', 
        service: 'Consultation', 
        notes: '', 
        date: '', 
        consent: false 
    });
    
    const hd = new Holidays('US');

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            ['00', '15', '30', '45'].forEach(min => {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                slots.push(`${hour12}:${min} ${ampm}`);
            });
        }
        return slots;
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            try {
                const res = await axios.get(`http://localhost:5000/api/appointments/check?date=${formattedDate}`);
                const counts = {};
                res.data.forEach(a => {
                    const time = new Date(a.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    counts[time] = (counts[time] || 0) + 1;
                });
                const blocked = Object.keys(counts).filter(time => counts[time] >= 2);
                setBookedTimes(blocked);
            } catch (e) { console.error("API Error", e); }
        };
        fetchAvailability();
    }, [selectedDate]);

    const handleTimeSelection = (timeStr) => {
        if (!timeStr) return;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        const updatedDate = new Date(selectedDate);
        updatedDate.setHours(hours, minutes, 0, 0);
        setFormData({ ...formData, date: updatedDate });
    };

    const isDateDisabled = ({ date }) => {
        const holiday = hd.isHoliday(date);
        return (holiday && holiday.some(h => h.type === 'public'));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date) {
            alert("Please select a time slot.");
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/appointments', {
                ...formData,
                customerType: customerType // Pass the type chosen at the start
            });
            alert("✅ Booking Confirmed! A confirmation email has been sent.");
            window.location.reload();
        } catch (err) { alert(err.response?.data?.message || "Error"); }
    };

    if (customerType === null) {
        return (
            <div className="booking-container choice-container">
                <h2>Welcome! Please select an option:</h2>
                <div className="button-group">
                    <button className="choice-btn" onClick={() => setCustomerType('new')}>
                        I am a New Customer
                    </button>
                    <button className="choice-btn" onClick={() => setCustomerType('returning')}>
                        I am a Returning Customer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-container">
            <button className="back-btn" onClick={() => setCustomerType(null)}>← Back</button>
            <h2>{customerType === 'new' ? 'New Customer Booking' : 'Returning Customer Booking'}</h2>
            <form onSubmit={handleFormSubmit}>
                <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, clientName: e.target.value})} />
                <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="tel" placeholder="Phone" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                <label className="field-label">Select Service:</label>
                <select className="service-dropdown" value={formData.service} required onChange={e => setFormData({...formData, service: e.target.value})}>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                </select>

                <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} tileDisabled={isDateDisabled} />
                
                <label className="field-label">Select Appointment Time:</label>
                <select className="service-dropdown" required onChange={(e) => handleTimeSelection(e.target.value)}>
                    <option value="">-- Choose a Time --</option>
                    {generateTimeSlots().map(slot => (
                        <option key={slot} value={slot} disabled={bookedTimes.includes(slot)}>
                            {slot} {bookedTimes.includes(slot) ? "(Fully Booked)" : ""}
                        </option>
                    ))}
                </select>

                <textarea placeholder="Notes (optional)" onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>

                <label className="consent-label">
                    <input type="checkbox" required onChange={e => setFormData({...formData, consent: e.target.checked})} /> 
                    I Consent to accept a confirmation email regarding my booking
                </label>
                
                <button type="submit">Confirm</button>
            </form>
        </div>
    );
}

// --- MAIN APP ROUTER ---
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<BookingForm />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/crm" element={<CRM />} />
      </Routes>
    </Router>
  );
}