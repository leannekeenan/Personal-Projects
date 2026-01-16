const express = require('express');
const router = express.Router();
// Note the '../' to step out of the modules folder and into models
const Appointment = require('../models/Appointment');

// GET all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;