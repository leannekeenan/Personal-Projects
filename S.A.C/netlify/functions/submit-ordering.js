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
      subject: `NEW ORDER: ${data.order_id || 'General Order'}`,
      text: `Order Details:\nName: ${data.name}\nItems: ${data.items}\nTotal: ${data.total}\nAddress: ${data.address}\nSpecial Instructions: ${data.message}`
    };

    await transporter.sendMail(mailOptions);
    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Order email sent!" }) 
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};