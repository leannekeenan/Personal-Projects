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
    // 1. Save to Database first
    const newOrder = new Preorder(req.body);
    const savedOrder = await newOrder.save();
    
    // Convert to plain object so the email loop works perfectly
    const orderData = savedOrder.toObject();

    // 2. Build the table rows using the plain object
    let itemsRows = '';
    for (const [flavor, sizes] of Object.entries(orderData.items)) {
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

    // 3. Email Templates (Kept exactly as you liked them)
    const customerHTML = `<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"><div style="background-color: #f0decc; padding: 30px; text-align: center;"><h1 style="color: white; margin: 0;">SWEET ADVENTURES CLUB</h1></div><div style="padding: 30px;"><h2>Thank you, ${orderData.customer_name}!</h2><p>We have received your order request. Please make your way to our vendors booth and complete your purchase. Once you have made your payment, your order will be included in this weeks bake and available for pick up during your selected pick up window.</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><thead><tr style="background-color: #fcf8f3;"><th style="text-align: left; padding: 10px;">Flavor</th><th style="text-align: left; padding: 10px;">Pack Size</th></tr></thead><tbody>${itemsRows}</tbody></table><div style="background-color: #f9f9f9; padding: 20px;"><p><strong>Pickup Window:</strong> ${orderData.delivery_time}</p></div><div style="text-align: center; margin-top: 40px;"><a href="https://sweetadventuresclub.netlify.app" style="background-color: #f0decc; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit the Adventurers Club</a></div></div></div>`;

    const companyHTML = `<div style="font-family: Arial; padding: 20px;"><div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-top: 4px solid #333;"><h2>🎂 NEW ORDER 🎂</h2><p><strong>Customer:</strong> ${orderData.customer_name}</p><p><strong>Phone:</strong> ${orderData.phone_number}</p><h3>Items:</h3><table style="width: 100%;">${itemsRows}</table></div></div>`;

    // 4. Send Emails (Nested in another try/catch so they don't block the success message)
    try {
        await transporter.sendMail({
            from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
            to: orderData.customer_email,
            subject: `Order Confirmation - Sweet Adventures Club`,
            html: customerHTML
        });

        await transporter.sendMail({
            from: `"Order Alert" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `NEW ORDER: ${orderData.customer_name}`,
            html: companyHTML
        });
    } catch (mailErr) {
        console.error("Email send failed, but order was saved:", mailErr);
    }

    // 5. Final Success Response
    res.status(201).json(savedOrder);

  } catch (err) {
    console.error("Backend Error:", err);
    res.status(400).json({ message: "Database Save Error", error: err.message });
  }
});

module.exports = router;