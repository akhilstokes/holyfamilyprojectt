const twilio = require('twilio');

const sendSms = async (to, message) => {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to // Must include country code, e.g., +91...
    });
};

module.exports = sendSms;