// C:\Users\leann\OneDrive\Desktop\sweet\js\server.js
// --- Configuration & Imports ---

// 1. Define PORT and Load Environment Variables (MUST be first line after defining PORT)
const PORT = process.env.PORT || 8080; 

require('dotenv').config();

const express = require('express');
const cors = require('cors'); 
const nodemailer = require('nodemailer'); 
const { google } = require('googleapis'); 

const app = express();

// --- Middleware ---
app.use(cors({ origin: '*' })); // Allows cross-origin requests for local testing
app.use(express.json()); // Middleware to parse incoming JSON data (only needed once)


// --- 2. OAuth2 Client Setup (Uses your four .env keys) ---
const OAUTH_CLIENT = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' 
);

// Use the valid Refresh Token 
OAUTH_CLIENT.setCredentials({ refresh_token: process.env.G_REFRESH_TOKEN });

/**
 * Creates a secure Nodemailer transporter by fetching a fresh Access Token 
 */
async function createTransporter() {
    try {
        const accessToken = await OAUTH_CLIENT.getAccessToken();

        if (!accessToken || !accessToken.token) {
            throw new Error("Access Token is undefined or invalid.");
        }

        return nodemailer.createTransport({
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
    } catch (error) {
        console.error('❌ AUTHENTICATION FAILED:', error.message);
        throw new Error('OAuth2 Authentication Failed. Check your Refresh Token and .env file for errors.');
    }
}

// Helper function to format order items consistently
function formatOrderItems(orderItems) {
    let list = '';
    orderItems.forEach(item => {
        // Cleans up the item name (e.g., 'vanilla_veil_cake_qty' -> 'Vanilla Veil Cake')
        const itemName = item.name
            .replace(/_/g, ' ')
            .replace(/qty$/, '')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        list += ` - ${itemName}: ${item.quantity}\n`;
    });
    return list;
}

// --- 3. ENDPOINT 1: /submit-order (Order Request Form) ---
app.post('/submit-order', async (req, res) => {
    const formData = req.body;
    console.log('Order received and processing:', formData.customer_name);
    
    // Check if order_items exists before trying to format
    const itemsList = Array.isArray(formData.order_items) 
                     ? formatOrderItems(formData.order_items) 
                     : "No order items listed.";


    // =======================================================
    // A. REQUISITION ORDER (TO BUSINESS OWNER) - The 5 W's
    // =======================================================
    let ownerEmailBody = `\n--- REQUISITION ORDER ---\n\n`;
    
    // 1. WHO (Contact Details)
    ownerEmailBody += `WHO (Customer): ${formData.customer_name}\n`;
    ownerEmailBody += `Email: ${formData.customer_email}\n`;
    ownerEmailBody += `Phone: ${formData.phone_number}\n\n`;

    // 2. WHEN (Time/Date/Location)
    ownerEmailBody += `WHEN (Delivery): ${formData.delivery_date} at ${formData.delivery_time}\n`;
    ownerEmailBody += `WHERE (Location): ${formData.delivery_address}\n\n`;
    
    // 3. WHAT (Flavors/Items)
    ownerEmailBody += `WHAT (Order Details):\n${itemsList}\n`;

    // 4. WHY/HOW (Instructions)
    ownerEmailBody += `HOW (Instructions): ${formData.special_instructions || 'None'}\n\n`;
    ownerEmailBody += `--- END REQUISITION ---`;


    // =======================================================
    // B. CLIENT RECEIPT (TO CUSTOMER)
    // =======================================================
    let clientEmailBody = `Hello ${formData.customer_name},\n\n`;
    clientEmailBody += `Thank you for your Sweet Adventures Club order request! We have successfully received your details.\n\n`;
    clientEmailBody += `--------------------------------------\n`;
    clientEmailBody += `ORDER REQUEST SUMMARY\n`;
    clientEmailBody += `--------------------------------------\n`;
    clientEmailBody += `DELIVERY DETAILS:\n`;
    clientEmailBody += `Date: ${formData.delivery_date} at ${formData.delivery_time}\n`;
    clientEmailBody += `Address: ${formData.delivery_address}\n`;
    clientEmailBody += `Phone: ${formData.phone_number}\n\n`;
    clientEmailBody += `REQUESTED ITEMS:\n${itemsList}\n`;
    clientEmailBody += `Special Instructions: ${formData.special_instructions || 'None'}\n`;
    clientEmailBody += `--------------------------------------\n\n`;
    clientEmailBody += `**IMPORTANT NOTE:** This email confirms your *request* only. We will review the order for capacity and ingredients, then contact you soon via email or phone to confirm fulfillment, finalize payment details, and confirm the exact delivery window.\n\n`;
    clientEmailBody += `Thank you,\nThe Sweet Adventures Club Team`;


    try {
        const transporter = await createTransporter();

        // 1. SEND TO CLIENT (RECEIPT)
        let clientMailOptions = {
            from: process.env.G_SENDER_EMAIL,
            to: formData.customer_email, 
            subject: `Your Order Request Confirmation - Sweet Adventures Club`,
            text: clientEmailBody
        };
        await transporter.sendMail(clientMailOptions);

        // 2. SEND TO OWNER (REQUISITION ORDER)
        let ownerMailOptions = {
            from: process.env.G_SENDER_EMAIL,
            to: process.env.G_SENDER_EMAIL, // Sending to yourself, the owner
            subject: `REQUISITION ORDER: ${formData.customer_name} (${formData.delivery_date})`,
            text: ownerEmailBody
        };
        await transporter.sendMail(ownerMailOptions);
        
        console.log(`✅ Dual email successfully sent to client (${formData.customer_email}) and owner.`);
        
        res.status(200).json({ message: 'Order submitted successfully and dual confirmation emails sent!' });
        
    } catch (error) {
        console.error('❌ CRITICAL EMAIL SENDING ERROR (Two Emails):', error);
        
        res.status(500).json({ 
            message: 'Order failed to submit due to a server error.', 
            details: 'Emails failed to send. Check server console for log.',
            error: error.message 
        });
    }
});


// --- 4. ENDPOINT 2: /submit_connect (Simple Contact Form) ---
app.post('/submit_connect', async (req, res) => {
    const formData = req.body;
    console.log(`Contact message received from: ${formData.name}`);

    // Build the simple internal email for the owner
    let internalEmailBody = `\n--- NEW CONNECT MESSAGE ---\n\n`;
    internalEmailBody += `Sender Name: ${formData.name}\n`;
    internalEmailBody += `Sender Email: ${formData.email}\n`;
    internalEmailBody += `\nMESSAGE:\n`;
    internalEmailBody += `--------------------------\n`;
    internalEmailBody += `${formData.message}\n`;
    internalEmailBody += `--------------------------\n`;
    internalEmailBody += `\n(You can reply directly to the sender: ${formData.email})`;

    // Send the email from community page to the owner
    try {
        const transporter = await createTransporter();

        // Send one email to the owner only
        await transporter.sendMail({
            from: process.env.G_SENDER_EMAIL,
            // Reply-To field makes it easy to click "Reply" and email the customer directly
            replyTo: formData.email, 
            to: process.env.G_SENDER_EMAIL, // Your email defined in .env
            subject: `NEW CONNECT Message from ${formData.name}`,
            text: internalEmailBody
        });
        
        console.log(`✅ Simple contact email successfully sent from ${formData.name}.`);
        
        res.status(200).json({ message: 'Message sent successfully! We will be in touch soon.' });
        
    } catch (error) {
        console.error('❌ CRITICAL EMAIL SENDING ERROR (/submit_connect):', error);
        
        res.status(500).json({ 
            message: 'Failed to send message due to a server error.', 
            error: error.message 
        });
    }
});


// --- 5. Start the Server ---
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`------------------------------------------------------`);
    console.log(` Order Endpoint: http://localhost:${PORT}/submit-order`);
    console.log(` Connect Endpoint: http://localhost:${PORT}/submit_connect`);
    console.log(`======================================================`);
});