const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); 
require('dotenv').config();

const Appointment = require('./models/Appointment'); 
// Ensure your Appointment model has: clientName, email, phone, service, date, notes, status, customerType

const app = express();
const hd = new Holidays('US'); 

app.use(cors());
app.use(express.json());

// --- 1. APPOINTMENT BOOKING & CHECKING ---

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

// --- 2. CRM & ADMIN ROUTES ---

// Main CRM List: Groups by email to show unique customers
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await Appointment.aggregate([
      {
        $group: {
          _id: { $toLower: "$email" }, 
          clientName: { $first: "$clientName" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
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

// Update Status (Dashboard)
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

// Fetch all appointments for Dashboard
app.get('/api/admin/appointments', async (req, res) => {
    try {
        const apps = await Appointment.find().sort({ date: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel Appointment
app.delete('/api/admin/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`)))
  .catch(err => console.log(err));

  // Update Customer Details (CRM)
app.patch('/api/admin/customers/:email', async (req, res) => {
    try {
        const { clientName, phone, pronouns } = req.body;
        
        // We update the Appointment records because that is where our data lives
        const result = await Appointment.updateMany(
            { email: { $regex: new RegExp("^" + req.params.email + "$", "i") } },
            { $set: { clientName, phone, pronouns } }
        );

        res.json({ message: "Customer updated successfully", result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});