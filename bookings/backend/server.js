const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Appointment = require('./models/Appointment'); 

const adminRoutes = require('./modules/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Set up the email transporter
// This uses the credentials from your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Appointment API is running...');
});

// SINGLE POST route handling Database Save and Email Notification
app.post('/api/appointments', async (req, res) => {
  try {
    // 1. Attempt to save the appointment to MongoDB
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    console.log("✅ Appointment saved to Database");

    // 2. Attempt to send the confirmation email
    // We wrap this in its own try/catch so an email failure doesn't crash the whole request
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: `${savedAppointment.email}, ${process.env.SERVICER_EMAIL}`,
        subject: 'Booking Confirmation - Your Shop Name',
        text: `Hello ${savedAppointment.clientName},\n\nYour appointment for ${savedAppointment.service} on ${new Date(savedAppointment.date).toLocaleString()} has been confirmed!\n\nNotes: ${savedAppointment.notes || 'None'}\n\nSee you soon!`
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Confirmation email sent");
    } catch (emailErr) {
      // This will print to your VS Code terminal if Google rejects the login
      console.error("❌ Email failed to send, but database is fine:", emailErr.message);
    }

    // 3. Send success response to the React Frontend
    res.status(201).json(savedAppointment);

  } catch (err) {
    // This block only runs if the Database save itself fails
    console.error("❌ Critical Database Error:", err.message);
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