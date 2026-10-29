const crypto = require('crypto');

let razorpayInstance = null;
const isRealRazorpay =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_demo' &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== 'demo_razorpay_secret';

if (isRealRazorpay) {
  try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('⚠️ Failed to initialize Razorpay SDK:', err.message);
  }
}

/**
 * Create a payment order for buyer checkout
 * @param {Object} opts - { amount: in INR, currency: 'INR', receipt: string }
 */
const createPaymentOrder = async ({ amount, currency = 'INR', receipt }) => {
  const amountInPaise = Math.round(Number(amount) * 100);

  if (razorpayInstance) {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });
    return {
      isMock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // Safe Mock Fallback for Local Dev / Testing
  return {
    isMock: true,
    orderId: `order_mock_${Date.now()}`,
    amount: amountInPaise,
    currency,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
  };
};

/**
 * Verify Razorpay payment signature
 * @param {Object} opts - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!isRealRazorpay) {
    // In demo/test mode, accept mock payment IDs
    return {
      isValid: true,
      isMock: true,
      paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
    };
  }

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  const isValid = expectedSign === razorpay_signature;
  return {
    isValid,
    isMock: false,
    paymentId: razorpay_payment_id,
  };
};

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
  isRealRazorpay,
};
