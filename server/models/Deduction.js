const mongoose = require('mongoose');

// Har issue ke liye deduction amount — admin manage karta hai
const deductionSchema = new mongoose.Schema({
  issueCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    // e.g. 'SCREEN_CRACK', 'BATTERY_LOW', 'BACK_GLASS_SCRATCH'
  },
  description: {
    type: String,
    required: true,
    // e.g. 'Screen cracked or broken'
  },
  category: {
    type: String,
    enum: ['screen', 'body', 'battery', 'functional', 'locks', 'accessories'],
    required: true,
  },
  // Flat amount ya percentage — dono mein se ek
  amount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPercentage: {
    type: Boolean,
    default: false,
    // true = base price ka % katega; false = flat amount
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

deductionSchema.index({ category: 1 });
deductionSchema.index({ isActive: 1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('Deduction', () => {
  return mongoose.models.Deduction || mongoose.model('Deduction', deductionSchema);
});
