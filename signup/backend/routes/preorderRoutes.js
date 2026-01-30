const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');

let MARKET_CAPACITY = 42; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

router.get('/stock-level', async (req, res) => {
    try {
        const orders = await Preorder.find({ status: 'active' }); 
        let totalSold = 0;
        orders.forEach(order => { totalSold += calculateUnits(order.items); });

        res.json({ 
            totalSold, 
            remaining: Math.max(0, MARKET_CAPACITY - totalSold),
            maxCap: MARKET_CAPACITY 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
  try {
    // 1. ADDED: 2:00 PM CUTOFF CHECK
    const now = new Date();
    const currentHour = now.getHours(); // 0-23 format
    if (currentHour >= 14) { // 14 = 2:00 PM
        return res.status(403).json({ message: "The tavern is closed for the day! Preordering resets at 9PM." });
    }

    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(req.body.items);
    if (currentSold + incomingUnits > MARKET_CAPACITY) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    const newOrder = new Preorder({ ...req.body, status: 'active' });
    const savedOrder = await newOrder.save();

    // (Send individual receipt as before...)
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: "Database Error", error: err.message });
  }
});

// --- THE 9:00 PM CUMULATIVE REPORT ---
cron.schedule('0 21 * * *', async () => {
    try {
        const todaysOrders = await Preorder.find({ status: 'active' });

        if (todaysOrders.length > 0) {
            let itemsSummary = '';
            let flavorTotals = {}; // TRACKS INDIVIDUAL UNITS PER FLAVOR
            let grandTotalUnits = 0;

            todaysOrders.forEach(order => {
                let individualLoot = [];
                Object.entries(order.items).forEach(([flavor, sizes]) => {
                    const fName = flavor.replace(/_/g, ' ').toUpperCase();
                    
                    // Calculate how many total units this order adds for THIS flavor
                    const flavorUnits = (Number(sizes.traveler) || 0) * 1 + 
                                       (Number(sizes.adventurer) || 0) * 3 + 
                                       (Number(sizes.explorer) || 0) * 6 + 
                                       (Number(sizes.quest) || 0) * 12;

                    if (flavorUnits > 0) {
                        // Track for the summary list
                        individualLoot.push(`${flavorUnits} units of ${fName}`);
                        
                        // Accumulate for the Bake List
                        flavorTotals[fName] = (flavorTotals[fName] || 0) + flavorUnits;
                        grandTotalUnits += flavorUnits;
                    }
                });

                itemsSummary += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${order.customer_name}</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${individualLoot.join('<br>')}</td>
                    </tr>`;
            });

            // Format the Flavor Bake List
            let bakeListHTML = '';
            for (const [flavor, count] of Object.entries(flavorTotals)) {
                bakeListHTML += `<p><strong>${flavor}:</strong> ${count} units</p>`;
            }

            const reportHTML = `
                <div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
                    <h1 style="color: #5D4037; text-align: center;">⚔️ THE GRAND LEDGER ⚔️</h1>
                    <h3>Individual Manifest</h3>
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead><tr style="background: #f0decc;"><th>Customer</th><th>Total Units/Flavors</th></tr></thead>
                        <tbody>${itemsSummary}</tbody>
                    </table>
                    <hr style="border: 1px solid #d4a373; margin: 30px 0;">
                    <h3 style="color: #5D4037;">🛠️ EXACT BAKE COUNTS (By Flavor)</h3>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #d4a373;">
                        ${bakeListHTML}
                        <h2 style="color: #d4a373;">GRAND TOTAL UNITS: ${grandTotalUnits}</h2>
                    </div>
                </div>`;

            await transporter.sendMail({
                from: `"The Archive" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `📜 GRAND LEDGER: ${new Date().toLocaleDateString()} Bake Report`,
                html: reportHTML
            });

            await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
        }
    } catch (err) {
        console.error("The 9PM ledger failed:", err);
    }
});

module.exports = router;