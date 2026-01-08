const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.G_SENDER_EMAIL,
        pass: process.env.G_PASS
      }
    });

    const mailOptions = {
      from: process.env.G_SENDER_EMAIL,
      to: process.env.G_SENDER_EMAIL, 
      subject: `New Connect Message from ${data.name || 'User'}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`
    };

    await transporter.sendMail(mailOptions);
    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Connect email sent!" }) 
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};