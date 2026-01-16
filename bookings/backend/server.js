const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Move this to the top with the other imports
const Appointment = require('./models/Appointment'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Appointment API is running...');
});

// CREATE a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err));

  // Set up the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();

    // Prepare the email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${savedAppointment.email}, ${process.env.SERVICER_EMAIL}`,
      subject: 'Booking Confirmation - Your Shop Name',
      text: `Hello ${savedAppointment.clientName},\n\nYour appointment for ${savedAppointment.service} on ${new Date(savedAppointment.date).toLocaleString()} has been confirmed!\n\nNotes: ${savedAppointment.notes || 'None'}\n\nSee you soon!`
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});