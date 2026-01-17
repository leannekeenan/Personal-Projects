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

// --- PRICE LIST CONFIGURATION ---
// These prices are used for Analytics calculations since they aren't stored in the DB
const SERVICE_PRICES = {
    "Consultation": 50,
    "Emergency": 100,
    "Follow-up": 250,
};

// --- TWILIO CONFIGURATION ---
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

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 1. APPOINTMENT BOOKING & SMS TRIGGER ---
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

        // Trigger SMS Reminder
        const dateString = new Date(saved.date).toLocaleString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const smsText = `Hi ${saved.clientName}, your ${saved.service} at Grimoire is confirmed for ${dateString}. See you then!`;
        
        await sendSMS(saved.phone, smsText);

        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 2. ADMIN DASHBOARD ROUTE ---
// This provides the data for the Admin Dashboard table
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 3. COMMAND CENTER / ANALYTICS ROUTE ---
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: -1 });

        let totalRevenue = 0;
        const serviceMap = {};

        appointments.forEach(appt => {
            // Look up price from the SERVICE_PRICES list above
            const price = SERVICE_PRICES[appt.service] || 0;
            totalRevenue += price;

            if (!serviceMap[appt.service]) {
                serviceMap[appt.service] = 0;
            }
            serviceMap[appt.service] += price;
        });

        const revenueByService = Object.keys(serviceMap).map(service => ({
            _id: service,
            value: serviceMap[service]
        }));

        res.json({ 
            summary: {
                totalRevenue,
                count: appointments.length,
                avgTicket: appointments.length > 0 ? totalRevenue / appointments.length : 0
            }, 
            revenueByService,
            exportData: appointments 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 4. CRM / CUSTOMER ROUTE ---
app.get('/api/admin/customers', async (req, res) => {
    try {
        const customers = await Appointment.aggregate([
            {
                $group: {
                    _id: "$email",
                    name: { $first: "$clientName" },
                    phone: { $first: "$phone" },
                    email: { $first: "$email" },
                    visits: { $sum: 1 }
                }
            }
        ]);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SERVER & DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running with SMS enabled on port ${PORT}`)))
  .catch(err => console.error("Database connection error:", err));