// nodemailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function sendOrderEmail(orderData) {
  const { name, email, address, city, state, zip, date, time, orderDetails } = orderData;

  const mailOptions = {
    from: `"Cheesecake Orders" <${process.env.EMAIL_USER}>`,
    to: email, // Send to the customer
    subject: `Order Confirmation for ${date} at ${time}`,
    html: `
      <h2>Thank you for your order, ${name}!</h2>
      <p><strong>Pickup Time:</strong> ${date} at ${time}</p>
      <p><strong>Delivery Address:</strong> ${address}, ${city}, ${state} ${zip}</p>
      <p><strong>Order Details:</strong><br>${orderDetails}</p>
      <p>We'll see you soon!</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendOrderEmail;
