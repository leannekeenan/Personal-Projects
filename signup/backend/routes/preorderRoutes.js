const express = require('express');
const router = express.Router();
const Preorder = require('../models/Preordering'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { Client, Environment } = require('square');

// --- THE MASTER CONTROL ---
let MARKET_CAPACITY = 42; 

// --- SQUARE SETUP ---
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, // Switch to Environment.Production when ready for real gold
});

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
 * CREATE NEW PREORDER & SQUARE PAYMENT LINK
 */
router.post('/', async (req, res) => {
  try {
    // 1. TIME GATE: 2:00 PM (14) until 9:00 AM (9)
    const now = new Date();
    const currentHour = now.getHours(); 
    if (currentHour >= 14 || currentHour < 9) { 
        return res.status(403).json({ 
            message: "The tavern is closed for the day! Preordering resets next week at 9AM." 
        });
    }

    // 2. CAPACITY CHECK
    const activeOrders = await Preorder.find({ status: 'active' });
    let currentSold = 0;
    activeOrders.forEach(order => { currentSold += calculateUnits(order.items); });
    
    const incomingUnits = calculateUnits(req.body.items);
    if (currentSold + incomingUnits > MARKET_CAPACITY) {
        return res.status(400).json({ message: "Out of Provisions for this Journey!" });
    }

    // 3. PREPARE SQUARE LINE ITEMS
    const lineItems = [];
    const { items } = req.body;
    const prices = { traveler: 800, adventurer: 2200, explorer: 4200, quest: 8000 }; // In cents

    Object.entries(items).forEach(([flavor, sizes]) => {
      Object.entries(sizes).forEach(([size, qty]) => {
        if (Number(qty) > 0) {
          lineItems.push({
            name: `${flavor.replace(/_/g, ' ').toUpperCase()} (${size})`,
            quantity: qty.toString(),
            basePriceMoney: { amount: prices[size], currency: 'USD' }
          });
        }
      });
    });

    if (lineItems.length === 0) return res.status(400).json({ message: "No items selected!" });

    // 4. CREATE SQUARE CHECKOUT LINK
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: require('crypto').randomBytes(12).toString('hex'),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: lineItems
      },
      checkoutOptions: {
        redirectUrl: 'https://sweetadventuresclub.netlify.app/order-success',
        askForShippingAddress: false
      }
    });

    // 5. SAVE ORDER AS 'PENDING'
    const newOrder = new Preorder({ 
      ...req.body, 
      status: 'pending', 
      paymentId: result.paymentLink.id 
    });
    await newOrder.save();

    // 6. RETURN LINK TO FRONTEND
    res.status(201).json({ checkoutUrl: result.paymentLink.url });

  } catch (err) {
    console.error("Order processing error:", err);
    res.status(500).json({ message: "The Gold Portal failed to open.", error: err.message });
  }
});

// --- 2:00 PM: SEND THE GRAND LEDGER ONLY ---
cron.schedule('0 14 * * *', async () => {
    console.log("14:00 PM: Compiling Flavor-Specific Grand Ledger...");
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
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${order.customer_name}</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${individualLoot.join('<br>')}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.delivery_time || 'N/A'}</td>
                </tr>`;
            });

            let bakeListHTML = '';
            for (const [flavor, count] of Object.entries(flavorTotals)) {
                bakeListHTML += `<p style="font-size: 1.2rem; margin: 5px 0;"><strong>${flavor}:</strong> ${count} units</p>`;
            }

            const reportHTML = `<div style="font-family: serif; border: 5px solid #d4a373; padding: 20px; background-color: #fdf5e6;">
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
            console.log("2:00 PM: Grand Ledger sent to the baker.");
        }
    } catch (err) {
        console.error("The 2PM ledger failed:", err);
    }
});

// --- 9:00 AM: RESET THE BOARD FOR THE NEW DAY ---
cron.schedule('0 9 * * *', async () => {
    try {
        // Move current active orders to completed and open the tavern
        await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
        console.log("9:00 AM: Inventory reset. Tavern is now open for orders!");
    } catch (err) {
        console.error("The 9AM reset failed:", err);
    }
});

module.exports = router;