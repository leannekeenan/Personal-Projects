const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');

// --- THE MASTER CONTROL ---
// Change this number weekly after deducting wholesale
let MARKET_CAPACITY = 42; 

// Helper function to calculate total units from an items object
const calculateUnits = (items) => {
    let total = 0;
    Object.values(items).forEach(sizes => {
        total += (Number(sizes.traveler) || 0) * 1 + 
                 (Number(sizes.adventurer) || 0) * 3 + 
                 (Number(sizes.explorer) || 0) * 6 + 
                 (Number(sizes.quest) || 0) * 12;
    });
    return total;
};

// GET CURRENT STOCK TOTAL
router.get('/stock-level', async (req, res) => {
    try {
        const orders = await Preorder.find();
        let totalSold = 0;
        orders.forEach(order => {
            totalSold += calculateUnits(order.items);
        });

        res.json({ 
            totalSold, 
            remaining: MARKET_CAPACITY - totalSold,
            maxCap: MARKET_CAPACITY 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE NEW PREORDER
router.post('/', async (req, res) => {
  try {
    // 1. Double-check capacity on the server side before saving
    const orders = await Preorder.find();
    let currentSold = 0;
    orders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(req.body.items);
    
    if (currentSold + incomingUnits > MARKET_CAPACITY) {
        return res.status(400).json({ message: "Sold out! Capacity exceeded." });
    }

    // 2. Save to Database
    const newOrder = new Preorder(req.body);
    const savedOrder = await newOrder.save();
    const orderData = savedOrder.toObject();

    // 3. Email Logic (Keep your existing table builder here)
    let itemsRows = '';
    for (const [flavor, sizes] of Object.entries(orderData.items)) {
        const counts = [];
        if (sizes.traveler > 0) counts.push(`${sizes.traveler} Traveler`);
        if (sizes.adventurer > 0) counts.push(`${sizes.adventurer} Adventurer`);
        if (sizes.explorer > 0) counts.push(`${sizes.explorer} Explorer`);
        if (sizes.quest > 0) counts.push(`${sizes.quest} Quest`);
        
        if (counts.length > 0) {
            itemsRows += `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${flavor.replace(/_/g, ' ').toUpperCase()}</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">${counts.join(', ')}</td></tr>`;
        }
    }

    // (Add your customerHTML and companyHTML templates here as before)

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: "Database Error", error: err.message });
  }
});

module.exports = router;