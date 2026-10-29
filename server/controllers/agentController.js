const SellRequest = require('../models/SellRequest');
const Device = require('../models/Device');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /agent/pickups
const getPickups = asyncHandler(async (req, res) => {
  const pickups = await SellRequest.find({
    agent: req.user._id,
    status: { $in: ['agent_assigned', 'on_the_way', 'inspected', 'picked_up', 'rejected_at_pickup', 'declined'] },
  })
    .select('-seller')
    .sort({ agentAssignedAt: -1 });

  res.json({ success: true, data: pickups });
});

// GET /agent/pickups/:id
const getPickupDetails = asyncHandler(async (req, res) => {
  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    agent: req.user._id,
  }).select('-seller');

  if (!pickup) throw new AppError('Pickup not found', 404);
  res.json({ success: true, data: pickup });
});

// POST /agent/pickups/:id/verify
const verifyPickup = asyncHandler(async (req, res) => {
  const {
    imei, imei2,
    bootloaderUnlockPossible, frpCleared,
    sellerOtp,
    inspectionNotes,
    failReason,
  } = req.body;

  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    agent: req.user._id,
    status: { $in: ['agent_assigned', 'on_the_way', 'inspected'] },
  });

  if (!pickup) throw new AppError('Pickup not found or already processed', 404);

  const photos = req.files ? req.files.map((f) => f.path) : [];

  // If fail
  if (failReason) {
    pickup.status = 'rejected_at_pickup';
    pickup.rejectionReason = failReason;
    await pickup.save();

    await AuditLog.create({
      actor: req.user._id,
      actorRole: 'agent',
      action: 'PICKUP_FAILED',
      targetModel: 'SellRequest',
      targetId: pickup._id,
      newValue: { failReason },
    });

    return res.json({ success: true, message: 'Pickup rejected', data: pickup });
  }

  // Validate required fields
  if (!imei) throw new AppError('IMEI is required', 400);
  if (!bootloaderUnlockPossible) throw new AppError('Bootloader unlock confirmation required', 400);
  if (!frpCleared) throw new AppError('FRP cleared confirmation required', 400);

  // Mark pickup success
  pickup.status = 'picked_up';
  pickup.payoutAmount = pickup.offeredPrice;
  pickup.payoutStatus = 'processing';
  await pickup.save();

  // Create or update device in warehouse
  let device = await Device.findOne({ sellRequest: pickup._id });
  if (!device) {
    device = await Device.create({
      sellRequest: pickup._id,
      imei,
      imei2,
      model: pickup.model,
      photos,
      status: 'received',
      receivedBy: req.user._id,
      receivedAt: new Date(),
    });
  } else {
    device.imei = imei || device.imei;
    if (imei2) device.imei2 = imei2;
    if (photos.length > 0) device.photos = photos;
    device.status = 'received';
    device.receivedBy = req.user._id;
    device.receivedAt = new Date();
    await device.save();
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'agent',
    action: 'PICKUP_SUCCESS',
    targetModel: 'SellRequest',
    targetId: pickup._id,
    newValue: { imei, deviceId: device._id },
    metadata: { bootloaderUnlockPossible, frpCleared },
  });

  res.json({
    success: true,
    message: 'Pickup verified successfully. Device added to warehouse.',
    data: { pickup, device },
  });
});

// POST /agent/pickups/:id/start-trip
// Agent "Start Trip" dabata hai → status: on_the_way
const startTrip = asyncHandler(async (req, res) => {
  const pickup = await SellRequest.findOne({
    _id: req.params.id,
    agent: req.user._id,
    status: { $in: ['agent_assigned', 'on_the_way'] },
  });
  if (!pickup) throw new AppError('Pickup not found', 404);

  if (pickup.status === 'on_the_way') {
    return res.json({ success: true, message: 'Trip already in progress.', data: pickup });
  }

  pickup.status = 'on_the_way';
  await pickup.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'agent',
    action: 'TRIP_STARTED',
    targetModel: 'SellRequest',
    targetId: pickup._id,
  });

  // TODO: In production, send SMS to seller: "Agent aa raha hai"

  res.json({ success: true, message: 'Trip started. Seller has been notified.', data: pickup });
});

module.exports = { getPickups, getPickupDetails, verifyPickup, startTrip };
