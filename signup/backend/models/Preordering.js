const mongoose = require('mongoose');

const PreorderingSchema = new mongoose.Schema({
  // Customer Details
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  delivery_address: { type: String, required: true },
  phone_number: { type: String, required: true },
  delivery_time: { type: String, required: true },
  special_instructions: { type: String },

  // Order Items (Matches your HTML input names)
  items: {
    vanilla_veil: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cosmic_chocolate: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cinnasphere: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    pb_portal: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cookies_clouds: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    spice_gourdmand: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    aethereal_apple: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    strawberry_starlight: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    pineapple_express: { traveler: Number, adventurer: Number, explorer: Number, quest: Number }
  },
  
  status: { type: String, default: 'New Order' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preordering', PreorderingSchema, 'orders');