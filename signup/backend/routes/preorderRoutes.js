const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');

// 1. Set up the Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// GET ALL PREORDERS
router.get('/', async (req, res) => {
    try {
        const preorders = await Preorder.find().sort({ createdAt: -1 });
        res.json(preorders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching preorders", error: err.message });
    }
});

// CREATE NEW PREORDER & SEND EMAIL
router.post('/', async (req, res) => {
  try {
    // Save to Database
    const newOrder = new Preorder(req.body);
    const savedOrder = await newOrder.save();

    // Build the Order List for the Email
    // This loops through your items and only lists things people actually ordered
    let itemsList = '';
    for (const [flavor, sizes] of Object.entries(savedOrder.items)) {
        const counts = [];
        if (sizes.traveler > 0) counts.push(`${sizes.traveler} Traveler`);
        if (sizes.adventurer > 0) counts.push(`${sizes.adventurer} Adventurer`);
        if (sizes.explorer > 0) counts.push(`${sizes.explorer} Explorer`);
        if (sizes.quest > 0) counts.push(`${sizes.quest} Quest`);
        
        if (counts.length > 0) {
            itemsList += `<li><strong>${flavor.replace('_', ' ')}:</strong> ${counts.join(', ')}</li>`;
        }
    }

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #d4a373;">Order Confirmed!</h2>
        <p>Hi ${savedOrder.customer_name},</p>
        <p>We've received your preorder! Here are your details:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Pickup Window:</strong> ${savedOrder.delivery_time}</p>
            <p><strong>Address:</strong> ${savedOrder.delivery_address}</p>
        </div>
        <h3>Your Treats:</h3>
        <ul>${itemsList}</ul>
        <p>See you next week!</p>
      </div>
    `;

    // Send Email to Customer AND You
    await transporter.sendMail({
      from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
      to: [savedOrder.customer_email, process.env.EMAIL_USER], 
      subject: `Order Confirmation - ${savedOrder.customer_name}`,
      html: emailHTML
    });

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error details:", err);
    res.status(400).json({ message: "Process failed", error: err.message });
  }
});

module.exports = router;