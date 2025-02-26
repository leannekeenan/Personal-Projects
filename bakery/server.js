import express from "express";
import bodyParser from "body-parser";
import sendEmail from "./email.js"; // Import the sendEmail function
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express(); // Initialize 'app' here before using it

app.use(cors()); // This enables CORS for all requests

const port = process.env.PORT || 5000;

// Middleware to parse JSON data from requests
app.use(bodyParser.json());

// POST route for handling contact form submissions
app.post("/send-email", async (req, res) => {
  const { senderEmail, recipient, subject, message } = req.body;  // Extract data from the request body
  console.log("Received email data:", req.body); // Log the data to verify what's being received

  try {
    // Call sendEmail function and wait for its result
    await sendEmail(senderEmail, recipient, subject, message);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.log("Error in email sending:", error);
    res.status(500).json({ message: "There was an error sending the email." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
