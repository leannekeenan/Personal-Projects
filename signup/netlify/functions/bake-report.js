const { schedule } = require('@netlify/functions');
const mongoose = require('mongoose');
const Preorder = require('../../models/Preordering'); 
const nodemailer = require('nodemailer');

module.exports.handler = schedule('0 20 * * *', async (event) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const todaysOrders = await Preorder.find({ status: 'active' });
        
        if (todaysOrders.length === 0) {
            return { statusCode: 200 };
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
            itemsSummary += `<tr>
                <td style="padding:10px; border-bottom:1px solid #eee; word-break: break-word;"><strong>${order.customer_name}</strong></td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${individualLoot.join('<br>')}</td>
                <td style="padding:10px; border-bottom:1px solid #eee;">${order.delivery_time || 'N/A'}</td>
                <td style="padding:10px; border-bottom:1px solid #eee; font-size: 0.9em;">${order.pickup_location}</td>
            </tr>`;
        });

        let bakeListHTML = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff;">';
        bakeListHTML += '<tr style="background:#d4a373; color:white;"> <th style="padding:10px;">Flavor</th> <th style="padding:10px;">Total Units to Bake</th> </tr>';
        for (const [flavor, count] of Object.entries(flavorTotals)) {
            bakeListHTML += `<tr><td style="padding:10px; border-bottom:1px solid #eee;">${flavor}</td><td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${count}</td></tr>`;
        }
        bakeListHTML += '</table>';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

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
                        <thead>
                            <tr style="background: #f0decc;">
                                <th style="padding:10px; text-align:left;">Customer</th>
                                <th style="padding:10px; text-align:left;">Details</th>
                                <th style="padding:10px; text-align:left;">Arrival</th>
                                <th style="padding:10px; text-align:left;">Pickup Location</th>
                            </tr>
                        </thead>
                        <tbody>${itemsSummary}</tbody>
                    </table>
                  </div>`
        });

        await Preorder.updateMany({ status: 'active' }, { $set: { status: 'completed' } });

        return { statusCode: 200 };

    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
});