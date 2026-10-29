/**
 * Notification Service for SMS, WhatsApp, and Transactional Alerts
 */

const isTwilioConfigured =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER;

/**
 * Send Handover OTP to seller's phone
 * @param {Object} opts - { phone, otp, model }
 */
const sendHandoverOtp = async ({ phone, otp, model }) => {
  const message = `[VoltKart] Your OTP for device handover of ${model || 'phone'} is ${otp}. Do NOT share with anyone except the assigned VoltKart agent.`;

  if (isTwilioConfigured) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`,
      });
      console.log(`📱 [NotificationService] Real SMS sent to ${phone}`);
      return { success: true, channel: 'sms' };
    } catch (err) {
      console.warn(`⚠️ [NotificationService] Twilio SMS failed (${err.message}). Falling back to dev logger.`);
    }
  }

  // Development Logger
  console.log(`📱 [DEV SMS] To: ${phone} | Message: ${message}`);
  return { success: true, channel: 'dev_mock' };
};

/**
 * Send Counter-Offer Alert to seller
 */
const sendCounterOfferAlert = async ({ phone, model, oldPrice, newPrice }) => {
  const message = `[VoltKart] An updated inspection offer of ₹${newPrice} is available for your ${model}. Please review on your VoltKart dashboard.`;
  console.log(`🔔 [NotificationService] Counter-Offer SMS To: ${phone} | ${message}`);
  return { success: true };
};

/**
 * Send Payout Confirmation Alert
 */
const sendPayoutAlert = async ({ phone, amount, reference }) => {
  const message = `[VoltKart] ₹${amount} has been disbursed to your account. Ref: ${reference}. Thank you for choosing VoltKart!`;
  console.log(`💰 [NotificationService] Payout SMS To: ${phone} | ${message}`);
  return { success: true };
};

module.exports = {
  sendHandoverOtp,
  sendCounterOfferAlert,
  sendPayoutAlert,
};
