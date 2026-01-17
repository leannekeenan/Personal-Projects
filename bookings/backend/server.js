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

const SERVICE_PRICES = {
    "Consultation": 50,
    "Emergency": 100,
    "Follow-up": 250,
};

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

// --- 1. PUBLIC BOOKING ROUTE ---
app.post('/api/appointments', async (req, res) => {
    try {
        const bookingDate = new Date(req.body.date);
        const holidayCheck = hd.isHoliday(bookingDate);
        if (holidayCheck && holidayCheck.some(h => h.type === 'public')) {
            return res.status(400).json({ message: "Closed on holidays." });
        }
        const existingCount = await Appointment.countDocuments({ date: bookingDate });
        if (existingCount >= 2) return res.status(400).json({ message: "Slot full." });

        const newAppointment = new Appointment(req.body);
        const saved = await newAppointment.save();

        const dateString = new Date(saved.date).toLocaleString([], { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        const smsText = `Hi ${saved.clientName}, your ${saved.service} at Grimoire is confirmed for ${dateString}.`;
        await sendSMS(saved.phone, smsText);

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 2. ADMIN: FETCH ALL APPOINTMENTS ---
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: -1 });
        res.json(appointments); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 3. ADMIN: FETCH CUSTOMERS (CRM) - THIS WAS MISSING ---
app.get('/api/admin/customers', async (req, res) => {
    try {
        // This groups appointments by email to create a unique customer list
        const customers = await Appointment.aggregate([
            { $sort: { date: -1 } },
            { $group: {
                _id: "$email",
                clientName: { $first: "$clientName" },
                phone: { $first: "$phone" },
                email: { $first: "$email" }
            }}
        ]);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 4. AVAILABILITY CHECK ---
app.get('/api/appointments/check', async (req, res) => {
    try {
        const { date } = req.query; 
        if (!date) return res.status(400).json({ message: "Date is required" });
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const bookings = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 5. UPDATE STATUS ---
app.patch('/api/admin/appointments/:id/status', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 6. DELETE ---
app.delete('/api/admin/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 7. ANALYTICS ---
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        let totalRevenue = 0;
        const serviceMap = {};
        appointments.forEach(appt => {
            const price = SERVICE_PRICES[appt.service] || 0;
            totalRevenue += price;
            if (!serviceMap[appt.service]) serviceMap[appt.service] = 0;
            serviceMap[appt.service] += price;
        });
        res.json({ 
            summary: { totalRevenue, count: appointments.length }, 
            revenueByService: Object.keys(serviceMap).map(s => ({ _id: s, value: serviceMap[s] })),
            exportData: appointments 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✨ Grimoire Database Connected"))
    .catch(err => console.error("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔮 Server running on port ${PORT}`));