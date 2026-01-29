const mongoose = require('mongoose');

const PreorderingSchema = new mongoose.Schema({
  // Customer Details
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  delivery_address: { type: String, required: true },
  phone_number: { type: String, required: true },
  delivery_time: { type: String, required: true },
  delivery_date: { type: Date, required: true },
  special_instructions: { type: String },

  // Order Items (Matches your HTML input names)
  items: {
    vanilla_veil: { half: Number, full: Number, cake: Number },
    cosmic_chocolate: { half: Number, full: Number, cake: Number },
    cinnasphere: { half: Number, full: Number, cake: Number },
    pb_portal: { half: Number, full: Number, cake: Number },
    cookies_clouds: { half: Number, full: Number, cake: Number },
    spice_gourdmand: { half: Number, full: Number, cake: Number },
    aethereal_apple: { half: Number, full: Number, cake: Number },
    strawberry_starlight: { half: Number, full: Number, cake: Number },
    pineapple_express: { half: Number, full: Number, cake: Number }
  },
  
  status: { type: String, default: 'New Order' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preordering', PreorderingSchema);