/**
 * VoltKart — Seed default price tables
 * Run: node server/scripts/seedPriceTables.js
 *
 * Seeds:
 *  - Default Deduction rules (issue codes for price engine)
 *  - Default Grade Rules (A+/A/B/C score ranges)
 *  - Sample Base Prices (Pixel phones)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Deduction = require('../models/Deduction');
const GradeRule = require('../models/GradeRule');
const BasePrice = require('../models/BasePrice');

const DEFAULT_DEDUCTIONS = [
  { issueCode: 'SCREEN_CRACK',      description: 'Screen cracked or broken',       category: 'screen',      amount: 3000, isPercentage: false },
  { issueCode: 'SCREEN_SCRATCH',    description: 'Screen has visible scratches',    category: 'screen',      amount: 500,  isPercentage: false },
  { issueCode: 'DISPLAY_FAIL',      description: 'Display not working properly',    category: 'screen',      amount: 4000, isPercentage: false },
  { issueCode: 'TOUCH_FAIL',        description: 'Touch not responsive',            category: 'screen',      amount: 2000, isPercentage: false },
  { issueCode: 'BODY_DENT',         description: 'Frame dented or damaged',         category: 'body',        amount: 500,  isPercentage: false },
  { issueCode: 'BATTERY_LOW',       description: 'Battery health below 80%',        category: 'battery',     amount: 1500, isPercentage: false },
  { issueCode: 'BATTERY_CRITICAL',  description: 'Battery health below 60%',        category: 'battery',     amount: 3000, isPercentage: false },
  { issueCode: 'AUDIO_FAIL',        description: 'Speaker or microphone not working', category: 'functional', amount: 1500, isPercentage: false },
  { issueCode: 'FRONT_CAMERA_FAIL', description: 'Front camera not working',        category: 'functional',  amount: 1000, isPercentage: false },
  { issueCode: 'BACK_CAMERA_FAIL',  description: 'Rear camera not working',         category: 'functional',  amount: 1500, isPercentage: false },
  { issueCode: 'WIFI_FAIL',         description: 'WiFi not working',                category: 'functional',  amount: 2000, isPercentage: false },
  { issueCode: 'BLUETOOTH_FAIL',    description: 'Bluetooth not working',           category: 'functional',  amount: 1000, isPercentage: false },
  { issueCode: 'GPS_FAIL',          description: 'GPS not working',                 category: 'functional',  amount: 500,  isPercentage: false },
  { issueCode: 'NO_BOX',            description: 'Original box not included',       category: 'accessories', amount: 200,  isPercentage: false },
  { issueCode: 'NO_CHARGER',        description: 'Charger not included',            category: 'accessories', amount: 300,  isPercentage: false },
];

const DEFAULT_GRADES = [
  { grade: 'A+', label: 'Excellent',  minScore: 90, maxScore: 100, description: 'All tests pass, screen and body in perfect condition' },
  { grade: 'A',  label: 'Good',       minScore: 75, maxScore: 89,  description: 'Minor cosmetic issues, all functions working' },
  { grade: 'B',  label: 'Fair',       minScore: 55, maxScore: 74,  description: 'Some functional issues or visible wear' },
  { grade: 'C',  label: 'Poor',       minScore: 0,  maxScore: 54,  description: 'Multiple issues, heavily worn or broken parts' },
];

const SAMPLE_BASE_PRICES = [
  { brand: 'Google', model: 'Pixel 6',     storage: '128GB', basePrice: 18000, minFloor: 1000 },
  { brand: 'Google', model: 'Pixel 6 Pro', storage: '128GB', basePrice: 22000, minFloor: 1000 },
  { brand: 'Google', model: 'Pixel 7',     storage: '128GB', basePrice: 25000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 7',     storage: '256GB', basePrice: 28000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 7 Pro', storage: '128GB', basePrice: 30000, minFloor: 2000 },
  { brand: 'Google', model: 'Pixel 7a',    storage: '128GB', basePrice: 22000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 8',     storage: '128GB', basePrice: 32000, minFloor: 2000 },
  { brand: 'Google', model: 'Pixel 8 Pro', storage: '128GB', basePrice: 38000, minFloor: 2500 },
  { brand: 'Google', model: 'Pixel 8a',    storage: '128GB', basePrice: 28000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 9',     storage: '128GB', basePrice: 42000, minFloor: 3000 },
  { brand: 'Google', model: 'Pixel 9 Pro', storage: '128GB', basePrice: 50000, minFloor: 3500 },
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/voltkart';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Deductions
    let deductionCount = 0;
    for (const d of DEFAULT_DEDUCTIONS) {
      await Deduction.findOneAndUpdate(
        { issueCode: d.issueCode },
        d,
        { upsert: true, new: true, runValidators: true }
      );
      deductionCount++;
    }
    console.log(`✅ Seeded ${deductionCount} deduction rules`);

    // Grade rules
    for (const g of DEFAULT_GRADES) {
      await GradeRule.findOneAndUpdate(
        { grade: g.grade },
        g,
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`✅ Seeded ${DEFAULT_GRADES.length} grade rules`);

    // Base prices
    let priceCount = 0;
    for (const p of SAMPLE_BASE_PRICES) {
      await BasePrice.findOneAndUpdate(
        { brand: p.brand, model: p.model, storage: p.storage },
        p,
        { upsert: true, new: true, runValidators: true }
      );
      priceCount++;
    }
    console.log(`✅ Seeded ${priceCount} base prices`);

    console.log('\n🎉 Price tables seeded successfully!');
    console.log('   Admin can update these from: /admin/price-tables');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
