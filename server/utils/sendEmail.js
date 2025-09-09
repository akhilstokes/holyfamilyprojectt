const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Check if email configuration is available
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email configuration not found. Skipping email send.');
            console.log('Email would have been sent to:', options.email);
            console.log('Subject:', options.subject);
            console.log('Message:', options.message);
            return;
        }

        // 1. Create a transporter (the service that will send the email)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 2. Define the email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Holy Family Polymers <noreply@hfp.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message, // Support HTML emails
        };

        // 3. Actually send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = sendEmail;