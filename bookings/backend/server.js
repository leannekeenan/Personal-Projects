const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); 
const twilio = require('twilio'); // NEW
require('dotenv').config();

const Appointment = require('./models/Appointment'); 

const app = express();
const hd = new Holidays('US'); 

// --- TWILIO CONFIGURATION ---
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    try {
        const cleanedPhone = to.replace(/\D/g, '');
        const formattedPhone = cleanedPhone.startsWith('1') ? `+${cleanedPhone}` : `+1${cleanedPhone}`;
        
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log(`🚀 SMS Sent to ${formattedPhone}`);
    } catch (error) {
        console.error("❌ Twilio Error:", error.message);
    }
};

app.use(cors());
app.use(express.json());

// ... (Keep your Email Transporter and Admin Login routes as they are) ...

// --- 1. APPOINTMENT BOOKING & AVAILABILITY ---

app.post('/api/appointments', async (req, res) => {
  try {
    const bookingDate = new Date(req.body.date);
    const holidayCheck = hd.isHoliday(bookingDate);
    
    if (holidayCheck && holidayCheck.some(h => h.type === 'public')) {
      return res.status(400).json({ message: "Closed on holidays." });
    }

    const existingCount = await Appointment.countDocuments({ date: bookingDate });
    if (existingCount >= 2) return res.status(400).json({ message: "Slot full." });

    const newAppointment = new Appointment(req.body);
    const saved = await newAppointment.save();

    // --- TRIGGER SMS REMINDER ---
    const dateString = new Date(saved.date).toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const smsText = `Hi ${saved.clientName}, your ${saved.service} at Grimoire is confirmed for ${dateString}. See you then!`;
    
    await sendSMS(saved.phone, smsText);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ... (Rest of your routes: /api/admin/customers, etc.) ...

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running with SMS enabled on port ${PORT}`)))
  .catch(err => console.error("Database connection error:", err));