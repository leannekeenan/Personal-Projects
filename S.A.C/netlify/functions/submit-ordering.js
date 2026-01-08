const nodemailer = require('nodemailer');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
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

        // Helper function to only list items that have a quantity > 0
        const orderSummary = Object.entries(data)
            .filter(([key, val]) => val > 0 && key.includes('_qty'))
            .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}`)
            .join('\n');

        const mailOptions = {
            from: process.env.G_SENDER_EMAIL,
            to: process.env.G_SENDER_EMAIL,
            subject: `NEW ORDER: ${data.customer_name}`,
            text: `New Order Details:
--------------------------------------------------
CUSTOMER INFO:
Name: ${data.customer_name}
Email: ${data.customer_email}
Phone: ${data.phone_number}

DELIVERY INFO:
Address: ${data.delivery_address}
Date: ${data.delivery_date}
Time Window: ${data.delivery_time}

ITEMS ORDERED:
${orderSummary || "No items selected"}

SPECIAL INSTRUCTIONS:
${data.special_instructions || "None provided"}
--------------------------------------------------`
        };

        await transporter.sendMail(mailOptions);

        return { 
            statusCode: 302, 
            headers: { "Location": "/success.html" },
            body: JSON.stringify({ message: "Order Sent" }) 
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};