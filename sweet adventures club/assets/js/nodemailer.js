// Load environment variables from .env file
require('dotenv').config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: process.env.EMAIL_USER, // Use the EMAIL_USER from .env
    pass: process.env.EMAIL_PASS, // Use the EMAIL_PASS from .env
  },
});

const sendOrderEmail = (orderData) => {
    console.log("Sending order email with the following data:", orderData);  // Log the order data
  
    const { name, email, address, city, state, zip, date, time, orderDetails } = orderData;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "manager-email@example.com", // Make sure this is the correct email
      subject: `Order Confirmation for ${name}`,
      text: `New order details:\n
             Name: ${name}\n
             Email: ${email}\n
             Address: ${address}\n
             City: ${city}\n
             State: ${state}\n
             Zip: ${zip}\n
             Date: ${date}\n
             Time: ${time}\n
             Order Details:\n
             ${orderDetails}`,
    };
  
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);  // Log the error
          reject(error);
        } else {
          console.log("Email sent:", info.response);  // Log the response
          resolve(info);
        }
      });
    });
  };
  

module.exports = sendOrderEmail;
