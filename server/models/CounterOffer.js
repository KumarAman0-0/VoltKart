const mongoose = require('mongoose');

const counterOfferSchema = new mongoose.Schema({
  sellRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellRequest',
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },
  reasons: [{
    issueCode: String,
    description: String,
    deductionAmount: Number,
    photoUrl: String,
    note: String,
  }],
  engineerNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Engineer who created counter offer
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who approved and sent to seller
  },
  status: {
    type: String,
    enum: ['pending_admin', 'sent', 'accepted', 'declined', 'expired'],
    default: 'pending_admin',
  },
  sentAt: Date,
  respondedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours per PDF section 5.2
  },
}, { timestamps: true });

counterOfferSchema.index({ sellRequest: 1 });
counterOfferSchema.index({ seller: 1, status: 1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('CounterOffer', () => {
  return mongoose.models.CounterOffer || mongoose.model('CounterOffer', counterOfferSchema);
});
