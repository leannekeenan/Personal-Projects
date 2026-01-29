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

// GET ALL PREORDERS (The "Clipboard" view)
router.get('/', async (req, res) => {
    try {
        const preorders = await Preorder.find().sort({ createdAt: -1 });
        res.json(preorders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching preorders", error: err.message });
    }
});

// CREATE NEW PREORDER & SEND BRANDED EMAILS
router.post('/', async (req, res) => {
  try {
    const newOrder = new Preorder(req.body);
    const savedOrder = await newOrder.save();

    // Loop to build the table rows for the order items
    let itemsRows = '';
    for (const [flavor, sizes] of Object.entries(savedOrder.items)) {
        const counts = [];
        if (sizes.traveler > 0) counts.push(`${sizes.traveler} Traveler`);
        if (sizes.adventurer > 0) counts.push(`${sizes.adventurer} Adventurer`);
        if (sizes.explorer > 0) counts.push(`${sizes.explorer} Explorer`);
        if (sizes.quest > 0) counts.push(`${sizes.quest} Quest`);
        
        if (counts.length > 0) {
            itemsRows += `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${flavor.replace(/_/g, ' ').toUpperCase()}</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${counts.join(', ')}</td>
            </tr>`;
        }
    }

    // --- EMAIL 1: THE CUSTOMER RECEIPT (Styled) ---
    const customerHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #d4a373; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">SWEET ADVENTURES CLUB</h1>
        </div>
        <div style="padding: 30px; background-color: white;">
            <h2 style="color: #333;">Thank you for your order, ${savedOrder.customer_name}!</h2>
            <p style="color: #666; line-height: 1.6;">Your treats are officially reserved for next week. Here is your digital receipt:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #fcf8f3;">
                        <th style="text-align: left; padding: 10px; border-bottom: 2px solid #d4a373;">Flavor</th>
                        <th style="text-align: left; padding: 10px; border-bottom: 2px solid #d4a373;">Pack Size</th>
                    </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
            </table>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 5px 0;"><strong>Pickup Window:</strong> ${savedOrder.delivery_time}</p>
                <p style="margin: 5px 0;"><strong>Pickup Address:</strong> ${savedOrder.delivery_address}</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="https://sweetadventuresclub.netlify.app" style="background-color: #d4a373; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">BACK TO THE CLUB</a>
            </div>
        </div>
      </div>
    `;

    // --- EMAIL 2: THE COMPANY ORDER REQUEST (Internal) ---
    const companyHTML = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-top: 4px solid #333; border-radius: 8px;">
            <h2 style="color: #333;"> 🎂 NEW ORDER RECEIVED 🎂 </h2>
            <p>A new request has been submitted by <strong>${savedOrder.customer_name}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #eee;"/>
            <p><strong>Customer Email:</strong> ${savedOrder.customer_email}</p>
            <p><strong>Phone:</strong> ${savedOrder.phone_number}</p>
            <p><strong>Time Slot:</strong> ${savedOrder.delivery_time}</p>
            <h3 style="margin-top: 20px; color: #d4a373;">Items to Pack:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody style="font-size: 14px;">${itemsRows}</tbody>
            </table>
        </div>
      </div>
    `;

    // Send to Customer
    await transporter.sendMail({
      from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
      to: savedOrder.customer_email,
      subject: `Order Confirmation - Sweet Adventures Club`,
      html: customerHTML
    });

    // Send to Company
    await transporter.sendMail({
      from: `"Order Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `NEW ORDER: ${savedOrder.customer_name} - ${savedOrder.delivery_time}`,
      html: companyHTML
    });

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Email Error:", err);
    res.status(400).json({ message: "Process failed", error: err.message });
  }
});

module.exports = router;