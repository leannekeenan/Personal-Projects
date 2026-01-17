const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerType: { type: String, default: 'new' }, // Matches your 'new' vs 'returning' logic
  clientName: { type: String, required: true },
  email: { type: String, required: true }, 
  phone: { type: String, required: true }, 
  service: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  consent: { type: Boolean, required: true },
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Completed', 'Declined'], 
    default: 'Scheduled' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);