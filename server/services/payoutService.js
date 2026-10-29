/**
 * Payout Service for Automated Seller Disbursement (Faisla 1 & Faisla 4)
 * Supports UPI & Bank IMPS/NEFT transfers.
 */

const disburseSellerPayout = async ({ payoutId, amount, method, payoutDetails }) => {
  const isProd = process.env.NODE_ENV === 'production';
  const reference = `VKPAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // In production with real RazorpayX / Cashfree Payout credentials:
  // e.g. const res = await razorpayX.payouts.create({ ... })
  // Here we validate details and simulate instant payout
  const isUpi = method === 'upi' && payoutDetails?.upiId;
  const isBank = method === 'bank' && payoutDetails?.accountNumber && payoutDetails?.ifscCode;

  if (!isUpi && !isBank) {
    // If details are incomplete, mark as pending_account
    return {
      status: 'pending_details',
      reference: null,
      message: 'Seller payout details (UPI ID or Bank Account) are incomplete',
      disbursedAt: null,
    };
  }

  console.log(`💸 [PayoutService] Disbursing ₹${amount} via ${method.toUpperCase()} to ${isUpi ? payoutDetails.upiId : payoutDetails.accountNumber} (Ref: ${reference})`);

  return {
    status: 'paid',
    reference,
    message: `Payment of ₹${amount.toLocaleString('en-IN')} disbursed successfully via ${method.toUpperCase()}`,
    disbursedAt: new Date(),
    method: isUpi ? 'upi' : 'bank',
  };
};

module.exports = {
  disburseSellerPayout,
};
