const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays');
const twilio = require('twilio');
require('dotenv').config();

const Appointment = require('./models/Appointment');

const app = express();
const hd = new Holidays('US');

// FIXED: All services must be here for Analytics to work
const SERVICE_PRICES = {
    "Consultation": 50,
    "Emergency": 100,
    "Follow-up": 250,
};

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- SMS CONFIGURATION ---
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    try {
        const cleanedPhone = to.replace(/\D/g, '');
        const formattedPhone = cleanedPhone.startsWith('1') ? `+${cleanedPhone}` : `+1${cleanedPhone}`;
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log(`🚀 SMS Sent to ${formattedPhone}`);
    } catch (error) {
        console.error("❌ Twilio Error:", error.message);
    }
};

app.use(cors());
app.use(express.json());

// DEBUG LOGGING
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
});

// --- 1. INTEGRATED BOOKING ROUTE ---
app.post('/api/appointments', async (req, res) => {
    try {
        const { clientName, email, phone, service, date, notes, customerType } = req.body;
        const bookingDate = new Date(date);

        // Holiday & Capacity Checks
        const holidayCheck = hd.isHoliday(bookingDate);
        if (holidayCheck && holidayCheck.some(h => h.type === 'public')) {
            return res.status(400).json({ message: "Closed on holidays." });
        }
        const existingCount = await Appointment.countDocuments({ date: bookingDate });
        if (existingCount >= 2) return res.status(400).json({ message: "Slot full." });

        // 1. Save to Database
        const newAppointment = new Appointment({
            clientName,
            email,
            phone,
            service,
            date,
            notes,
            customerType: customerType || 'new',
            status: 'Scheduled'
        });
        const saved = await newAppointment.save();

        // 2. Formatting Date for communications
        const dateString = new Date(saved.date).toLocaleString([], { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // 3. Define HTML Templates
        const clientHtml = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #d4a3a3; border-radius: 8px;">
                <h2 style="color: #d4a3a3;">Booking Confirmed!</h2>
                <p>Hello <strong>${clientName}</strong>,</p>
                <p>Your appointment for <strong>${service}</strong> is scheduled for <strong>${dateString}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p><strong>Notes:</strong> ${notes || 'N/A'}</p>
                <p>We look forward to seeing you.</p>
            </div>
        `;

        const companyHtml = `
            <div style="background: #f4f4f4; padding: 20px; font-family: sans-serif;">
                <h3 style="margin-top: 0;">New Booking Alert</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px;"><strong>Client:</strong></td><td>${clientName}</td></tr>
                    <tr><td style="padding: 5px;"><strong>Service:</strong></td><td>${service}</td></tr>
                    <tr><td style="padding: 5px;"><strong>Contact:</strong></td><td>${phone} | ${email}</td></tr>
                    <tr><td style="padding: 5px;"><strong>Time:</strong></td><td>${dateString}</td></tr>
                </table>
                <p><strong>Admin Notes:</strong> ${notes || 'None'}</p>
            </div>
        `;

        // 4. Dispatch Communications
        await sendSMS(phone, `Hi ${clientName}, your ${service} at Grimoire is confirmed for ${dateString}.`);

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Appointment Confirmed - Grimoire',
                html: clientHtml 
            });
        } catch (err) { console.error("❌ Client Email Error:", err); }

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
                subject: `ALERT: New Manual Booking - ${clientName}`,
                html: companyHtml
            });
        } catch (err) { console.error("❌ Company Email Error:", err); }

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 5. ADMIN: FETCH ALL ---
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: -1 });
        res.json(appointments); 
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 6. ADMIN: FETCH CUSTOMERS (CRM) - FIXED FOR EDDIE ---
app.get('/api/admin/customers', async (req, res) => {
    try {
        const customers = await Appointment.aggregate([
            { $sort: { date: -1 } },
            { 
                $group: {
                    // Grouping by BOTH name and email so shared emails don't hide names
                    _id: { email: "$email", name: "$clientName" },
                    clientName: { $first: "$clientName" },
                    phone: { $first: "$phone" },
                    email: { $first: "$email" }
                } 
            }
        ]);
        res.json(customers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 7. AVAILABILITY CHECK ---
app.get('/api/appointments/check', async (req, res) => {
    try {
        const { date } = req.query; 
        const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);
        const bookings = await Appointment.find({ date: { $gte: startOfDay, $lte: endOfDay } });
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 8. UPDATE STATUS ---
app.patch('/api/admin/appointments/:id/status', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 9. DELETE ---
app.delete('/api/admin/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 10. ANALYTICS ---
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        let totalRevenue = 0;
        const serviceMap = {};
        appointments.forEach(appt => {
            const price = SERVICE_PRICES[appt.service] || 0;
            totalRevenue += price;
            serviceMap[appt.service] = (serviceMap[appt.service] || 0) + price;
        });
        res.json({ 
            summary: { totalRevenue, count: appointments.length }, 
            revenueByService: Object.keys(serviceMap).map(s => ({ _id: s, value: serviceMap[s] })),
            exportData: appointments 
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 11. CUSTOMER HISTORY ---
app.get('/api/admin/customers/:email/history', async (req, res) => {
    try {
        const history = await Appointment.find({ email: req.params.email }).sort({ date: -1 });
        res.json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 12. UPDATE CUSTOMER IDENTITY ---
app.patch('/api/admin/customers/:email', async (req, res) => {
    try {
        await Appointment.updateMany(
            { email: req.params.email },
            { $set: { clientName: req.body.clientName, phone: req.body.phone } }
        );
        res.json({ message: "Identity updated." });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 13. TEST SMS ---
app.post('/api/admin/test-sms', async (req, res) => {
    try {
        await sendSMS(req.body.phone, req.body.message || "Test Message");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✨ Grimoire Database Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔮 Server running on port ${PORT}`));