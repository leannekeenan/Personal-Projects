const mongoose = require('mongoose');

const PreorderingSchema = new mongoose.Schema({
  // Customer Details
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  phone_number: { type: String, required: true },
  delivery_time: { type: String, required: true },
  special_instructions: { type: String },

  // Order Items
  items: {
    vanilla_veil: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cosmic_chocolate: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cinnasphere: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    pb_portal: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    cookies_clouds: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    spice_gourdmand: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    aethereal_apple: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    strawberry_starlight: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    pineapple_express: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    peachy_keen: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    mango_mantra: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    caramel_cascade: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
    druid_dirtcake: { traveler: Number, adventurer: Number, explorer: Number, quest: Number },
  },

  // Pick up Location - Top Level Field
  pickup_location: { type: String, default: "Sweet Adventures Club, 104 Gilbert Ave, Menlo Park, CA" },
  
  // Status should be 'active' by default to work with your Cron Job logic
  status: { type: String, default: 'active' }, 
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preordering', PreorderingSchema, 'orders');