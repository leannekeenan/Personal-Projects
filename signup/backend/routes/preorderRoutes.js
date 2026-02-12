const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { Client, Environment } = require('square'); 
const crypto = require('crypto');

// --- SQUARE SETUP ---
const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
});

console.log("✅ Square Client initialized");

BigInt.prototype.toJSON = function() { return this.toString() };

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// --- THE GATEKEEPER LOGIC ---
const isTavernOpen = () => {
    // Allows you to bypass the gate by setting TAVERN_MANUAL_OVERRIDE=true in .env
    if (process.env.TAVERN_MANUAL_OVERRIDE === 'true') return { open: true };

    const now = new Date();
    const pstDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        weekday: 'long',
        hour12: false
    }).formatToParts(now);

    const day = pstDate.find(p => p.type === 'weekday').value; 
    const hour = parseInt(pstDate.find(p => p.type === 'hour').value);

    // Opening the gate ONLY on Market Days (Sat-Sun) 9am - 1pm
    if (['Saturday', 'Sunday'].includes(day)) {
        if (hour >= 9 && hour < 13) return { open: true };
    }

    return { 
        open: false, 
        msg: `The Tavern only accepts preorders during Market Hours (Sat-Sun, 9am-1pm). Current time: ${day} at ${hour}:00 PST.` 
    };
};

// --- DEFINE THE MARKET LOCATION FOR ORDER PICKUP ---

const getPickupLocation = () => {
    const now = new Date();
    const pstDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        weekday: 'long',
        hour12: false
    }).formatToParts(now);

    const day = pstDate.find(p => p.type === 'weekday').value; 
    const hour = parseInt(pstDate.find(p => p.type === 'hour').value);

    // Location A: Thursdays 2 PM - 8 PM (14:00 - 20:00)
    if (day === 'Thursday' && hour >= 14 && hour < 20) {
        return "Bare Bottle Brewing Co. (550 Oak Grove Ave, Menlo Park, CA)";
    }

    // Location B: Saturdays 9 AM - 1 PM (09:00 - 13:00)
    if (day === 'Saturday' && hour >= 9 && hour < 13) {
        return "Foster City Farmers' Market (1010 Metro Center Bvld, Foster City, CA)";
    }

    // Fallback for Manual Override/Testing
    return "Sweet Adventures Club, 104 Gilbert Ave, Menlo Park, CA";
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
    // --- GATEKEEPER CHECK ---
    const gate = isTavernOpen();
    if (!gate.open) {
        return res.status(403).json({ message: gate.msg });
    }

    const { sourceId, items, customer_name, customer_email, delivery_time, phone_number } = req.body;

    // --- CAPACITY CHECK ---
    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(items);
    if (currentSold + incomingUnits > 42) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    // --- PRICE CALCULATION ---
    const prices = { traveler: 800, adventurer: 2200, explorer: 4200, quest: 8000 };
    let subtotalCents = 0;

    Object.entries(items).forEach(([flavor, sizes]) => {
        subtotalCents += (Number(sizes.traveler) || 0) * prices.traveler +
                         (Number(sizes.adventurer) || 0) * prices.adventurer +
                         (Number(sizes.explorer) || 0) * prices.explorer +
                         (Number(sizes.quest) || 0) * prices.quest;
    });

    const taxMultiplier = 1.09875;
    const totalCents = Math.round(subtotalCents * taxMultiplier);

    // --- SQUARE PAYMENT ---
    const response = await client.paymentsApi.createPayment({
        sourceId: sourceId,
        idempotencyKey: crypto.randomBytes(12).toString('hex'),
        amountMoney: {
            amount: totalCents,
            currency: 'USD'
        }
    });

    // --- SAVE ORDER ---
    // 1. First, call your function to get the string
const currentMarket = getPickupLocation(); 

    // 2. Then, tell the database to use that string
    const newOrder = new Preorder({ 
        ...req.body, 
        status: 'active',
        pickup_location: currentMarket, // <--- This overrides the "TBD" default
        paymentId: response.result.payment.id 
    });


    const savedOrder = await newOrder.save();

    // --- BUILD EMAIL CONTENT ---
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

    const grandTotalDisplay = (totalCents / 100).toFixed(2);

    // 1. CUSTOMER RECEIPT
    await transporter.sendMail({
        from: `"Sweet Adventures Club" <${process.env.EMAIL_USER}>`,
        to: savedOrder.customer_email,
        subject: "📜 Your Provision Receipt & Collection Decree",
        html: `
            <div style="font-family: serif; border: 2px solid #d4a373; padding: 20px; background-color: #fdf5e6; max-width: 600px; margin: auto;">
                <h1 style="color: #5D4037; text-align: center;">Greetings, ${savedOrder.customer_name}!</h1>
                <p style="text-align: center; font-weight: bold; color: #8b4513;">⚔️ YOUR RATIONS ARE SECURED FOR NEXT WEEK ⚔️</p>
                
                <div style="background: #fff; padding: 15px; border: 1px dashed #d4a373; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Collection Decree:</strong> This preorder is for pickup <strong>ONE WEEK from today</strong>.</p>
                </div>

                <p>We are preparing the following for your future journey:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 10px 0; background: white;">
                    <thead style="background:#f0decc;"><tr><th style="padding:10px;">Item</th><th style="padding:10px;">Quantity</th></tr></thead>
                    <tbody>${itemsRows}</tbody>
                </table>
                <p><strong>Total Gold Paid:</strong> $${grandTotalDisplay}</p>
                <p><strong>Next Saturday Pickup Window:</strong> ${savedOrder.delivery_time}</p>
                <p><strong>Pickup Location:</strong> ${savedOrder.pickup_location}</p>
                <p style="font-style: italic; text-align: center; margin-top: 20px;">"May your pack be heavy and your heart light on the road until we meet again."</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://sweetadventuresclub.netlify.app" style="background-color: #d4a373; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">Visit our Virtual Tavern</a>
                </div>
            </div>`
    });

    // 2. MERCHANT ALERT
    await transporter.sendMail({
        from: `"Tavern System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `📣 NEW ORDER: ${savedOrder.customer_name}`,
        html: `
            <div style="font-family: sans-serif; border: 2px solid #8b4513; padding: 20px; background-color: #fff; max-width: 600px; margin: auto;">
                <h2 style="color: #8b4513; border-bottom: 2px solid #8b4513;">New Adventurer Incoming!</h2>
                <p><strong>Name:</strong> ${savedOrder.customer_name}</p>
                <p><strong>Email:</strong> ${savedOrder.customer_email}</p>
                <p><strong>Phone:</strong> ${savedOrder.phone_number}</p>
                <p><strong>Next-Week Pickup Window:</strong> ${savedOrder.delivery_time}</p>
                <p><strong>Pickup Location:</strong> ${savedOrder.pickup_location}</p>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead style="background:#eee;"><tr><th style="padding:8px; text-align:left;">Provision</th><th style="padding:8px; text-align:left;">Qty</th></tr></thead>
                    <tbody>${itemsRows}</tbody>
                </table>
                <p><strong>Total Collected:</strong> $${grandTotalDisplay}</p>
                <p style="font-size: 0.8rem; color: #777;">Square ID: ${savedOrder.paymentId}</p>
            </div>`
    });

    res.status(201).json(savedOrder);

  } catch (err) {
    console.error("Payment Process Error:", err);
    res.status(400).json({ 
        message: "Payment failed", 
        error: err.errors ? err.errors[0].detail : err.message 
    });
  }
});

// --- THE 8:00 PM CUMULATIVE REPORT ---
cron.schedule('0 20 * * *', async () => {
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
                itemsSummary += `<tr>
                <td style="padding:10px; border-bottom:1px solid #eee;"><strong>${order.customer_name}</strong></td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${individualLoot.join('<br>')}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${order.delivery_time || 'N/A'}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${order.pickup_location}</td>
                </tr>`;
                
            });

            let bakeListHTML = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff;">';
            bakeListHTML += '<tr style="background:#d4a373; color:white;"> <th style="padding:10px;">Flavor</th> <th style="padding:10px;">Total Units to Bake</th> </tr>';
            for (const [flavor, count] of Object.entries(flavorTotals)) {
                bakeListHTML += `<tr><td style="padding:10px; border-bottom:1px solid #eee;">${flavor}</td><td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${count}</td></tr>`;
            }
            bakeListHTML += '</table>';

            await transporter.sendMail({
                from: `"The Archive" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `📜 GRAND LEDGER: Bake Report (${new Date().toLocaleDateString()})`,
                html: `<div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
                        <h1 style="text-align:center; color:#5D4037;">⚔️ THE GRAND LEDGER ⚔️</h1>
                        <h2 style="color:#8b4513;">Baking Production List:</h2>
                        ${bakeListHTML}
                        <h2 style="text-align:right;">TOTAL UNITS: ${grandTotalUnits}</h2>
                        <hr />
                        <h3>Individual Order Details:</h3>
                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead><tr style="background: #f0decc;"><th>Customer</th><th>Details</th><th>Arrival</th></tr></thead>
                            <tbody>${itemsSummary}</tbody>
                        </table>
                      </div>`
            });

            await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
        }
    } catch (err) {
        console.error("The 8PM ledger failed:", err);
    }
});

module.exports = router;