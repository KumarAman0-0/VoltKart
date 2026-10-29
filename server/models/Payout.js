const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  sellRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellRequest',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ['upi', 'bank'],
    default: 'upi',
  },
  payoutDetails: {
    upiId: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  reference: String, // UTR or Bank Transaction reference ID
  failureReason: String,
  paidAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

payoutSchema.index({ sellRequest: 1 });
payoutSchema.index({ seller: 1, createdAt: -1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('Payout', () => {
  return mongoose.models.Payout || mongoose.model('Payout', payoutSchema);
});
