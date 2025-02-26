import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import sendEmail from "./email.js"; // Import the sendEmail function
import cors from "cors";

const app = express(); // Initialize 'app' here before using it

app.use(cors()); // This enables CORS for all requests

const port = process.env.PORT || 5000;

// Middleware to parse JSON data from requests
app.use(bodyParser.json());

// POST route for handling contact form submissions
app.post("/send-email", (req, res) => {
  const { recipient, subject, message } = req.body;  // Extract data from the request body
  console.log(req.body); // Add this line to see the data being sent

  sendEmail(recipient, subject, message); // Call sendEmail function
  
  res.status(200).json({ message: "Email sent successfully!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
