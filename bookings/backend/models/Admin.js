const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// 1. GET all appointments 
// Changed sort to { _id: -1 } which is a reliable way to show newest first 
// even if you haven't enabled timestamps in your Schema yet.
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ _id: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DELETE an appointment by ID
router.delete('/appointments/:id', async (req, res) => {
  try {
    const deletedItem = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;