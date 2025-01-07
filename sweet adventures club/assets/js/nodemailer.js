const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@example.com',  // Replace with your email
    pass: 'your-email-password'  // Replace with your email password or app password
  }
});

app.post('/send-receipt', (req, res) => {
  const { toClient, toCompany } = req.body;

  const mailOptionsClient = {
    from: 'your-email@example.com',  // Replace with your email
    to: toClient.email,
    subject: toClient.subject,
    text: toClient.body
  };

  const mailOptionsCompany = {
    from: 'your-email@example.com',  // Replace with your email
    to: toCompany.email,
    subject: toCompany.subject,
    text: toCompany.body
  };

  transporter.sendMail(mailOptionsClient, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email');
    }
  });

  transporter.sendMail(mailOptionsCompany, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email');
    }
    res.status(200).send('Receipt sent');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
