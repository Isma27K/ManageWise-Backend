const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an email using the configured transporter
 * If EMAIL_ENABLED is set to 'false', it will log the email details but not send
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content of the email
 * @param {string} html - HTML content of the email
 * @param {string|string[]} [cc] - Optional CC recipient(s)
 * @returns {Promise} - Resolves with info about the sent email or mock success response
 */
function sendEmail(to, subject, text, html, cc) {
    // Check if email is disabled
    const isEmailEnabled = process.env.EMAIL_ENABLED?.toLowerCase() === 'true';

    if (!isEmailEnabled) {
        console.log('Email notifications are disabled. Would have sent:', {
            to,
            subject,
            cc: cc || 'No CC',
            preview: text.substring(0, 100) + '...'
        });
        return Promise.resolve({ 
            messageId: 'DISABLED-' + Date.now(),
            response: 'Email notifications are disabled'
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    // Add CC if provided
    if (cc) {
        mailOptions.cc = cc;
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Failed to send email:', error);
                reject(error);
            } else {
                console.log('Email sent successfully:', info);
                resolve(info);
            }
        });
    });
}

module.exports = sendEmail;


//const sendEmail = require('./send_email');

// Example usage
//sendEmail('recipient@example.com', 'Test Subject', 'Plain text content', '<p>HTML content</p>')
//  .then(info => console.log('Email sent successfully:', info))
//  .catch(error => console.error('Failed to send email:', error));

// Or using async/await
//async function sendTestEmail() {
//  try {
//    const info = await sendEmail('recipient@example.com', 'Test Subject', 'Plain text content', '<p>HTML content</p>');
//    console.log('Email sent successfully:', info);
//  } catch (error) {
//    console.error('Failed to send email:', error);
//  }
//}


// Without CC
//sendEmail('recipient@example.com', 'Test Subject', 'Plain text content', '<p>HTML content</p>')
//  .then(info => console.log('Email sent successfully:', info))
//  .catch(error => console.error('Failed to send email:', error));

// With CC (single recipient)
//sendEmail('recipient@example.com', 'Test Subject', 'Plain text content', '<p>HTML content</p>', 'cc@example.com')
//  .then(info => console.log('Email sent successfully:', info))
//  .catch(error => console.error('Failed to send email:', error));

// With CC (multiple recipients)
//sendEmail('recipient@example.com', 'Test Subject', 'Plain text content', '<p>HTML content</p>', ['cc1@example.com', 'cc2@example.com'])
//  .then(info => console.log('Email sent successfully:', info))
//  .catch(error => console.error('Failed to send email:', error));

//sendTestEmail();
