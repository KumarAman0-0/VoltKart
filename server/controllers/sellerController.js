const SellRequest = require('../models/SellRequest');
const SellerProfile = require('../models/SellerProfile');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// POST /sell-requests
const createSellRequest = asyncHandler(async (req, res) => {
  const { model, storage, color, condition, expectedPrice, description, pickupDate, pickupSlot } = req.body;

  const address = req.body.address || {
    street: req.body['address[street]'] || req.body.street,
    city: req.body['address[city]'] || req.body.city,
    state: req.body['address[state]'] || req.body.state,
    pincode: req.body['address[pincode]'] || req.body.pincode,
  };

  const photos = req.files ? req.files.map((f) => f.path) : [];

  // Look up BasePrice for initial estimatedMax
  let estimatedMax = undefined;
  try {
    const BasePrice = require('../models/BasePrice');
    let brand = 'Google';
    if (model && model.toLowerCase().includes('samsung')) brand = 'Samsung';
    const bp = await BasePrice.findOne({ brand, model, storage: storage || '128GB', isActive: true });
    if (bp) estimatedMax = bp.basePrice;
  } catch (e) {
    // ignore
  }

  const sellRequest = await SellRequest.create({
    seller: req.user._id,
    model,
    storage,
    color,
    condition,
    expectedPrice: Number(expectedPrice),
    description,
    address,
    pickupDate: pickupDate ? new Date(pickupDate) : undefined,
    pickupSlot,
    estimatedMax,
    photos,
  });

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'seller',
    action: 'SELL_REQUEST_CREATED',
    targetModel: 'SellRequest',
    targetId: sellRequest._id,
    newValue: { model, expectedPrice },
  });

  res.status(201).json({
    success: true,
    message: 'Sell request submitted successfully',
    data: sellRequest,
  });
});

// GET /sell-requests/mine
const getMySellRequests = asyncHandler(async (req, res) => {
  const requests = await SellRequest.find({ seller: req.user._id })
    .select('-seller')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
});

// GET /sell-requests/:id (seller's own)
const getSellRequestById = asyncHandler(async (req, res) => {
  const request = await SellRequest.findOne({
    _id: req.params.id,
    seller: req.user._id,
  }).select('-seller');

  if (!request) throw new AppError('Sell request not found', 404);

  res.json({ success: true, data: request });
});

// POST /sell-requests/:id/accept-offer
const respondToOffer = asyncHandler(async (req, res) => {
  const { response } = req.body; // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(response)) {
    throw new AppError('Response must be "accepted" or "rejected"', 400);
  }

  const request = await SellRequest.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!request) throw new AppError('Sell request not found', 404);
  if (request.status !== 'approved') {
    throw new AppError('No offer to respond to yet', 400);
  }
  if (request.sellerResponse !== 'pending') {
    throw new AppError('You have already responded to this offer', 400);
  }

  request.sellerResponse = response;
  if (response === 'rejected') {
    request.status = 'rejected';
  }
  await request.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'seller',
    action: `OFFER_${response.toUpperCase()}`,
    targetModel: 'SellRequest',
    targetId: request._id,
    newValue: { response, offeredPrice: request.offeredPrice },
  });

  res.json({
    success: true,
    message: `Offer ${response}`,
    data: request,
  });
});

// GET /sell-requests/profile - Get seller KYC profile
const getSellerProfile = asyncHandler(async (req, res) => {
  const profile = await SellerProfile.findOne({ userId: req.user._id });
  res.json({ success: true, data: profile || null });
});

// PUT /sell-requests/:id/profile - Update seller KYC profile
const updateSellerProfile = asyncHandler(async (req, res) => {
  const { phone, address, idProofType, bankDetails, upiId, consentGiven } = req.body;

  const update = {
    phone,
    address,
    idProofType,
    bankDetails,
    upiId,
    isKycVerified: false,
  };

  if (consentGiven) {
    update.consentGiven = true;
    update.consentTimestamp = new Date();
  }

  if (req.file) update.idProof = req.file.path;

  const profile = await SellerProfile.findOneAndUpdate(
    { userId: req.user._id },
    update,
    { new: true, upsert: true }
  );

  res.json({ success: true, data: profile });
});

// GET /sell-requests/estimate?model=...&storage=...
const getPriceEstimate = asyncHandler(async (req, res) => {
  const { model, storage } = req.query;
  if (!model) return res.json({ success: true, estimatedMax: null });

  const BasePrice = require('../models/BasePrice');
  let brand = 'Google';
  if (model.toLowerCase().includes('samsung')) brand = 'Samsung';

  const doc = await BasePrice.findOne({
    brand,
    model,
    storage: storage || '128GB',
    isActive: true,
  });

  const estimatedMax = doc ? doc.basePrice : null;
  res.json({ success: true, estimatedMax, model, storage });
});

// GET /api/sell-requests/:id/receipt - PDF download
const downloadSellerReceipt = asyncHandler(async (req, res) => {
  const { generateSellerReceipt } = require('../services/pdfService');
  const sellRequest = await SellRequest.findById(req.params.id).populate('seller', 'name email');
  if (!sellRequest) {
    throw new AppError('Sell request not found', 404);
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="VoltKart-Receipt-${sellRequest.code || 'Request'}.pdf"`);
  generateSellerReceipt({ sellRequest }, res);
});

module.exports = {
  createSellRequest,
  getMySellRequests,
  getSellRequestById,
  respondToOffer,
  updateSellerProfile,
  getSellerProfile,
  getPriceEstimate,
  downloadSellerReceipt,
};
