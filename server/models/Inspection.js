const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  sellRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellRequest',
    required: true,
    unique: true, // ek request ke liye sirf ek inspection
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // IMEI verification
  imei: { type: String, trim: true },
  imei2: { type: String, trim: true },
  imeiMatched: { type: Boolean, default: false },

  // Auto tests (diagnostic app se ya agent tick karta hai)
  autoTests: {
    touch:         { passed: Boolean, notes: String },
    display:       { passed: Boolean, notes: String }, // dead pixels, burn-in
    audio:         { passed: Boolean, notes: String }, // speaker + mic
    vibration:     { passed: Boolean, notes: String },
    frontCamera:   { passed: Boolean, notes: String },
    backCamera:    { passed: Boolean, notes: String },
    proximity:     { passed: Boolean, notes: String },
    accelerometer: { passed: Boolean, notes: String },
    fingerprint:   { passed: Boolean, notes: String },
    wifi:          { passed: Boolean, notes: String },
    bluetooth:     { passed: Boolean, notes: String },
    gps:           { passed: Boolean, notes: String },
    batteryHealth: { percent: Number, passed: Boolean, notes: String },
  },

  // Manual checks (agent khud dekh ke fill karta hai)
  manualChecks: {
    screenCondition: {
      grade: { type: String, enum: ['good', 'light_scratches', 'cracked', 'broken'] },
      notes: String,
    },
    bodyCondition: {
      grade: { type: String, enum: ['good', 'dented', 'broken'] },
      notes: String,
    },
    simNetwork:    { passed: Boolean, notes: String },
    chargingPort:  { passed: Boolean, notes: String },
    volumeButtons: { passed: Boolean, notes: String },
    powerButton:   { passed: Boolean, notes: String },
    locksCleared: {
      google:  { type: Boolean, default: false },
      iCloud:  { type: Boolean, default: false },
      samsung: { type: Boolean, default: false },
      mi:      { type: Boolean, default: false },
    },
    bootloaderOk: { type: Boolean, default: false },
    accessories: [{ type: String, enum: ['box', 'charger', 'bill', 'earphones', 'other'] }],
  },

  // Photos with metadata
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['front', 'back', 'edge_top', 'edge_bottom', 'edge_left', 'edge_right', 'imei_screen', 'damage', 'handover'],
    },
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
  }],

  // Issues found → deductions
  issues: [{
    code: String,           // e.g. 'SCREEN_CRACK'
    description: String,
    deductionAmount: Number,
  }],

  // Price breakdown (server calculated)
  priceBreakdown: [{
    item: String,
    amount: Number,         // positive = add, negative = deduct
  }],

  basePrice: Number,
  calculatedPrice: Number, // server price before min(sellerRate, calculatedPrice)
  sellerRate: Number,      // expected price asked by seller
  finalPrice: Number,      // final = min(sellerRate, calculatedPrice)
  grade: { type: String, enum: ['A+', 'A', 'B', 'C'] },

  // Diagnostic session for seller phone PWA per PDF Section 4
  diagnosticCode: { type: String, uppercase: true, trim: true },
  diagnosticExpiresAt: Date,
  diagnosticSubmittedAt: Date,

  // Handover OTP (bcrypt hash, never plain text)
  sellerOtpHash: String,
  sellerAccepted: { type: Boolean, default: null }, // null=pending, true=accepted, false=declined
  sellerDeclineReason: String,

  // Admin alert flag
  priceMismatchAlert: { type: Boolean, default: false }, // final < estimatedMax * 0.7

}, { timestamps: true });

inspectionSchema.index({ diagnosticCode: 1 });
inspectionSchema.index({ agent: 1, createdAt: -1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('Inspection', () => {
  return mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
});
