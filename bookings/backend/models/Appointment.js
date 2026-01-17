const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  price: { type: Number, default: 0 },
  customerType: { type: String, default: 'new' }, // 'new' or 'returning'
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Completed', 'Declined'], 
    default: 'Scheduled' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);