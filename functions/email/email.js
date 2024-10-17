const nodemailer = require('nodemailer');
require('dotenv').config();


// Create a transporter object with your email service credentials
let transporter = nodemailer.createTransport({
    service: 'gmail', // Use the email service you prefer (e.g., Gmail, Outlook, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS,  // Your email password
    }
});

// Set up email data
let mailOptions = {
    from: 'noreply@yourdomain.com', // Sender address (you can customize the noreply email here)
    to: 'user@example.com', // Recipient's email address
    subject: 'Your subject here', // Subject line
    text: 'This is a test email sent from Node.js!', // Plain text body
    html: '<p>This is a test email sent from <b>Node.js</b>!</p>' // HTML body (optional)
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
});
