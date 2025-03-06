require('dotenv').config();  // Move this to the top
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');  

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());


// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

require('dotenv').config();

// GET route to test server
app.get('/', (req, res) => {
  res.send('Server is running');
});
// Email transport setup (you can use Gmail's SMTP server or another service)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using Gmail's service
  auth: {
    user: process.env.EMAIL_USER,  // Read from .env file
    pass: process.env.EMAIL_PASS   // Read from .env file
  }
});

// Route to handle sending emails

app.post("/send-email", async (req, res) => {
  console.log("📩 Incoming email request:", req.body);

  try {
    let info = await transporter.sendMail({
      from: req.body.senderEmail,
      to: req.body.recipient,
      subject: req.body.subject,
      text: req.body.message,
    });

    console.log("✅ Email sent:", info);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
