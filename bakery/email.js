import nodemailer from "nodemailer";

const sendEmail = (recipient, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,  // Use environment variables
          pass: process.env.EMAIL_PASS,  // Use environment variables
        },
      });   
  const mailOptions = {
    from: "sweetadventuresclub@gmail.com",  // Replace with your email
    to: recipient,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
      return;
    }
    console.log("Email sent:", info.response);
  });
};

export default sendEmail;
