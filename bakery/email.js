import nodemailer from "nodemailer";

const sendEmail = async (senderEmail, recipient, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,  // Use environment variables
      pass: process.env.EMAIL_PASS,  // Use environment variables
    },
  });

  const mailOptions = {
    from: senderEmail,  // Use the sender's email
    to: recipient,
    subject: subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);  // Wait for the email to be sent
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);  // Log any errors that occur
    throw error;  // Re-throw the error so it can be handled in the server
  }
};

export default sendEmail;
