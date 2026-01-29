const express = require('express');
const router = express.Router();
// This matches the "Preordering.js" file I see in your models folder
const Preorder = require('../models/Preordering'); 

// 1. GET ALL PREORDERS (The "Clipboard" view)
router.get('/', async (req, res) => {
    try {
        const preorders = await Preorder.find().sort({ createdAt: -1 });
        res.json(preorders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching preorders", error: err.message });
    }
});

// 2. CREATE NEW PREORDER (The "Signup" action)
/*
router.post('/', async (req, res) => {
    const newEntry = new Preorder({
        customerName: req.body.customerName,
        email: req.body.email,
        phone: req.body.phone,
        productName: req.body.productName,
        quantity: req.body.quantity
    });

    try {
        const savedPreorder = await newEntry.save();
        res.status(201).json(savedPreorder);
    } catch (err) {
        res.status(400).json({ message: "Error saving preorder", error: err.message });
    }
});
*/


router.post('/', async (req, res) => {
    try {
        // This takes the entire object from React and saves it
        const newOrder = new Preorder(req.body); 
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: "Validation Error", error: err.message });
    }
});
module.exports = router;