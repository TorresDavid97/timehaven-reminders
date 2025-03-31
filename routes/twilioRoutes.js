require('dotenv').config(); // 👈 Make sure this is before accessing process.env
const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const client = twilio(accountSid, authToken);

router.post('/send-sms', async (req, res) => {
  const { to, type, appointmentDate, appointmentTime, staffName, appointmentRef } = req.body;

  if (!to || !type || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  let messageBody = '';

  switch (type) {
    case 'confirmation':
      messageBody = `Your appointment has been scheduled with ${staffName} on ${appointmentDate} at ${appointmentTime}. Reply STOP to unsubscribe.`;
      break;
    case 'reminder':
      messageBody = `Reminder: You have an appointment with ${staffName} on ${appointmentDate} at ${appointmentTime}. Reply STOP to unsubscribe.`;
      break;
    case 'cancelled':
      messageBody = `Your appointment with ${staffName} on ${appointmentDate} has been cancelled. Reply STOP to unsubscribe.`;
      break;
    default:
      messageBody = 'TimeHaven Notification. Reply STOP to unsubscribe.';
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      messagingServiceSid: messagingServiceSid,
      to: to,
    });

    console.log(`✅ SMS sent for appointmentRef: ${appointmentRef}`);
    res.json({ success: true, sid: message.sid });
  } catch (err) {
    console.error('❌ Error sending SMS:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

module.exports = router;
