const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  sellRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellRequest',
    required: true,
  },
  // Hardware
  imei: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  imei2: String,
  model: {
    type: String,
    required: true,
  },
  storage: String,
  color: String,
  
  // Grading
  grade: {
    type: String,
    enum: ['A+', 'A', 'B', 'C'],
  },
  batteryHealth: {
    type: Number, // percentage
    min: 0,
    max: 100,
  },
  
  // Inspection checklist
  inspection: {
    screen: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    camera: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    battery: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    ports: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    buttons: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    wifi: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
    speakers: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
  },
  inspectionNotes: String,
  
  // OS flashing
  os: {
    type: String,
    enum: ['GrapheneOS', '/e/OS', 'LineageOS', 'CalyxOS'],
  },
  osVersion: String,
  flashedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  flashedAt: Date,
  flashLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String,
  }],
  
  // Status machine
  status: {
    type: String,
    enum: [
      'received',
      'verified',
      'tested',
      'wiped',
      'os_flashed',
      'final_qa',
      'live',
      'counter_offered',
      'return_to_seller',
      'sold',
      'shipped',
      'delivered',
    ],
    default: 'received',
  },
  
  // Listing info (when live)
  sellingPrice: Number,
  listingTitle: String,
  listingDescription: String,
  photos: [String], // Cloudinary URLs
  warrantyMonths: {
    type: Number,
    default: 6,
  },
  accessories: [String],
  
  // Warehouse tracking
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receivedAt: Date,
  qaApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  qaApprovedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
