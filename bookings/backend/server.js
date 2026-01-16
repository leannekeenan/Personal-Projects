const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); // Added
require('dotenv').config();

const Appointment = require('./models/Appointment'); 
const adminRoutes = require('./models/Admin'); 

const app = express();
const hd = new Holidays('US'); // Initialize US Holidays

app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Check availability for a specific date
app.get('/api/appointments/check', async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const takenSlots = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).select('date -_id');

    res.json(takenSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save booking with Holiday/Weekend Protection
app.post('/api/appointments', async (req, res) => {
  try {
    const bookingDate = new Date(req.body.date);
    
    // Server-side validation
    const holidayCheck = hd.isHoliday(bookingDate);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;
    const isHoliday = holidayCheck && holidayCheck.some(h => h.type === 'public');

    if (isWeekend || isHoliday) {
      return res.status(400).json({ message: "We are closed on weekends and holidays." });
    }

    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();

    try {
      const { clientName, email, phone, service, date, notes } = savedAppointment;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: `New Booking: ${clientName}`,
        text: `Client: ${clientName}\nPhone: ${phone}\nService: ${service}\nDate: ${new Date(date).toLocaleString()}\nNotes: ${notes || 'None'}`,
        replyTo: email === 'walk-in@example.com' ? process.env.EMAIL_USER : email 
      };
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err));