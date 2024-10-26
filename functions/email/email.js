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
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content of the email
 * @param {string} html - HTML content of the email
 * @param {string|string[]} [cc] - Optional CC recipient(s)
 * @returns {Promise} - Resolves with info about the sent email, rejects with an error
 */
function sendEmail(to, subject, text, html, cc) {
    const mailOptions = {
        from: 'gunungdew@gmail.com',
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
                reject(error);
            } else {
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
