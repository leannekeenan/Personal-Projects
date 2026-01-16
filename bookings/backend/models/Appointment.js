const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  new: { type: Boolean, default: false }, // "New client" indicator
  clientName: { type: String, required: true },
  email: { type: String, required: true }, 
  phone: { type: String, required: true }, 
  service: { type: String, required: true },
  date: { type: Date, required: true },
  consent: { type: Boolean, required: true }, 
  notes: { type: String }, // "Standard question" for extra info
  consent: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);