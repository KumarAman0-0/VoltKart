const bcrypt = require('bcryptjs');
const SellRequest = require('../models/SellRequest');
const Inspection = require('../models/Inspection');
const BasePrice = require('../models/BasePrice');
const Deduction = require('../models/Deduction');
const GradeRule = require('../models/GradeRule');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// ─── Helper: Calculate inspection score (0-100) ─────────────────────────────
const calcScore = (autoTests, manualChecks) => {
  let total = 0;
  let passed = 0;

  // Auto tests (13 checks, each worth equal weight)
  const autoKeys = [
    'touch', 'display', 'audio', 'vibration', 'frontCamera', 'backCamera',
    'proximity', 'accelerometer', 'fingerprint', 'wifi', 'bluetooth', 'gps',
  ];
  autoKeys.forEach(k => {
    if (autoTests?.[k] !== undefined) {
      total++;
      if (autoTests[k]?.passed) passed++;
    }
  });
  // Battery health (passed if >= 80%)
  if (autoTests?.batteryHealth?.percent !== undefined) {
    total++;
    if (autoTests.batteryHealth.percent >= 80) passed++;
  }

  // Manual checks
  const manualBoolKeys = ['simNetwork', 'chargingPort', 'volumeButtons', 'powerButton'];
  manualBoolKeys.forEach(k => {
    if (manualChecks?.[k] !== undefined) {
      total++;
      if (manualChecks[k]?.passed) passed++;
    }
  });

  // Screen condition
  if (manualChecks?.screenCondition?.grade) {
    total++;
    if (['good', 'light_scratches'].includes(manualChecks.screenCondition.grade)) passed++;
  }
  // Body condition
  if (manualChecks?.bodyCondition?.grade) {
    total++;
    if (manualChecks.bodyCondition.grade === 'good') passed++;
  }

  return total > 0 ? Math.round((passed / total) * 100) : 0;
};

// ─── Helper: Assign grade based on score ────────────────────────────────────
const assignGrade = async (score) => {
  const rules = await GradeRule.find().sort({ minScore: -1 });
  for (const rule of rules) {
    if (score >= rule.minScore && score <= rule.maxScore) return rule.grade;
  }
  // Fallback
  if (score >= 90) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  return 'C';
};

// ─── Helper: Build issues + deductions from inspection data ─────────────────
const buildIssues = async (autoTests, manualChecks, basePrice) => {
  const allDeductions = await Deduction.find({ isActive: true });
  const deductionMap = {};
  allDeductions.forEach(d => { deductionMap[d.issueCode] = d; });

  const issues = [];
  const priceBreakdown = [{ item: 'Base Price', amount: basePrice }];

  // Map of check → issueCode
  const checkToCode = {
    'display.passed':        'DISPLAY_FAIL',
    'touch.passed':          'TOUCH_FAIL',
    'audio.passed':          'AUDIO_FAIL',
    'frontCamera.passed':    'FRONT_CAMERA_FAIL',
    'backCamera.passed':     'BACK_CAMERA_FAIL',
    'wifi.passed':           'WIFI_FAIL',
    'bluetooth.passed':      'BLUETOOTH_FAIL',
    'gps.passed':            'GPS_FAIL',
  };

  for (const [path, code] of Object.entries(checkToCode)) {
    const [key, prop] = path.split('.');
    if (autoTests?.[key]?.[prop] === false && deductionMap[code]) {
      const d = deductionMap[code];
      const amt = d.isPercentage ? Math.round((d.amount / 100) * basePrice) : d.amount;
      issues.push({ code, description: d.description, deductionAmount: amt });
      priceBreakdown.push({ item: d.description, amount: -amt });
    }
  }

  // Battery health
  const batt = autoTests?.batteryHealth?.percent;
  if (batt !== undefined && batt < 80) {
    const code = batt < 60 ? 'BATTERY_CRITICAL' : 'BATTERY_LOW';
    if (deductionMap[code]) {
      const d = deductionMap[code];
      const amt = d.isPercentage ? Math.round((d.amount / 100) * basePrice) : d.amount;
      issues.push({ code, description: d.description, deductionAmount: amt });
      priceBreakdown.push({ item: d.description, amount: -amt });
    }
  }

  // Screen condition
  const screenGrade = manualChecks?.screenCondition?.grade;
  if (screenGrade === 'cracked' && deductionMap['SCREEN_CRACK']) {
    const d = deductionMap['SCREEN_CRACK'];
    const amt = d.isPercentage ? Math.round((d.amount / 100) * basePrice) : d.amount;
    issues.push({ code: 'SCREEN_CRACK', description: d.description, deductionAmount: amt });
    priceBreakdown.push({ item: d.description, amount: -amt });
  } else if (screenGrade === 'light_scratches' && deductionMap['SCREEN_SCRATCH']) {
    const d = deductionMap['SCREEN_SCRATCH'];
    const amt = d.isPercentage ? Math.round((d.amount / 100) * basePrice) : d.amount;
    issues.push({ code: 'SCREEN_SCRATCH', description: d.description, deductionAmount: amt });
    priceBreakdown.push({ item: d.description, amount: -amt });
  }

  // Body condition
  const bodyGrade = manualChecks?.bodyCondition?.grade;
  if (bodyGrade === 'dented' && deductionMap['BODY_DENT']) {
    const d = deductionMap['BODY_DENT'];
    const amt = d.isPercentage ? Math.round((d.amount / 100) * basePrice) : d.amount;
    issues.push({ code: 'BODY_DENT', description: d.description, deductionAmount: amt });
    priceBreakdown.push({ item: d.description, amount: -amt });
  }

  return { issues, priceBreakdown };
};

// ─── POST /api/inspections ───────────────────────────────────────────────────
// Agent saare checks bhejta hai → server price calculate karta hai
const submitInspection = asyncHandler(async (req, res) => {
  const {
    sellRequestId, imei, imei2, imeiMatched,
    autoTests, manualChecks,
  } = req.body;

  // Verify agent is assigned to this request
  const sellRequest = await SellRequest.findOne({
    _id: sellRequestId,
    agent: req.user._id,
    status: { $in: ['agent_assigned', 'on_the_way'] },
  });
  if (!sellRequest) throw new AppError('Sell request not found or not assigned to you', 404);

  // Prevent modifying an already finalized inspection
  let inspection = await Inspection.findOne({ sellRequest: sellRequestId });
  if (inspection && inspection.sellerAccepted !== null) {
    throw new AppError('Inspection already finalized and cannot be modified', 400);
  }

  // ── Price Engine ──────────────────────────────────────────────────────────
  // 1. Base price fetch
  const parsedAutoTests = typeof autoTests === 'string' ? JSON.parse(autoTests) : autoTests;
  const parsedManualChecks = typeof manualChecks === 'string' ? JSON.parse(manualChecks) : manualChecks;

  // Extract brand from model name (e.g. "Pixel 7" → brand = "Google")
  const modelName = sellRequest.model;
  let brand = 'Google'; // default for Pixel phones
  if (modelName.toLowerCase().includes('samsung')) brand = 'Samsung';

  const basePriceDoc = await BasePrice.findOne({
    brand,
    model: modelName,
    storage: sellRequest.storage || '128GB',
    isActive: true,
  });

  const basePrice = basePriceDoc?.basePrice || sellRequest.estimatedMax || sellRequest.offeredPrice || 10000;
  const minFloor = basePriceDoc?.minFloor || 500;

  // 2. Build issues + deductions
  const { issues, priceBreakdown } = await buildIssues(parsedAutoTests, parsedManualChecks, basePrice);

  // 3. Calculated price = base - all deductions (never below floor)
  const totalDeduction = issues.reduce((sum, i) => sum + i.deductionAmount, 0);
  const calculatedPrice = Math.max(basePrice - totalDeduction, minFloor);

  // Rule per PDF Section 3.4: finalPrice = min(sellerRate, calculatedPrice)
  const sellerRate = sellRequest.sellerRate || sellRequest.expectedPrice || calculatedPrice;
  const finalPrice = Math.min(sellerRate, calculatedPrice);

  if (calculatedPrice > sellerRate) {
    priceBreakdown.push({
      item: `Cap adjustment (seller expected ₹${sellerRate.toLocaleString('en-IN')})`,
      amount: -(calculatedPrice - sellerRate),
    });
  }

  // 4. Grade
  const score = calcScore(parsedAutoTests, parsedManualChecks);
  const grade = await assignGrade(score);

  // 5. Check price mismatch (final < estimatedMax * 70%)
  const estimatedMax = sellRequest.estimatedMax || sellRequest.offeredPrice || basePrice;
  const priceMismatch = finalPrice < estimatedMax * 0.7;

  // ── Photos ────────────────────────────────────────────────────────────────
  const photoFiles = req.files || [];
  const photos = photoFiles.map((f, i) => ({
    url: f.path,
    type: req.body[`photoType_${i}`] || 'front',
    timestamp: new Date(),
    location: {
      lat: parseFloat(req.body[`photoLat_${i}`]) || null,
      lng: parseFloat(req.body[`photoLng_${i}`]) || null,
    },
  }));

  // ── Save or Update inspection ─────────────────────────────────────────────
  const inspectionFields = {
    sellRequest: sellRequestId,
    agent: req.user._id,
    imei, imei2,
    imeiMatched: Boolean(imeiMatched),
    autoTests: parsedAutoTests,
    manualChecks: parsedManualChecks,
    photos,
    issues,
    priceBreakdown,
    basePrice,
    calculatedPrice,
    sellerRate,
    finalPrice,
    grade,
    priceMismatchAlert: priceMismatch,
  };

  if (inspection) {
    Object.assign(inspection, inspectionFields);
    await inspection.save();
  } else {
    inspection = await Inspection.create(inspectionFields);
  }

  // Update sell request status & prices
  sellRequest.calculatedPrice = calculatedPrice;
  sellRequest.sellerRate = sellerRate;
  sellRequest.finalPrice = finalPrice;
  sellRequest.status = 'inspected';
  await sellRequest.save();

  // Audit log
  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'agent',
    action: 'INSPECTION_SUBMITTED',
    targetModel: 'SellRequest',
    targetId: sellRequest._id,
    newValue: { finalPrice, grade, priceMismatch },
  });

  res.status(201).json({
    success: true,
    message: 'Inspection submitted. Show price to seller.',
    data: {
      inspectionId: inspection._id,
      finalPrice,
      grade,
      priceBreakdown,
      priceMismatchAlert: priceMismatch,
    },
  });
});

// ─── GET /api/inspections/:sellRequestId ────────────────────────────────────
// Agent ya seller apna inspection result dekhe
const getInspection = asyncHandler(async (req, res) => {
  const { sellRequestId } = req.params;

  // Build filter based on role
  const filter = { sellRequest: sellRequestId };
  if (req.user.role === 'agent') filter.agent = req.user._id;
  if (req.user.role === 'seller') {
    // seller can only see their own request
    const sr = await SellRequest.findOne({ _id: sellRequestId, seller: req.user._id });
    if (!sr) throw new AppError('Not found', 404);
  }

  const inspection = await Inspection.findOne(filter).populate('agent', 'name');
  if (!inspection) throw new AppError('Inspection not found', 404);

  res.json({ success: true, data: inspection });
});

// ─── POST /api/inspections/:id/send-handover-otp ────────────────────────────
// Agent handover ke time seller ke phone par OTP bhejta hai
const sendHandoverOtp = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({
    _id: req.params.id,
    agent: req.user._id,
  }).populate('sellRequest');

  if (!inspection) throw new AppError('Inspection not found', 404);
  if (inspection.sellRequest.status !== 'inspected') {
    throw new AppError('Inspection not in the right state', 400);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  inspection.sellerOtpHash = hash;
  await inspection.save();

  // Notification Service (SMS via Twilio or Dev Logger)
  const notificationService = require('../services/notificationService');
  const SellerProfile = require('../models/SellerProfile');
  const sellerProfile = await SellerProfile.findOne({ userId: inspection.sellRequest.seller });
  if (sellerProfile?.phone) {
    notificationService.sendHandoverOtp({
      phone: sellerProfile.phone,
      otp,
      model: inspection.sellRequest.model,
    }).catch(() => {});
  }

  const isProd = process.env.NODE_ENV === 'production';

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'agent',
    action: 'HANDOVER_OTP_SENT',
    targetModel: 'Inspection',
    targetId: inspection._id,
  });

  res.json({
    success: true,
    message: 'OTP sent to seller',
    // Only expose OTP in development
    ...(isProd ? {} : { devOtp: otp }),
  });
});

// ─── POST /api/inspections/:id/confirm-handover ─────────────────────────────
// Seller OTP verify karke handover confirm karta hai
const confirmHandover = asyncHandler(async (req, res) => {
  const { otp, accepted, declineReason } = req.body;

  const inspection = await Inspection.findOne({
    _id: req.params.id,
    agent: req.user._id,
  }).populate('sellRequest');

  if (!inspection) throw new AppError('Inspection not found', 404);
  if (!inspection.sellerOtpHash) throw new AppError('Send OTP first', 400);
  if (inspection.sellerAccepted !== null) throw new AppError('Handover already finalized', 400);

  // Verify OTP
  const valid = await bcrypt.compare(otp, inspection.sellerOtpHash);
  if (!valid) throw new AppError('Invalid OTP', 400);

  const sellRequest = inspection.sellRequest;

  if (accepted) {
    // Seller accepted
    inspection.sellerAccepted = true;
    sellRequest.status = 'picked_up';
    sellRequest.payoutAmount = inspection.finalPrice;
    sellRequest.payoutStatus = 'processing';
    // Clear OTP hash after use
    inspection.sellerOtpHash = undefined;

    // Instantiate device in warehouse
    const Device = require('../models/Device');
    let device = await Device.findOne({ sellRequest: sellRequest._id });
    if (!device) {
      device = await Device.create({
        sellRequest: sellRequest._id,
        imei: inspection.imei || `VK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        imei2: inspection.imei2,
        model: sellRequest.model,
        storage: sellRequest.storage,
        color: sellRequest.color,
        grade: inspection.grade || 'A',
        batteryHealth: inspection.autoTests?.batteryHealth?.percent || 90,
        photos: inspection.photos?.map(p => p.url).filter(Boolean) || sellRequest.photos || [],
        status: 'received',
        receivedBy: req.user._id,
        receivedAt: new Date(),
      });
    }

    await AuditLog.create({
      actor: req.user._id,
      actorRole: 'agent',
      action: 'HANDOVER_ACCEPTED',
      targetModel: 'Inspection',
      targetId: inspection._id,
      newValue: { finalPrice: inspection.finalPrice, deviceId: device?._id },
    });
  } else {
    // Seller declined
    inspection.sellerAccepted = false;
    inspection.sellerDeclineReason = declineReason || 'Price not acceptable';
    sellRequest.status = 'declined';
    inspection.sellerOtpHash = undefined;

    await AuditLog.create({
      actor: req.user._id,
      actorRole: 'agent',
      action: 'HANDOVER_DECLINED',
      targetModel: 'Inspection',
      targetId: inspection._id,
      newValue: { declineReason },
    });
  }

  await inspection.save();
  await sellRequest.save();

  res.json({
    success: true,
    message: accepted ? 'Handover complete! Payment will be processed.' : 'Seller declined. Device returned.',
    data: { status: sellRequest.status, finalPrice: inspection.finalPrice },
  });
});

// ─── DIAGNOSTIC SESSION (Seller's Phone Tests per PDF Section 4) ────────────

// POST /api/inspections/:sellRequestId/diagnostic-session
const createDiagnosticSession = asyncHandler(async (req, res) => {
  const { sellRequestId } = req.params;
  const sellRequest = await SellRequest.findOne({
    _id: sellRequestId,
    agent: req.user._id,
  });
  if (!sellRequest) throw new AppError('Sell request not found', 404);

  let inspection = await Inspection.findOne({ sellRequest: sellRequestId });
  if (!inspection) {
    inspection = new Inspection({
      sellRequest: sellRequestId,
      agent: req.user._id,
    });
  }

  // Generate 4-character code (avoiding 0/O, 1/I)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  inspection.diagnosticCode = code;
  inspection.diagnosticExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
  await inspection.save();

  const diagBaseUrl = process.env.DIAGNOSTIC_URL || 'http://localhost:5175';
  const checkUrl = `${diagBaseUrl}/check/${code}`;

  res.json({
    success: true,
    data: {
      code,
      checkUrl,
      expiresAt: inspection.diagnosticExpiresAt,
      model: sellRequest.model,
    },
  });
});

// GET /api/diagnostic/:code
const getDiagnosticByCode = asyncHandler(async (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const inspection = await Inspection.findOne({
    diagnosticCode: code,
    diagnosticExpiresAt: { $gt: new Date() },
  }).populate('sellRequest', 'model storage condition expectedPrice sellerRate');

  if (!inspection) {
    throw new AppError('Invalid or expired diagnostic code', 404);
  }

  res.json({
    success: true,
    data: {
      code,
      model: inspection.sellRequest?.model,
      storage: inspection.sellRequest?.storage,
      condition: inspection.sellRequest?.condition,
      submitted: Boolean(inspection.diagnosticSubmittedAt),
    },
  });
});

// POST /api/diagnostic/:code/auto-tests
const submitDiagnosticAutoTests = asyncHandler(async (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const inspection = await Inspection.findOne({
    diagnosticCode: code,
    diagnosticExpiresAt: { $gt: new Date() },
  });

  if (!inspection) {
    throw new AppError('Invalid or expired diagnostic code', 404);
  }

  const { autoTests } = req.body;
  if (autoTests) {
    inspection.autoTests = {
      ...(inspection.autoTests?.toObject ? inspection.autoTests.toObject() : inspection.autoTests),
      ...autoTests,
    };
  }
  inspection.diagnosticSubmittedAt = new Date();
  await inspection.save();

  res.json({
    success: true,
    message: 'Auto tests submitted successfully. Please hand phone back to agent.',
    data: { submittedAt: inspection.diagnosticSubmittedAt },
  });
});

// GET /api/inspections/:sellRequestId/live-status
const getLiveStatus = asyncHandler(async (req, res) => {
  const { sellRequestId } = req.params;
  const inspection = await Inspection.findOne({ sellRequest: sellRequestId });
  if (!inspection) {
    return res.json({ success: true, data: { active: false } });
  }

  res.json({
    success: true,
    data: {
      active: true,
      code: inspection.diagnosticCode,
      expiresAt: inspection.diagnosticExpiresAt,
      submitted: Boolean(inspection.diagnosticSubmittedAt),
      submittedAt: inspection.diagnosticSubmittedAt,
      autoTests: inspection.autoTests,
    },
  });
});

module.exports = {
  submitInspection,
  getInspection,
  sendHandoverOtp,
  confirmHandover,
  createDiagnosticSession,
  getDiagnosticByCode,
  submitDiagnosticAutoTests,
  getLiveStatus,
};
