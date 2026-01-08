const nodemailer = require('nodemailer');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // This handles both JSON and standard Form URL-encoded data
        let data;
        if (event.headers['content-type'] === 'application/json') {
            data = JSON.parse(event.body);
        } else {
            data = querystring.parse(event.body);
        }

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
            subject: `Connect Form: ${data.name || 'New Message'}`,
            text: `You have a new message:\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`
        };

        await transporter.sendMail(mailOptions);

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: "Success! Message Sent." }) 
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};