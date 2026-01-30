const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// --- THE MASTER CONTROL ---
let MARKET_CAPACITY = 42; 

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Converts pack sizes into total individual cheesecake units
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
 */
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

/**
 * CREATE NEW PREORDER
 * Restored: Individual Customer Receipt with Navigation Button
 */
router.post('/', async (req, res) => {
  try {
    // 1. TIME GATE: 2:00 PM Cutoff
    const now = new Date();
    const currentHour = now.getHours(); 
    if (currentHour >= 14 && currentHour < 21) { 
        return res.status(403).json({ message: "The tavern is closed for the day! Preordering resets at 9PM." });
    }

    // 2. CAPACITY CHECK
    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(req.body.items);
    if (currentSold + incomingUnits > MARKET_CAPACITY) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    // 3. SAVE ORDER
    const newOrder = new Preorder({ ...req.body, status: 'active' });
    const savedOrder = await newOrder.save();

    // 4. BUILD EMAIL TABLE
    let itemsRows = '';
    for (const [flavor, sizes] of Object.entries(savedOrder.items)) {
        const counts = [];
        if (sizes.traveler > 0) counts.push(`${sizes.traveler} Traveler`);
        if (sizes.adventurer > 0) counts.push(`${sizes.adventurer} Adventurer`);
        if (sizes.explorer > 0) counts.push(`${sizes.explorer} Explorer`);
        if (sizes.quest > 0) counts.push(`${sizes.quest} Quest`);
        
        if (counts.length > 0) {
            const fName = flavor.replace(/_/g, ' ').toUpperCase();
            itemsRows += `<tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>${fName}</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${counts.join(', ')}</td></tr>`;
        }
    }

    // 5. SEND INSTANT RECEIPT (With Website Button)
    await transporter.sendMail({
        from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
        to: savedOrder.customer_email,
        bcc: process.env.EMAIL_USER, 
        subject: "📜 Your Provision Receipt",
        html: `
            <div style="font-family: serif; border: 2px solid #d4a373; padding: 20px; background-color: #fdf5e6; max-width: 600px; margin: auto;">
                <h1 style="color: #5D4037; text-align: center;">Greetings, ${savedOrder.customer_name}!</h1>
                <p style="font-size: 1.1rem;">Your request has been recorded in the Grand Ledger. We are preparing the following rations for your journey:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden;">
                    <thead style="background:#f0decc;"><tr><th style="text-align:left; padding:10px;">Item</th><th style="text-align:left; padding:10px;">Quantity</th></tr></thead>
                    <tbody>${itemsRows}</tbody>
                </table>

                <p style="font-size: 1.1rem;"><strong>Arrival Window:</strong> ${savedOrder.delivery_time || 'Next Event'}</p>
                
                <p>Want to learn more lore about our Sweet Adventures Club, or place an order for further in the future? Visit our Virtual Tavern today!</a>.</p>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://sweetadventuresclub.netlify.app" 
                       style="background-color: #d4a373; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.2rem; display: inline-block;">
                       Visit our Virtual Tavern
                    </a>
                </div>
                
                <p style="text-align: center; margin-top: 20px; color: #8b5e3c;">Happy Trails, adventurer.</p>
            </div>`
    });

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: "Database Error", error: err.message });
  }
});

// --- THE 9:00 PM CUMULATIVE REPORT & RESET ---
cron.schedule('0 21 * * *', async () => {
    console.log("9:00 PM: Compiling Flavor-Specific Grand Ledger...");
    try {
        const todaysOrders = await Preorder.find({ status: 'active' });

        if (todaysOrders.length > 0) {
            let itemsSummary = '';
            let flavorTotals = {}; 
            let grandTotalUnits = 0;

            todaysOrders.forEach(order => {
                let individualLoot = [];
                Object.entries(order.items).forEach(([flavor, sizes]) => {
                    const fName = flavor.replace(/_/g, ' ').toUpperCase();
                    const units = (Number(sizes.traveler) || 0) * 1 + 
                                  (Number(sizes.adventurer) || 0) * 3 + 
                                  (Number(sizes.explorer) || 0) * 6 + 
                                  (Number(sizes.quest) || 0) * 12;

                    if (units > 0) {
                        individualLoot.push(`${units} units of ${fName}`);
                        flavorTotals[fName] = (flavorTotals[fName] || 0) + units;
                        grandTotalUnits += units;
                    }
                });

                itemsSummary += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${order.customer_name}</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${individualLoot.join('<br>')}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.delivery_time || 'N/A'}</td>
                    </tr>`;
            });

            let bakeListHTML = '';
            for (const [flavor, count] of Object.entries(flavorTotals)) {
                bakeListHTML += `<p style="font-size: 1.2rem; margin: 5px 0;"><strong>${flavor}:</strong> ${count} units</p>`;
            }

            const reportHTML = `
                <div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
                    <h1 style="color: #5D4037; text-align: center;">⚔️ THE GRAND LEDGER ⚔️</h1>
                    <h3 style="border-bottom: 2px solid #d4a373; padding-bottom: 10px;">🛠️ TOTAL BAKE LIST (By Flavor)</h3>
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #d4a373; margin-bottom: 20px;">
                        ${bakeListHTML}
                        <h2 style="color: #d4a373; border-top: 2px solid #f0decc; margin-top: 15px; padding-top: 10px;">GRAND TOTAL: ${grandTotalUnits} UNITS</h2>
                    </div>
                    <h3>Individual Manifest</h3>
                    <table style="width: 100%; text-align: left; border-collapse: collapse; background: white;">
                        <thead><tr style="background: #f0decc;"><th style="padding:10px;">Customer</th><th style="padding:10px;">Details</th><th style="padding:10px;">Arrival</th></tr></thead>
                        <tbody>${itemsSummary}</tbody>
                    </table>
                </div>`;

            await transporter.sendMail({
                from: `"The Archive" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `📜 GRAND LEDGER: ${new Date().toLocaleDateString()} Bake Report`,
                html: reportHTML
            });

            await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
            console.log("9:01 PM: Grand Ledger sent and status reset to completed.");
        }
    } catch (err) {
        console.error("The 9PM ledger failed:", err);
    }
});

module.exports = router;