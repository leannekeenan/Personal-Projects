const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    isPaid: { type: Boolean, default: false },
    marketDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);