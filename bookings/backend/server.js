const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); 
require('dotenv').config();

const Appointment = require('./models/Appointment'); 
// Ensure your Appointment model in models/Appointment.js includes the 'pronouns' field.

const app = express();
const hd = new Holidays('US'); 

app.use(cors());
app.use(express.json());

// --- 1. APPOINTMENT BOOKING & AVAILABILITY ---

app.get('/api/appointments/check', async (req, res) => {
  try {
    const { date } = req.query; 
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const takenSlots = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).select('date -_id');
    
    res.json(takenSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 2. CRM & ADMIN LOGIC ---

// Main CRM List: Groups by email to show unique customers
// Uses $last to ensure the most recently updated Name/Pronouns are displayed
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await Appointment.aggregate([
      {
        $group: {
          _id: { $toLower: "$email" }, 
          clientName: { $last: "$clientName" }, 
          phone: { $last: "$phone" },
          email: { $first: "$email" },
          pronouns: { $last: "$pronouns" },
          totalBookings: { $sum: 1 },
          lastVisit: { $max: "$date" }
        }
      },
      { $sort: { lastVisit: -1 } }
    ]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Customer Identity (The Respectful Update)
// Updates every historical record for this email so names like "Danni" persist everywhere
app.patch('/api/admin/customers/:email', async (req, res) => {
    try {
        const { clientName, phone, pronouns } = req.body;
        const result = await Appointment.updateMany(
            { email: { $regex: new RegExp("^" + req.params.email + "$", "i") } },
            { $set: { clientName, phone, pronouns } }
        );
        res.json({ message: "Customer identity updated across all records.", result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Customer History: Get all appointments for a specific email
app.get('/api/admin/customers/:email/history', async (req, res) => {
  try {
    const history = await Appointment.find({ 
        email: { $regex: new RegExp("^" + req.params.email + "$", "i") } 
    }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. DASHBOARD CONTROLS ---

// Fetch all appointments for Dashboard view
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const apps = await Appointment.find().sort({ date: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Individual Appointment Status
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

// Delete/Cancel Appointment
app.delete('/api/admin/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 4. SERVER STARTUP ---

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)))
  .catch(err => console.error("Database connection error:", err));


  // Example update route in your backend
app.patch('/api/appointments/:id', async (req, res) => {
    try {
        const updatedAppt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // After saving, send the notification
        await sendUpdateEmail(updatedAppt);
        
        res.json(updatedAppt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});