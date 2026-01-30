const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// --- THE MASTER CONTROL ---
// Change this number weekly if you have wholesale deductions
let MARKET_CAPACITY = 42; 

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to calculate total units based on your pack sizes
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

// --- ROUTES ---

/**
 * GET CURRENT STOCK
 * Only finds orders with status 'active' to allow for daily resets.
 */
router.get('/stock-level', async (req, res) => {
    try {
        const orders = await Preorder.find({ status: 'active' }); 
        let totalSold = 0;
        orders.forEach(order => {
            totalSold += calculateUnits(order.items);
        });

        res.json({ 
            totalSold, 
            remaining: Math.max(0, MARKET_CAPACITY - totalSold),
            maxCap: MARKET_CAPACITY 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * CREATE NEW PREORDER
 * Validates capacity against 'active' orders before saving.
 */
router.post('/', async (req, res) => {
  try {
    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(req.body.items);
    
    if (currentSold + incomingUnits > MARKET_CAPACITY) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    const newOrder = new Preorder({
        ...req.body,
        status: 'active' // Explicitly set as active
    });
    
    const savedOrder = await newOrder.save();

    // CUSTOMER CONFIRMATION EMAIL
    const customerHTML = `<h1>Confirmation for ${savedOrder.customer_name}</h1><p>Your provisions are reserved!</p>`;
    
    await transporter.sendMail({
        from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
        to: savedOrder.customer_email,
        subject: "📜 Your Provision Receipt",
        html: customerHTML
    });

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: "Database Error", error: err.message });
  }
});

// --- THE 8PM AUTOMATION (The Night Watchman) ---
/**
 * Cron schedule: '0 20 * * *' (8:00 PM)
 * 1. Collects all 'active' orders.
 * 2. Totals up every unit for the bake list.
 * 3. Emails the "Grand Ledger" to you.
 * 4. Marks orders as 'completed' so inventory resets to 42.
 */
cron.schedule('0 20 * * *', async () => {
    console.log("8:00 PM: Compiling the Grand Ledger and Resetting Inventory...");
    
    try {
        const todaysOrders = await Preorder.find({ status: 'active' });

        if (todaysOrders.length > 0) {
            let itemsSummary = '';
            const grandTotals = { traveler: 0, adventurer: 0, explorer: 0, quest: 0, totalUnits: 0 };

            todaysOrders.forEach(order => {
                let individualLoot = [];
                Object.entries(order.items).forEach(([flavor, sizes]) => {
                    const fName = flavor.replace(/_/g, ' ');
                    if (sizes.traveler > 0) {
                        individualLoot.push(`${sizes.traveler} Traveler (${fName})`);
                        grandTotals.traveler += sizes.traveler;
                        grandTotals.totalUnits += (sizes.traveler * 1);
                    }
                    if (sizes.adventurer > 0) {
                        individualLoot.push(`${sizes.adventurer} Adventurer (${fName})`);
                        grandTotals.adventurer += sizes.adventurer;
                        grandTotals.totalUnits += (sizes.adventurer * 3);
                    }
                    if (sizes.explorer > 0) {
                        individualLoot.push(`${sizes.explorer} Explorer (${fName})`);
                        grandTotals.explorer += sizes.explorer;
                        grandTotals.totalUnits += (sizes.explorer * 6);
                    }
                    if (sizes.quest > 0) {
                        individualLoot.push(`${sizes.quest} Quest (${fName})`);
                        grandTotals.quest += sizes.quest;
                        grandTotals.totalUnits += (sizes.quest * 12);
                    }
                });

                itemsSummary += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${order.customer_name}</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${individualLoot.join('<br>')}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.arrival_window || 'Not Specified'}</td>
                    </tr>`;
            });

            const reportHTML = `
                <div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
                    <h1 style="color: #5D4037; text-align: center;">⚔️ THE GRAND LEDGER ⚔️</h1>
                    <h3>Traveler Manifest (Individual Orders)</h3>
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead><tr style="background: #f0decc;"><th>Traveler</th><th>Loot</th><th>Arrival</th></tr></thead>
                        <tbody>${itemsSummary}</tbody>
                    </table>
                    <hr style="border: 1px solid #d4a373; margin: 30px 0;">
                    <h3 style="color: #5D4037;">🛠️ Bake Totals for Next Week</h3>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #d4a373;">
                        <p>Traveler Units: ${grandTotals.traveler}</p>
                        <p>Adventurer Packs: ${grandTotals.adventurer}</p>
                        <p>Explorer Packs: ${grandTotals.explorer}</p>
                        <p>Quest Packs: ${grandTotals.quest}</p>
                        <h2 style="color: #d4a373;">GRAND TOTAL UNITS TO BAKE: ${grandTotals.totalUnits}</h2>
                    </div>
                </div>`;

            await transporter.sendMail({
                from: `"The Archive" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `📜 GRAND LEDGER: ${new Date().toLocaleDateString()} Bake Report`,
                html: reportHTML
            });

            // FLIP STATUS TO COMPLETED TO RESET STOCK
            await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
            console.log("Daily summary sent. Inventory reset successfully.");
        } else {
            console.log("No active orders found to summarize.");
        }
    } catch (err) {
        console.error("The 8PM ledger failed to compile:", err);
    }
});

module.exports = router;