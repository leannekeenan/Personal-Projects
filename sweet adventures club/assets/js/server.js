const express = require("express");
const bodyParser = require("body-parser");
const sendOrderEmail = require("./nodemailer");
require("dotenv").config();
const cors = require('cors');
app.use(cors());

const app = express();
const orders = {}; // In-memory store for orders

app.use(bodyParser.json());
app.use(express.static("public")); // Serve front-end files

// Store order data (for availability tracking)
app.post("/api/orders", (req, res) => {
  const { date, time } = req.body;
  if (!orders[date]) {
    orders[date] = [];
  }
  orders[date].push(time);
  res.json({ success: true });
});

// Email route to send the order to customer and admin
app.post("/send-order", async (req, res) => {
  try {
    // Send email to customer
    await sendOrderEmail(req.body);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Email failed to send." });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
