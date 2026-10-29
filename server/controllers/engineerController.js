const Device = require('../models/Device');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const STATUS_TRANSITIONS = {
  received: 'tested',
  verified: 'tested',
  tested: 'wiped',
  wiped: 'os_flashed',
  os_flashed: 'final_qa',
  final_qa: 'live',
};

// GET /warehouse/devices
const getWarehouseDevices = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status
    ? { status }
    : { status: { $in: ['received', 'verified', 'tested', 'wiped', 'os_flashed', 'final_qa', 'counter_offered'] } };

  const devices = await Device.find(filter)
    .select('-sellRequest') // engineers don't see seller linkage
    .populate('receivedBy', 'name')
    .populate('flashedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Device.countDocuments(filter);
  res.json({ success: true, data: devices, total });
});

// GET /warehouse/devices/:id
const getDeviceDetails = asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.id)
    .select('-sellRequest')
    .populate('flashedBy', 'name')
    .populate('receivedBy', 'name')
    .populate('qaApprovedBy', 'name');

  if (!device) throw new AppError('Device not found', 404);
  res.json({ success: true, data: device });
});

// PATCH /warehouse/devices/:id/status — advance status
const updateDeviceStatus = asyncHandler(async (req, res) => {
  const { inspectionNotes, grade, batteryHealth, inspection } = req.body;
  const device = await Device.findById(req.params.id);
  if (!device) throw new AppError('Device not found', 404);

  const nextStatus = STATUS_TRANSITIONS[device.status];
  if (!nextStatus) throw new AppError(`Cannot advance status from ${device.status}`, 400);

  const prevStatus = device.status;
  device.status = nextStatus;

  if (inspectionNotes) device.inspectionNotes = inspectionNotes;
  if (grade) device.grade = grade;
  if (batteryHealth) device.batteryHealth = batteryHealth;
  if (inspection) device.inspection = { ...device.inspection, ...inspection };

  if (nextStatus === 'final_qa') {
    device.qaApprovedBy = req.user._id;
    device.qaApprovedAt = new Date();
  }

  // Auto-generate listing when going live
  if (nextStatus === 'live') {
    device.listingTitle = `${device.model} with ${device.os || 'Privacy OS'}`;
    device.listingDescription = `Refurbished ${device.model} running ${device.os} ${device.osVersion || ''}. Grade ${device.grade}. Battery health: ${device.batteryHealth}%. ${device.warrantyMonths}-month warranty.`;
    device.sellingPrice = device.sellingPrice || 0;
  }

  device.flashLog.push({
    action: `STATUS_${nextStatus.toUpperCase()}`,
    performedBy: req.user._id,
    timestamp: new Date(),
  });

  await device.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'engineer',
    action: 'DEVICE_STATUS_CHANGED',
    targetModel: 'Device',
    targetId: device._id,
    previousValue: prevStatus,
    newValue: nextStatus,
  });

  res.json({ success: true, message: `Device status updated to ${nextStatus}`, data: device });
});

// POST /warehouse/devices/:id/flash-log
const addFlashLog = asyncHandler(async (req, res) => {
  const { os, osVersion, notes } = req.body;
  if (!os) throw new AppError('OS is required', 400);

  const device = await Device.findById(req.params.id);
  if (!device) throw new AppError('Device not found', 404);
  if (device.status !== 'wiped') {
    throw new AppError('Device must be wiped before flashing', 400);
  }

  device.os = os;
  device.osVersion = osVersion;
  device.flashedBy = req.user._id;
  device.flashedAt = new Date();
  device.status = 'os_flashed';

  device.flashLog.push({
    action: 'OS_FLASHED',
    performedBy: req.user._id,
    timestamp: new Date(),
    notes: `${os} ${osVersion} installed. ${notes || ''}`,
  });

  await device.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'engineer',
    action: 'OS_FLASH',
    targetModel: 'Device',
    targetId: device._id,
    newValue: { os, osVersion },
    metadata: { notes },
  });

  res.json({ success: true, message: `${os} flashed successfully`, data: device });
});

// PATCH /warehouse/devices/:id/pricing
const setPricing = asyncHandler(async (req, res) => {
  const { sellingPrice, warrantyMonths, accessories } = req.body;
  const device = await Device.findByIdAndUpdate(
    req.params.id,
    { sellingPrice, warrantyMonths, accessories },
    { new: true }
  );
  if (!device) throw new AppError('Device not found', 404);
  res.json({ success: true, data: device });
});

// POST /warehouse/devices/:id/verify
// Engineer passes warehouse secondary check → verified → triggers payout to seller per PDF Section 2
const verifyWarehouseDevice = asyncHandler(async (req, res) => {
  const { notes, grade } = req.body;
  const device = await Device.findById(req.params.id);
  if (!device) throw new AppError('Device not found', 404);

  const SellRequest = require('../models/SellRequest');
  const Payout = require('../models/Payout');
  const SellerProfile = require('../models/SellerProfile');

  const sellRequest = await SellRequest.findById(device.sellRequest);
  if (!sellRequest) throw new AppError('Associated sell request not found', 404);

  device.status = 'verified';
  if (grade) device.grade = grade;
  if (notes) device.inspectionNotes = notes;
  await device.save();

  sellRequest.status = 'verified';
  sellRequest.verifiedAt = new Date();

  // Trigger Payout via Service
  const sellerProfile = await SellerProfile.findOne({ userId: sellRequest.seller });
  const payoutAmount = sellRequest.finalPrice || sellRequest.offeredPrice || 5000;
  const upiId = sellerProfile?.upiId || sellerProfile?.bankDetails?.upiId;
  const ifscCode = sellerProfile?.bankDetails?.ifscCode || sellerProfile?.bankDetails?.ifsc;
  const accountNumber = sellerProfile?.bankDetails?.accountNumber;
  const accountHolderName = sellerProfile?.bankDetails?.accountHolderName;
  const method = upiId ? 'upi' : 'bank';

  const payoutService = require('../services/payoutService');
  const notificationService = require('../services/notificationService');

  const payoutResult = await payoutService.disburseSellerPayout({
    payoutId: null,
    amount: payoutAmount,
    method,
    payoutDetails: {
      upiId,
      accountNumber,
      ifscCode,
      accountHolderName,
    },
  });

  const payout = await Payout.create({
    sellRequest: sellRequest._id,
    seller: sellRequest.seller,
    amount: payoutAmount,
    method,
    payoutDetails: {
      upiId,
      accountNumber,
      ifscCode,
      accountHolderName,
    },
    status: payoutResult.status,
    reference: payoutResult.reference,
    paidAt: payoutResult.disbursedAt || new Date(),
    processedBy: req.user._id,
  });

  sellRequest.status = 'paid';
  sellRequest.paidAt = new Date();
  sellRequest.payoutAmount = payoutAmount;
  sellRequest.payoutStatus = payoutResult.status;
  sellRequest.payoutTransactionId = payout.reference;
  await sellRequest.save();

  if (sellerProfile?.phone) {
    notificationService.sendPayoutAlert({
      phone: sellerProfile.phone,
      amount: payoutAmount,
      reference: payout.reference,
    }).catch(() => {});
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'engineer',
    action: 'DEVICE_WAREHOUSE_VERIFIED',
    targetModel: 'Device',
    targetId: device._id,
    newValue: { payoutId: payout._id, amount: payoutAmount },
  });

  res.json({
    success: true,
    message: 'Device verified and payment processed to seller.',
    data: { device, sellRequest, payout },
  });
});

// POST /warehouse/devices/:id/counter-offer
// Engineer finds extra defect → creates counter-offer with deduction per PDF Section 5
const createWarehouseCounterOffer = asyncHandler(async (req, res) => {
  const { reasons, engineerNotes } = req.body;
  const device = await Device.findById(req.params.id);
  if (!device) throw new AppError('Device not found', 404);

  const SellRequest = require('../models/SellRequest');
  const CounterOffer = require('../models/CounterOffer');

  const sellRequest = await SellRequest.findById(device.sellRequest);
  if (!sellRequest) throw new AppError('Associated sell request not found', 404);

  const oldPrice = sellRequest.finalPrice || sellRequest.offeredPrice || 10000;
  const parsedReasons = typeof reasons === 'string' ? JSON.parse(reasons) : (reasons || []);

  const totalDeductions = parsedReasons.reduce((sum, r) => sum + (Number(r.deductionAmount) || 0), 0);
  const newPrice = Math.max(oldPrice - totalDeductions, 500);

  const counterOffer = await CounterOffer.create({
    sellRequest: sellRequest._id,
    device: device._id,
    seller: sellRequest.seller,
    oldPrice,
    newPrice,
    reasons: parsedReasons,
    engineerNotes,
    createdBy: req.user._id,
    status: 'pending_admin',
  });

  device.status = 'counter_offered';
  await device.save();

  sellRequest.status = 'counter_offered';
  await sellRequest.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'engineer',
    action: 'COUNTER_OFFER_DRAFTED',
    targetModel: 'CounterOffer',
    targetId: counterOffer._id,
    newValue: { oldPrice, newPrice, reasonsCount: parsedReasons.length },
  });

  res.status(201).json({
    success: true,
    message: 'Counter offer drafted and sent to admin for approval.',
    data: counterOffer,
  });
});

module.exports = {
  getWarehouseDevices,
  getDeviceDetails,
  updateDeviceStatus,
  addFlashLog,
  setPricing,
  verifyWarehouseDevice,
  createWarehouseCounterOffer,
};
