const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Appointment API is running...');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (We will add the URI to .env next)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err));

// add a "POST" route to create a new appointment

  const Appointment = require('./models/Appointment'); // Import the model we made

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