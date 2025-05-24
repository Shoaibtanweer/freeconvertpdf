const sgMail = require('@sendgrid/mail');

console.log('SendGrid API Key Loaded:', process.env.SENDGRID_API_KEY ? 'Yes' : 'No - CHECK .env AND LOADING ORDER!'); // Temporary check
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    const msg = {
        to: options.email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@freeconvertpdf.com', // Verify this sender in SendGrid
        subject: options.subject,
        text: options.message, // For plain text email
        html: options.html,   // For HTML email
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;