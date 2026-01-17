const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); // This is what was missing
require('dotenv').config();

const Appointment = require('./models/Appointment'); 
const adminRoutes = require('./models/Admin');

const app = express();
const hd = new Holidays('US'); // Initialize US Holiday logic

// CRM: Customer Schema and Model (Added for Returning Customer logic)
const customerSchema = new mongoose.Schema({
    clientName: String,
    email: { type: String, unique: true },
    phone: String,
    lastBooking: Date,
    appointmentCount: { type: Number, default: 1 }
});
const Customer = mongoose.model('Customer', customerSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Check Availability Route
app.get('/api/appointments/check', async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Date is required" });

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

// Create Booking Route (with Holiday, Capacity, and CRM logic)
app.post('/api/appointments', async (req, res) => {
  try {
    const bookingDate = new Date(req.body.date);
    
    // 1. Server-side block for holidays and weekends
    const holidayCheck = hd.isHoliday(bookingDate);
    const isHoliday = holidayCheck && holidayCheck.some(h => h.type === 'public');

    if (isHoliday) {
      return res.status(400).json({ message: "We are closed on holidays 😎. Please select another date." });
    }

    // 2. STRICT CAPACITY CHECK: Block if more than 2 people are in this 15-min slot
    const existingCount = await Appointment.countDocuments({ date: bookingDate });
    if (existingCount >= 2) {
        return res.status(400).json({ 
            message: "❌ This specific 15-minute slot is full. Please pick another time." 
        });
    }

    // 3. Save Appointment
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();

    // 4. CRM logic: Automatically create or update Customer profile
    try {
        const customerUpdate = {
            clientName: savedAppointment.clientName,
            phone: savedAppointment.phone,
            lastBooking: savedAppointment.date,
        };
        
        await Customer.findOneAndUpdate(
            { email: savedAppointment.email.toLowerCase() },
            { 
                $set: customerUpdate,
                $inc: { appointmentCount: 1 } 
            },
            { upsert: true, new: true }
        );
    } catch (crmErr) {
        console.error("CRM Update Failed:", crmErr.message);
    }

    // 5. Send Emails (HTML Formatting)
    try {
      const mailOptionsCustomer = {
        from: process.env.EMAIL_USER,
        to: savedAppointment.email,
        subject: `Booking Confirmed: ${savedAppointment.service} with [Your Company Name]`,
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Appointment Confirmed!</h2>
            <p>Hi <strong>${savedAppointment.clientName}</strong>,</p>
            <p>Thank you for booking with us. We have you scheduled for a <strong>${savedAppointment.service}</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${new Date(savedAppointment.date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;">⏰ <strong>Time:</strong> ${new Date(savedAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p style="margin: 5px 0;">📝 <strong>Your Notes:</strong> ${savedAppointment.notes || 'No additional notes provided'}</p>
            </div>

            <p>If you need to reschedule or have any questions, please reply to this email or call us at [Your Phone Number].</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
                [Your Company Name] <br>
                [Your Address or Website]
            </p>
        </div>
        `
      };

      const mailOptionsAdmin = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sends to yourself
        subject: `NEW BOOKING: ${savedAppointment.clientName} - ${savedAppointment.service}`,
        html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #2c3e50;">
            <h2 style="color: #2c3e50;">New Appointment Alert</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Client:</strong></td><td>${savedAppointment.clientName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td>${savedAppointment.service}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td>${savedAppointment.phone}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td>${savedAppointment.email}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td>${new Date(savedAppointment.date).toLocaleString()}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Notes:</strong></td><td>${savedAppointment.notes}</td></tr>
            </table>
            <p><a href="[Link To Your Admin Dashboard]" style="display: inline-block; padding: 10px 20px; background-color: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Dashboard</a></p>
        </div>
        `
      };

      await transporter.sendMail(mailOptionsCustomer);
      await transporter.sendMail(mailOptionsAdmin);

    } catch (emailErr) {
      console.error("Email notification failed:", emailErr.message);
    }

    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err));


  // Get unique customers for the CRM

app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await Appointment.aggregate([
      {
        $group: {
          _id: "$email", 
          clientName: { $first: "$clientName" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          customerType: { $first: "$customerType" },
          totalBookings: { $sum: 1 },
          lastVisit: { $max: "$date" }
        }
      },
      { $sort: { clientName: 1 } }
    ]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get full history for a specific customer by email
app.get('/api/admin/customers/:email/history', async (req, res) => {
  try {
    const history = await Appointment.find({ email: req.params.email }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});