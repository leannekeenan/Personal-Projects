const express = require("express");
const bodyParser = require("body-parser");
const sendOrderEmail = require("./nodemailer"); // Import the email-sending function

const app = express();
app.use(bodyParser.json());

app.post("/send-order", (req, res) => {
  const { name, email, address, city, state, zip, date, time, orderDetails } = req.body;

  const orderData = {
    name,
    email,
    address,
    city,
    state,
    zip,
    date,
    time,
    orderDetails,
  };

  // Call the function from nodemailer.js to send the email
  sendOrderEmail(orderData)
    .then(() => {
      res.status(200).send("Order submitted and confirmation email sent!");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send order.");
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
