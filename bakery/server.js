const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');  // To handle cross-origin requests

const app = express();
const port = 5000;

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
app.post('/send-email', (req, res) => {
  const { senderEmail, recipient, subject, message } = req.body;

  const mailOptions = {
    from: senderEmail,
    to: recipient,
    subject: subject,
    text: message,
  };

  // Send the email using nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Failed to send email' });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
