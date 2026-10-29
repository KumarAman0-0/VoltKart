const mongoose = require('mongoose');

// Admin ke liye price table — brand/model/storage ke hisaab se base price
const basePriceSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true,
    // e.g. 'Google', 'Samsung', 'OnePlus'
  },
  model: {
    type: String,
    required: true,
    trim: true,
    // e.g. 'Pixel 7', 'Galaxy S23'
  },
  storage: {
    type: String,
    required: true,
    trim: true,
    // e.g. '128GB', '256GB'
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  // Minimum floor — price kabhi bhi is se kam nahi hoga
  minFloor: {
    type: Number,
    default: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Unique combination: brand + model + storage
basePriceSchema.index({ brand: 1, model: 1, storage: 1 }, { unique: true });
basePriceSchema.index({ isActive: 1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('BasePrice', () => {
  return mongoose.models.BasePrice || mongoose.model('BasePrice', basePriceSchema);
});
