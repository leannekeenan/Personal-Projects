//require('dotenv').config();
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
// Make sure this path points correctly to your model
const Preorder = require('./backend/models/Preordering'); 

async function runLedger() {
    try {
        console.log("Connecting to the Archive (MongoDB)...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const todaysOrders = await Preorder.find({ status: 'active' });
        console.log(`Found ${todaysOrders.length} active orders.`);

        if (todaysOrders.length === 0) {
            console.log("No active orders found. Ending quest.");
            process.exit();
        }

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
            itemsSummary += `<tr><td>${order.customer_name}</td><td>${individualLoot.join('<br>')}</td></tr>`;
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        console.log("Dispatching the Ledger via raven (Email)...");
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `📜 MANUAL LEDGER TEST`,
            html: `<h1>Bake Report</h1>${itemsSummary}<h2>Total: ${grandTotalUnits}</h2>`
        });

        console.log("Email sent! Success.");
        // OPTIONAL: Comment this out if you don't want to flip the orders to 'completed' yet
        // await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });
        
        process.exit();
    } catch (err) {
        console.error("The raven crashed:", err);
        process.exit(1);
    }
}

runLedger();