const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Appointment = require('./models/Appointment'); 

// Check your folder name: if your file is in 'models/Admin.js', use './models/Admin'
// If you moved it to a folder called 'modules', change this to './modules/Admin'
const adminRoutes = require('./models/Admin'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Set up the email transporter
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

    // 2. Attempt to send the notification email
    try {
      const { clientName, email, phone, service, date, notes } = savedAppointment;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: `New Booking: ${clientName}`,
        text: `
          New Appointment Details:
          --------------------------
          Client: ${clientName}
          Phone: ${phone}
          Service: ${service}
          Date: ${new Date(date).toLocaleString()}
          Notes: ${notes || 'None'}
          Email: ${email}
          --------------------------
        `,
        replyTo: email === 'walk-in@example.com' ? process.env.EMAIL_USER : email 
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Notification email sent");
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
    }

    res.status(201).json(savedAppointment);

  } catch (err) {
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