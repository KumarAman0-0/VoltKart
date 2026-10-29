const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  idProof: {
    type: String, // Cloudinary URL (private signed)
  },
  idProofType: {
    type: String,
    enum: ['aadhaar', 'pan', 'passport', 'dl'],
  },
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String,
  },
  upiId: String,
  isKycVerified: {
    type: Boolean,
    default: false,
  },
  consentGiven: {
    type: Boolean,
    default: false,
  },
  consentTimestamp: Date,
}, { timestamps: true });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('SellerProfile', () => {
  return mongoose.models.SellerProfile || mongoose.model('SellerProfile', sellerProfileSchema);
});
