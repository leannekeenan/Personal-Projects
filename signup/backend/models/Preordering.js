const mongoose = require('mongoose');

const preorderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String }, // Useful for your Twilio integration!
  productName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Preorder', preorderSchema);