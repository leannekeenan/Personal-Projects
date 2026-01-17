const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); 
require('dotenv').config();

const Appointment = require('./models/Appointment'); 
const adminRoutes = require('./models/Admin');

const app = express();
const hd = new Holidays('US'); 

app.use(cors());
app.use(express.json());

// --- BOOKING ROUTES ---
app.get('/api/appointments/check', async (req, res) => {
  try {
    const { date } = req.query; 
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const takenSlots = await Appointment.find({ date: { $gte: startOfDay, $lte: endOfDay } }).select('date -_id');
    res.json(takenSlots);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const bookingDate = new Date(req.body.date);
    const holidayCheck = hd.isHoliday(bookingDate);
    if (holidayCheck && holidayCheck.some(h => h.type === 'public')) {
      return res.status(400).json({ message: "Closed on holidays." });
    }
    const newAppointment = new Appointment(req.body);
    const saved = await newAppointment.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- CRM & ADMIN ROUTES ---

// Get unique customers
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await Appointment.aggregate([
      {
        $group: {
          _id: { $toLower: "$email" }, 
          clientName: { $first: "$clientName" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          pronouns: { $first: "$pronouns" },
          totalBookings: { $sum: 1 },
          lastVisit: { $max: "$date" }
        }
      },
      { $sort: { lastVisit: -1 } }
    ]);
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// NEW: Update Customer Route (Pronouns/Phone/Name)
app.patch('/api/admin/customers/:email', async (req, res) => {
    try {
        const { clientName, phone, pronouns } = req.body;
        await Appointment.updateMany(
            { email: { $regex: new RegExp("^" + req.params.email + "$", "i") } },
            { $set: { clientName, phone, pronouns } }
        );
        res.json({ message: "Updated successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/admin/customers/:email/history', async (req, res) => {
  try {
    const history = await Appointment.find({ email: { $regex: new RegExp("^" + req.params.email + "$", "i") } }).sort({ date: -1 });
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/api/admin/appointments/:id/status', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`)))
  .catch(err => console.log(err));