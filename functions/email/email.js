const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'gunungdew@gmail.com',
        pass: 'dgbk svnl gdza dwih'
    }
});

/**
 * Sends an email using the configured transporter
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content of the email
 * @param {string} html - HTML content of the email
 * @returns {Promise} - Resolves with info about the sent email, rejects with an error
 */
function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: 'gunungdew@gmail.com',
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            reject(error);
        } else {
            console.log('Email sent:', info.response);
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

//sendTestEmail();