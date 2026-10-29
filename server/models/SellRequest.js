const mongoose = require('mongoose');

const sellRequestSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Device info
  model: {
    type: String,
    required: true,
    enum: [
      'Pixel 6', 'Pixel 6a', 'Pixel 6 Pro',
      'Pixel 7', 'Pixel 7a', 'Pixel 7 Pro',
      'Pixel 8', 'Pixel 8a', 'Pixel 8 Pro',
      'Pixel 9', 'Pixel 9 Pro',
      'Other (eOS/LineageOS)',
    ],
  },
  storage: String,
  color: String,
  condition: {
    type: String,
    enum: ['like_new', 'good', 'fair', 'poor'],
  },
  expectedPrice: {
    type: Number,
    required: true,
  },
  photos: [String], // Cloudinary URLs
  description: String,

  // Pickup address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  // Pickup scheduling
  pickupSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    // morning = 9-12, afternoon = 12-3, evening = 3-6
  },
  pickupDate: Date,

  // "Up to" estimated price shown to seller before inspection
  estimatedMax: Number,

  // Three prices per PDF Section 3.4 & 3.5
  sellerRate: Number,      // seller ne jo maanga (expectedPrice)
  calculatedPrice: Number, // inspection ke baad server ne nikala
  finalPrice: Number,      // min(sellerRate, calculatedPrice)

  // Flow fields
  status: {
    type: String,
    enum: [
      'submitted',
      'approved',
      'agent_assigned',
      'on_the_way',         // agent ne "Start Trip" dabaya
      'inspected',          // inspection complete, seller ko price dikhi
      'picked_up',          // seller ne accept kiya, handover OTP verified
      'received',           // warehouse engineer ne receive kiya
      'verified',           // warehouse engineer secondary check pass
      'paid',               // seller ko payment transfer ho gaya
      'counter_offered',    // warehouse check fail par counter offer bheja
      'counter_accepted',   // seller ne counter offer accept kiya
      'counter_declined',   // seller ne counter offer decline kiya
      'return_to_seller',   // phone seller ko wapas bhej rahe hain
      'rejected',           // admin ya seller ne reject kiya
      'rejected_at_pickup', // agent ne pickup par reject kiya
      'declined',           // seller ne final price decline kiya
      'cancelled',          // kisi bhi stage par cancel
    ],
    default: 'submitted',
  },
  rejectionReason: String,
  offeredPrice: Number,
  sellerResponse: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  // Agent assignment
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  agentAssignedAt: Date,

  // Timestamps for audit & SLA tracking per PDF section 2.4
  handoverOtpVerifiedAt: Date,
  receivedAt: Date,
  verifiedAt: Date,
  paidAt: Date,

  // Payout
  payoutAmount: Number,
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  payoutTransactionId: String,
}, { timestamps: true });

module.exports = mongoose.model('SellRequest', sellRequestSchema);
