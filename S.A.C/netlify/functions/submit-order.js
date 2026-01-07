const nodemailer = require('nodemailer');
const { google } = require('googleapis');

exports.handler = async (event) => {
    // Only allow POST requests (the form submission)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const formData = JSON.parse(event.body);

        // Setup Google OAuth2
        const oauth2Client = new google.auth.OAuth2(
            process.env.G_CLIENT_ID,
            process.env.G_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.G_REFRESH_TOKEN
        });

        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.G_SENDER_EMAIL,
                clientId: process.env.G_CLIENT_ID,
                clientSecret: process.env.G_CLIENT_SECRET,
                refreshToken: process.env.G_REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        // 1. Email to the Owner (You)
        const ownerMail = {
            from: process.env.G_SENDER_EMAIL,
            to: process.env.G_SENDER_EMAIL,
            subject: `New Order Request from ${formData.customer_name}`,
            text: `You have a new order request.\n\nDetails:\n${JSON.stringify(formData, null, 2)}`
        };

        // 2. Email to the Customer (Confirmation)
        const customerMail = {
            from: process.env.G_SENDER_EMAIL,
            to: formData.customer_email,
            subject: `Order Received - Sweet Adventures Club`,
            text: `Hi ${formData.customer_name},\n\nWe have received your order request. We will contact you shortly to confirm details.\n\nThank you!`
        };

        await transporter.sendMail(ownerMail);
        await transporter.sendMail(customerMail);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "✅ Order Sent Successfully" })
        };

    } catch (error) {
        console.error("Error details:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "❌ Failed to send email", details: error.message })
        };
    }
};