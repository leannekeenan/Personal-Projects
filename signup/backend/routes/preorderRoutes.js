const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const square = require('square'); 
const crypto = require('crypto');

// --- SQUARE SETUP FOR VERSION 44.0.0 ---
// We pull the Client from the default export and manually set the environment string
const Client = square.default ? square.default.Client : square.Client;

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: 'sandbox' // We use the string directly to stop the 'Sandbox' undefined error
});

// BigInt serialization fix
BigInt.prototype.toJSON = function() { return this.toString() };
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
    if (!items) return 0;
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
            remaining: Math.max(0, 42 - totalSold),
            maxCap: 42 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
  try {
    const { sourceId, items, customer_name, customer_email, delivery_time } = req.body;

    // 1. TIME GATE: 2:00 PM Cutoff
    const now = new Date();
    const currentHour = now.getHours(); 
    if (currentHour >= 14 || currentHour < 9) { 
        return res.status(403).json({ message: "The tavern is closed for the day!" });
    }

    // 2. CAPACITY CHECK
    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(items);
    if (currentSold + incomingUnits > 42) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    // 3. CALCULATE TOTAL PRICE (In Cents)
    const prices = { traveler: 800, adventurer: 2200, explorer: 4200, quest: 8000 };
    let totalCents = 0;
    Object.entries(items).forEach(([flavor, sizes]) => {
        totalCents += (Number(sizes.traveler) || 0) * prices.traveler +
                     (Number(sizes.adventurer) || 0) * prices.adventurer +
                     (Number(sizes.explorer) || 0) * prices.explorer +
                     (Number(sizes.quest) || 0) * prices.quest;
    });

    // 4. PROCESS SQUARE PAYMENT
    const { result } = await client.paymentsApi.createPayment({
        sourceId: sourceId,
        idempotencyKey: crypto.randomBytes(12).toString('hex'),
        amountMoney: {
            amount: BigInt(totalCents),
            currency: 'USD'
        }
    });

    // 5. SAVE ORDER TO DATABASE
    const newOrder = new Preorder({ 
        ...req.body, 
        status: 'active',
        paymentId: result.payment.id 
    });
    const savedOrder = await newOrder.save();

    // 6. BUILD EMAIL TABLE
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

    // 7. SEND INSTANT RECEIPT
    await transporter.sendMail({
        from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
        to: savedOrder.customer_email,
        bcc: process.env.EMAIL_USER, 
        subject: "📜 Your Provision Receipt",
        html: `
            <div style="font-family: serif; border: 2px solid #d4a373; padding: 20px; background-color: #fdf5e6; max-width: 600px; margin: auto;">
                <h1 style="color: #5D4037; text-align: center;">Greetings, ${savedOrder.customer_name}!</h1>
                <p>Payment successful. We are preparing the following rations:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px;">
                    <thead style="background:#f0decc;"><tr><th style="padding:10px;">Item</th><th style="padding:10px;">Quantity</th></tr></thead>
                    <tbody>${itemsRows}</tbody>
                </table>
                <p><strong>Arrival Window:</strong> ${savedOrder.delivery_time || 'Next Event'}</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://sweetadventuresclub.netlify.app" style="background-color: #d4a373; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">Visit our Virtual Tavern</a>
                </div>
            </div>`
    });

    res.status(201).json(savedOrder);

  } catch (err) {
    console.error("Payment Process Error:", err);
    res.status(400).json({ message: "Payment failed", error: err.message });
  }
});

// --- THE 2:00 PM CUMULATIVE REPORT ---
cron.schedule('0 14 * * *', async () => {
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
                    const units = (Number(sizes.traveler) || 0) * 1 + (Number(sizes.adventurer) || 0) * 3 + (Number(sizes.explorer) || 0) * 6 + (Number(sizes.quest) || 0) * 12;
                    if (units > 0) {
                        individualLoot.push(`${units} units of ${fName}`);
                        flavorTotals[fName] = (flavorTotals[fName] || 0) + units;
                        grandTotalUnits += units;
                    }
                });
                itemsSummary += `<tr><td style="padding:10px; border-bottom:1px solid #eee;"><strong>${order.customer_name}</strong></td><td style="padding:10px; border-bottom:1px solid #eee;">${individualLoot.join('<br>')}</td><td style="padding:10px; border-bottom:1px solid #eee;">${order.delivery_time || 'N/A'}</td></tr>`;
            });

            let bakeListHTML = '';
            for (const [flavor, count] of Object.entries(flavorTotals)) {
                bakeListHTML += `<p><strong>${flavor}:</strong> ${count} units</p>`;
            }

            await transporter.sendMail({
                from: `"The Archive" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `📜 GRAND LEDGER: Bake Report`,
                html: `<div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
                        <h1>⚔️ THE GRAND LEDGER ⚔️</h1>
                        ${bakeListHTML}
                        <h2>GRAND TOTAL: ${grandTotalUnits} UNITS</h2>
                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead><tr style="background: #f0decc;"><th>Customer</th><th>Details</th><th>Arrival</th></tr></thead>
                            <tbody>${itemsSummary}</tbody>
                        </table>
                      </div>`
            });

            await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
        }
    } catch (err) {
        console.error("The 2PM ledger failed:", err);
    }
});

module.exports = router;