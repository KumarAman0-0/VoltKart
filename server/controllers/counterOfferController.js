const CounterOffer = require('../models/CounterOffer');
const SellRequest = require('../models/SellRequest');
const Device = require('../models/Device');
const Payout = require('../models/Payout');
const SellerProfile = require('../models/SellerProfile');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /api/counter-offers/sell-request/:sellRequestId
// Seller or Admin views the counter-offer
const getCounterOfferBySellRequest = asyncHandler(async (req, res) => {
  const { sellRequestId } = req.params;

  const query = { sellRequest: sellRequestId };
  if (req.user.role === 'seller') {
    query.seller = req.user._id;
    // Seller only sees if status is not pending_admin
    query.status = { $ne: 'pending_admin' };
  }

  const counterOffer = await CounterOffer.findOne(query)
    .populate('device', 'model grade storage photos')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  if (!counterOffer) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: counterOffer });
});

// GET /api/admin/counter-offers
// Admin views all counter-offers
const adminListCounterOffers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const offers = await CounterOffer.find(filter)
    .populate('sellRequest', 'model storage address')
    .populate('seller', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: offers });
});

// PATCH /api/admin/counter-offers/:id/approve
// Admin approves engineer's drafted counter-offer and sends to seller
const adminApproveCounterOffer = asyncHandler(async (req, res) => {
  const counterOffer = await CounterOffer.findById(req.params.id);
  if (!counterOffer) throw new AppError('Counter offer not found', 404);

  counterOffer.status = 'sent';
  counterOffer.approvedBy = req.user._id;
  counterOffer.sentAt = new Date();
  counterOffer.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hrs per PDF Section 5.2
  await counterOffer.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'COUNTER_OFFER_APPROVED',
    targetModel: 'CounterOffer',
    targetId: counterOffer._id,
    newValue: { newPrice: counterOffer.newPrice },
  });

  res.json({
    success: true,
    message: 'Counter offer approved and sent to seller.',
    data: counterOffer,
  });
});

// POST /api/counter-offers/:id/accept
// Seller accepts counter-offer per PDF Section 5.2
const sellerAcceptCounterOffer = asyncHandler(async (req, res) => {
  const counterOffer = await CounterOffer.findOne({
    _id: req.params.id,
    seller: req.user._id,
    status: 'sent',
  });

  if (!counterOffer) throw new AppError('Active counter offer not found', 404);

  counterOffer.status = 'accepted';
  counterOffer.respondedAt = new Date();
  await counterOffer.save();

  const sellRequest = await SellRequest.findById(counterOffer.sellRequest);
  if (sellRequest) {
    sellRequest.status = 'counter_accepted';
    sellRequest.finalPrice = counterOffer.newPrice;
    sellRequest.payoutAmount = counterOffer.newPrice;

    // Trigger instant payout at counter-offer price
    const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
    const upiId = sellerProfile?.upiId || sellerProfile?.bankDetails?.upiId;
    const ifscCode = sellerProfile?.bankDetails?.ifscCode || sellerProfile?.bankDetails?.ifsc;
    const accountNumber = sellerProfile?.bankDetails?.accountNumber;
    const accountHolderName = sellerProfile?.bankDetails?.accountHolderName;
    const method = upiId ? 'upi' : 'bank';

    const payout = await Payout.create({
      sellRequest: sellRequest._id,
      seller: req.user._id,
      amount: counterOffer.newPrice,
      method,
      payoutDetails: {
        upiId,
        accountNumber,
        ifscCode,
        accountHolderName,
      },
      status: 'paid',
      reference: `VKPAY-${Date.now()}`,
      paidAt: new Date(),
    });

    sellRequest.status = 'paid';
    sellRequest.paidAt = new Date();
    sellRequest.payoutStatus = 'paid';
    sellRequest.payoutTransactionId = payout.reference;
    await sellRequest.save();
  }

  const device = await Device.findById(counterOffer.device);
  if (device) {
    device.status = 'tested';
    await device.save();
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'seller',
    action: 'COUNTER_OFFER_ACCEPTED',
    targetModel: 'CounterOffer',
    targetId: counterOffer._id,
    newValue: { newPrice: counterOffer.newPrice },
  });

  res.json({
    success: true,
    message: `Counter offer accepted at ₹${counterOffer.newPrice.toLocaleString('en-IN')}. Payment processed!`,
    data: counterOffer,
  });
});

// POST /api/counter-offers/:id/decline
// Seller declines counter-offer → return phone to seller per PDF Section 5.2
const sellerDeclineCounterOffer = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const counterOffer = await CounterOffer.findOne({
    _id: req.params.id,
    seller: req.user._id,
    status: 'sent',
  });

  if (!counterOffer) throw new AppError('Active counter offer not found', 404);

  counterOffer.status = 'declined';
  counterOffer.respondedAt = new Date();
  await counterOffer.save();

  const sellRequest = await SellRequest.findById(counterOffer.sellRequest);
  if (sellRequest) {
    sellRequest.status = 'counter_declined';
    sellRequest.rejectionReason = reason || 'Seller declined counter-offer';
    await sellRequest.save();
  }

  const device = await Device.findById(counterOffer.device);
  if (device) {
    device.status = 'return_to_seller';
    await device.save();
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'seller',
    action: 'COUNTER_OFFER_DECLINED',
    targetModel: 'CounterOffer',
    targetId: counterOffer._id,
    newValue: { reason },
  });

  res.json({
    success: true,
    message: 'Counter offer declined. Device will be packed and returned to your address.',
    data: counterOffer,
  });
});

// GET /api/admin/payouts
// Admin views all payouts
const adminListPayouts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const payouts = await Payout.find(filter)
    .populate('sellRequest', 'model storage')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: payouts });
});

// POST /api/admin/payouts/:id/retry
// Admin or system retries a failed payout
const adminRetryPayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id).populate('seller');
  if (!payout) throw new AppError('Payout not found', 404);

  const sellerId = payout.seller?._id || payout.seller;
  const sellerProfile = sellerId ? await SellerProfile.findOne({ userId: sellerId }) : null;

  // Update payout with current seller profile bank/UPI details
  if (sellerProfile) {
    const upiId = sellerProfile.upiId || sellerProfile.bankDetails?.upiId;
    const ifscCode = sellerProfile.bankDetails?.ifscCode || sellerProfile.bankDetails?.ifsc;
    payout.payoutDetails = {
      upiId,
      accountNumber: sellerProfile.bankDetails?.accountNumber,
      ifscCode,
      accountHolderName: sellerProfile.bankDetails?.accountHolderName,
    };
    if (upiId) payout.method = 'upi';
  }

  payout.status = 'paid';
  payout.paidAt = new Date();
  payout.reference = `VKRETRY-${Date.now()}`;
  payout.failureReason = undefined;
  await payout.save();

  const sellRequest = await SellRequest.findById(payout.sellRequest);
  if (sellRequest) {
    sellRequest.status = 'paid';
    sellRequest.payoutStatus = 'paid';
    sellRequest.payoutTransactionId = payout.reference;
    await sellRequest.save();
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'PAYOUT_RETRIED',
    targetModel: 'Payout',
    targetId: payout._id,
    newValue: { status: 'paid', reference: payout.reference },
  });

  res.json({
    success: true,
    message: 'Payout retried and marked as paid.',
    data: payout,
  });
});

module.exports = {
  getCounterOfferBySellRequest,
  adminListCounterOffers,
  adminApproveCounterOffer,
  sellerAcceptCounterOffer,
  sellerDeclineCounterOffer,
  adminListPayouts,
  adminRetryPayout,
};
