const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to // Must be in E.164 format (e.g., +11234567890)
        });
        console.log("SMS Sent Successfully");
    } catch (error) {
        console.error("Twilio Error:", error.message);
    }
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Holidays = require('date-holidays'); 
require('dotenv').config();

const Appointment = require('./models/Appointment'); 

const app = express();
const hd = new Holidays('US'); 

app.use(cors());
app.use(express.json());

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- ADMIN AUTHENTICATION (SIMPLE) ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        res.json({ success: true, message: "Logged In" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

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
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();

        // --- THE SMS TRIGGER ---
        const customerPhone = req.body.phone; // Ensure this is formatted correctly
        const appointmentDate = new Date(req.body.date).toLocaleString();
        
        const smsMessage = `Hi ${req.body.clientName}, your appointment for ${req.body.service} on ${appointmentDate} is confirmed! Thank you!`;
        
        await sendSMS(customerPhone, smsMessage);
        // -----------------------

        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 2. CRM & ADMIN LOGIC ---

// FETCH CUSTOMERS WITH NESTED HISTORY FOR EXPORT
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
          lastVisit: { $max: "$date" },
          // This creates the list of visits for the Excel export
          history: { 
            $push: { 
                date: "$date", 
                service: "$service", 
                status: "$status",
                notes: "$notes"
            } 
          }
        }
      },
      { $sort: { lastVisit: -1 } }
    ]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Customer Identity
app.patch('/api/admin/customers/:email', async (req, res) => {
    try {
        const { clientName, phone, pronouns } = req.body;
        const targetEmail = req.params.email;

        const result = await Appointment.updateMany(
            { email: { $regex: new RegExp("^" + targetEmail + "$", "i") } },
            { $set: { clientName, phone, pronouns } }
        );

       const mailOptions = {
            from: `"Customer Service" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Account Information Updated',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Information Update</h1>
                    </div>
                    <div style="padding: 30px; color: #333333; line-height: 1.6;">
                        <p style="font-size: 18px;">Hello <b>${clientName}</b>,</p>
                        <p>This is a formal confirmation that your contact information has been successfully updated in our system.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2c3e50;">
                            <p style="margin: 5px 0;"><strong>Updated Name:</strong> ${clientName}</p>
                            <p style="margin: 5px 0;"><strong>Updated Phone:</strong> ${phone}</p>
                            ${pronouns ? `<p style="margin: 5px 0;"><strong>Pronouns:</strong> ${pronouns}</p>` : ''}
                        </div>

                        <p>If you did not authorize these changes, please contact our support team immediately.</p>
                        <p style="margin-top: 30px;">Thank you,<br><strong>Management Team</strong></p>
                    </div>
                    <div style="background-color: #f4f4f4; color: #777777; padding: 15px; text-align: center; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Grimoire CRM. All rights reserved.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Customer identity updated and email sent.", result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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

app.get('/api/admin/appointments', async (req, res) => {
    try {
        const apps = await Appointment.find().sort({ date: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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