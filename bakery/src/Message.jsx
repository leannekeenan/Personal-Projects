import React, { useState } from 'react';

const Message = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the email data to send
    const emailData = {
      senderEmail: email,  // Adding the sender's email
      recipient: "sweetadventuresclub@gmail.com",  // The email address you want to receive the messages at
      subject: subject,
      message: message,
    };

    try {
      const response = await fetch("http://localhost:5000/send-email", {  // Assuming your backend is on localhost:5000
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),  // Send email data to backend
      });

      if (response.ok) {
        alert("Your message has been sent!");
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        alert("There was an error sending your message.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending your message.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button className='submit' type="submit">Send Message</button>
    </form>
  );
};

export default Message;
