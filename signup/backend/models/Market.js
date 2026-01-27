const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
    isOpen: { type: Boolean, default: false },
    inventory: { type: Number, default: 192 }
});

module.exports = mongoose.model('Market', MarketSchema);