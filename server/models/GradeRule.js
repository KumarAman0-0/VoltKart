const mongoose = require('mongoose');

// Grade scoring rules — score ke hisaab se grade assign hoti hai
const gradeRuleSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B', 'C'],
    unique: true,
  },
  label: {
    type: String,
    // e.g. 'Excellent', 'Good', 'Fair', 'Poor'
  },
  minScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  description: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('GradeRule', gradeRuleSchema);
