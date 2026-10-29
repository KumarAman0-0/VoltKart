const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const SellRequest = require('../models/SellRequest');
const Device = require('../models/Device');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Deduction = require('../models/Deduction');
const GradeRule = require('../models/GradeRule');
const BasePrice = require('../models/BasePrice');

const DEFAULT_DEDUCTIONS = [
  { issueCode: 'SCREEN_CRACK', description: 'Screen cracked or broken', category: 'screen', amount: 3000, isPercentage: false },
  { issueCode: 'SCREEN_SCRATCH', description: 'Screen has visible scratches', category: 'screen', amount: 500, isPercentage: false },
  { issueCode: 'DISPLAY_FAIL', description: 'Display not working properly', category: 'screen', amount: 4000, isPercentage: false },
  { issueCode: 'TOUCH_FAIL', description: 'Touch not responsive', category: 'screen', amount: 2000, isPercentage: false },
  { issueCode: 'BODY_DENT', description: 'Frame dented or damaged', category: 'body', amount: 500, isPercentage: false },
  { issueCode: 'BATTERY_LOW', description: 'Battery health below 80%', category: 'battery', amount: 1500, isPercentage: false },
  { issueCode: 'BATTERY_CRITICAL', description: 'Battery health below 60%', category: 'battery', amount: 3000, isPercentage: false },
  { issueCode: 'AUDIO_FAIL', description: 'Speaker or microphone not working', category: 'functional', amount: 1500, isPercentage: false },
  { issueCode: 'FRONT_CAMERA_FAIL', description: 'Front camera not working', category: 'functional', amount: 1000, isPercentage: false },
  { issueCode: 'BACK_CAMERA_FAIL', description: 'Rear camera not working', category: 'functional', amount: 1500, isPercentage: false },
  { issueCode: 'WIFI_FAIL', description: 'WiFi not working', category: 'functional', amount: 2000, isPercentage: false },
  { issueCode: 'BLUETOOTH_FAIL', description: 'Bluetooth not working', category: 'functional', amount: 1000, isPercentage: false },
  { issueCode: 'GPS_FAIL', description: 'GPS not working', category: 'functional', amount: 500, isPercentage: false },
  { issueCode: 'NO_BOX', description: 'Original box not included', category: 'accessories', amount: 200, isPercentage: false },
  { issueCode: 'NO_CHARGER', description: 'Charger not included', category: 'accessories', amount: 300, isPercentage: false },
];

const DEFAULT_GRADES = [
  { grade: 'A+', label: 'Excellent', minScore: 90, maxScore: 100, description: 'All tests pass, screen and body in perfect condition' },
  { grade: 'A', label: 'Good', minScore: 75, maxScore: 89, description: 'Minor cosmetic issues, all functions working' },
  { grade: 'B', label: 'Fair', minScore: 55, maxScore: 74, description: 'Some functional issues or visible wear' },
  { grade: 'C', label: 'Poor', minScore: 0, maxScore: 54, description: 'Multiple issues, heavily worn or broken parts' },
];

const SAMPLE_BASE_PRICES = [
  { brand: 'Google', model: 'Pixel 6', storage: '128GB', basePrice: 18000, minFloor: 1000 },
  { brand: 'Google', model: 'Pixel 6 Pro', storage: '128GB', basePrice: 22000, minFloor: 1000 },
  { brand: 'Google', model: 'Pixel 7', storage: '128GB', basePrice: 25000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 7', storage: '256GB', basePrice: 28000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 7 Pro', storage: '128GB', basePrice: 30000, minFloor: 2000 },
  { brand: 'Google', model: 'Pixel 7a', storage: '128GB', basePrice: 22000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 8', storage: '128GB', basePrice: 32000, minFloor: 2000 },
  { brand: 'Google', model: 'Pixel 8 Pro', storage: '128GB', basePrice: 38000, minFloor: 2500 },
  { brand: 'Google', model: 'Pixel 8a', storage: '128GB', basePrice: 28000, minFloor: 1500 },
  { brand: 'Google', model: 'Pixel 9', storage: '128GB', basePrice: 42000, minFloor: 3000 },
  { brand: 'Google', model: 'Pixel 9 Pro', storage: '128GB', basePrice: 50000, minFloor: 3500 },
];

const seedPriceTablesIfEmpty = async () => {
  try {
    if (await Deduction.countDocuments() === 0) {
      for (const d of DEFAULT_DEDUCTIONS) {
        await Deduction.findOneAndUpdate({ issueCode: d.issueCode }, d, { upsert: true });
      }
      console.log('✅ Auto-seeded deduction rules');
    }
    if (await GradeRule.countDocuments() === 0) {
      for (const g of DEFAULT_GRADES) {
        await GradeRule.findOneAndUpdate({ grade: g.grade }, g, { upsert: true });
      }
      console.log('✅ Auto-seeded grade rules');
    }
    if (await BasePrice.countDocuments() === 0) {
      for (const p of SAMPLE_BASE_PRICES) {
        await BasePrice.findOneAndUpdate({ brand: p.brand, model: p.model, storage: p.storage }, p, { upsert: true });
      }
      console.log('✅ Auto-seeded base prices');
    }
  } catch (e) {
    console.warn('⚠️ Price tables auto-seed error:', e.message);
  }
};

const autoSeed = async () => {
  await seedPriceTablesIfEmpty();
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('⚡ Database already contains data. Skipping user autoSeed.');
    return;
  }

  console.log('🌱 Seeding initial VoltKart database...');

  // 1. Users
  const userDefs = [
    { name: 'Super Admin', email: 'admin@voltkart.in', passwordHash: 'Admin@1234', role: 'admin' },
    { name: 'Ravi Kumar (Agent)', email: 'agent1@voltkart.in', passwordHash: 'Agent@1234', role: 'agent' },
    { name: 'Priya Singh (Agent)', email: 'agent2@voltkart.in', passwordHash: 'Agent@1234', role: 'agent' },
    { name: 'Arjun Sharma (Engineer)', email: 'engineer1@voltkart.in', passwordHash: 'Engineer@1234', role: 'engineer' },
    { name: 'Divya Nair (Engineer)', email: 'engineer2@voltkart.in', passwordHash: 'Engineer@1234', role: 'engineer' },
    { name: 'Vikram Mehta (Seller)', email: 'seller_test@voltkart.in', passwordHash: 'Seller@1234', role: 'seller' },
    { name: 'Ananya Roy (Buyer)', email: 'buyer_test@voltkart.in', passwordHash: 'Buyer@1234', role: 'buyer' },
  ];

  const users = {};
  for (const def of userDefs) {
    const user = new User(def);
    await user.save();
    users[def.role + (def.email.includes('2') ? '2' : '')] = user;
    console.log(`  ✓ Created ${def.role}: ${def.email}`);
  }

  // 2. Seller Profile
  await SellerProfile.create({
    userId: users['seller']._id,
    phone: '+91 98765 43210',
    address: {
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    idProof: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    idProofType: 'aadhaar',
    idProofVerified: true,
    bankDetails: {
      accountNumber: '918273645012',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Vikram Mehta',
      upiId: 'vikram.mehta@okhdfcbank',
    },
  });

  // 3. Sell Requests
  const req1 = await SellRequest.create({
    seller: users['seller']._id,
    model: 'Pixel 8',
    storage: '256GB',
    color: 'Hazel',
    condition: 'like_new',
    expectedPrice: 48000,
    photos: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'],
    description: 'Flawless condition, bought in UK, pristine screen and battery health 99%.',
    address: {
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    status: 'submitted',
  });

  const req2 = await SellRequest.create({
    seller: users['seller']._id,
    model: 'Pixel 7',
    storage: '128GB',
    color: 'Snow',
    condition: 'good',
    expectedPrice: 32000,
    offeredPrice: 30000,
    sellerResponse: 'pending',
    photos: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'],
    description: 'Minor scratches on back camera visor, front glass is mint.',
    address: {
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    status: 'approved',
  });

  const req3 = await SellRequest.create({
    seller: users['seller']._id,
    model: 'Pixel 7 Pro',
    storage: '128GB',
    color: 'Obsidian',
    condition: 'like_new',
    expectedPrice: 42000,
    offeredPrice: 40000,
    sellerResponse: 'accepted',
    agent: users['agent']._id,
    agentAssignedAt: new Date(Date.now() - 3600000 * 4),
    photos: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'],
    description: 'Ready for pickup. FRP unlocked, Google account removed.',
    address: {
      street: '7th Cross, Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
    },
    status: 'agent_assigned',
  });

  const req4 = await SellRequest.create({
    seller: users['seller']._id,
    model: 'Pixel 6a',
    storage: '128GB',
    color: 'Charcoal',
    condition: 'good',
    expectedPrice: 20000,
    offeredPrice: 19000,
    sellerResponse: 'accepted',
    agent: users['agent']._id,
    agentAssignedAt: new Date(Date.now() - 86400000),
    payoutAmount: 19000,
    payoutStatus: 'processing',
    photos: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'],
    description: 'Clean device, tested bootloader.',
    address: {
      street: '12, HSR Layout Sector 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
    },
    status: 'picked_up',
  });

  // 4. Warehouse & Live Devices
  // Device 1: Received (for engineer testing/wipe)
  await Device.create({
    sellRequest: req4._id,
    imei: '354891092837461',
    imei2: '354891092837462',
    model: 'Pixel 6a',
    storage: '128GB',
    color: 'Charcoal',
    status: 'received',
    receivedBy: users['agent']._id,
    receivedAt: new Date(Date.now() - 3600000 * 2),
    photos: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'],
  });

  // Device 2: Flashed (ready for final QA & pricing)
  await Device.create({
    sellRequest: req4._id,
    imei: '358921092812398',
    model: 'Pixel 7',
    storage: '128GB',
    color: 'Lemongrass',
    grade: 'A',
    batteryHealth: 94,
    os: 'GrapheneOS',
    osVersion: '2024101500',
    flashedBy: users['engineer']._id,
    flashedAt: new Date(Date.now() - 3600000),
    flashLog: [
      { action: 'Bootloader unlocked & factory wiped', performedBy: users['engineer']._id, timestamp: new Date(Date.now() - 7200000) },
      { action: 'Flashed GrapheneOS release 2024101500', performedBy: users['engineer']._id, timestamp: new Date(Date.now() - 3600000) },
      { action: 'Relocked bootloader with custom key', performedBy: users['engineer']._id, timestamp: new Date(Date.now() - 3000000) },
    ],
    status: 'os_flashed',
    receivedBy: users['agent']._id,
    receivedAt: new Date(Date.now() - 86400000),
    photos: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'],
  });

  // Live Devices for Buyer Shop
  const live1 = await Device.create({
    sellRequest: req4._id,
    imei: '359128091287341',
    model: 'Pixel 8 Pro',
    storage: '256GB',
    color: 'Obsidian Black',
    grade: 'A+',
    batteryHealth: 98,
    os: 'GrapheneOS',
    osVersion: '2024102000',
    flashedBy: users['engineer']._id,
    flashedAt: new Date(Date.now() - 86400000 * 2),
    status: 'live',
    sellingPrice: 54999,
    listingTitle: 'Google Pixel 8 Pro (256GB, Obsidian) — GrapheneOS Hardened',
    listingDescription: 'Flagship Google Pixel 8 Pro pre-installed with the latest GrapheneOS privacy build. Relocked bootloader, verified hardware integrity, zero proprietary Google tracking. Features Sandboxed Google Play compatibility and hardened memory allocator.',
    photos: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'],
    warrantyMonths: 6,
    accessories: ['VoltKart Fast Charger 30W', 'Braided Type-C Cable', 'Warranty Card'],
    qaApprovedBy: users['engineer']._id,
    qaApprovedAt: new Date(Date.now() - 86400000),
  });

  const live2 = await Device.create({
    sellRequest: req4._id,
    imei: '357281098234125',
    model: 'Pixel 7',
    storage: '128GB',
    color: 'Snow White',
    grade: 'A',
    batteryHealth: 93,
    os: 'GrapheneOS',
    osVersion: '2024101500',
    status: 'live',
    sellingPrice: 33999,
    listingTitle: 'Google Pixel 7 (128GB, Snow) — Official GrapheneOS',
    listingDescription: 'Pristine condition Google Pixel 7 flashed with certified GrapheneOS. Includes Per-app network toggles, Sensor permissions management, and automatic reboot timer on inactivity.',
    photos: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'],
    warrantyMonths: 6,
    accessories: ['USB-C to C Cable', 'VoltKart Privacy Guide'],
    qaApprovedBy: users['engineer']._id,
    qaApprovedAt: new Date(Date.now() - 86400000 * 2),
  });

  const live3 = await Device.create({
    sellRequest: req4._id,
    imei: '351982039485721',
    model: 'Pixel 6a',
    storage: '128GB',
    color: 'Sage Green',
    grade: 'A',
    batteryHealth: 91,
    os: 'GrapheneOS',
    osVersion: '2024101000',
    status: 'live',
    sellingPrice: 21499,
    listingTitle: 'Google Pixel 6a (128GB, Sage) — Compact Privacy Champion',
    listingDescription: 'Best budget privacy daily driver. High battery efficiency running clean GrapheneOS with zero telemetry, sandboxed apps, and enhanced exploit mitigations.',
    photos: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'],
    warrantyMonths: 6,
    accessories: ['VoltKart Eco Box', 'Type-C Cable'],
    qaApprovedBy: users['engineer']._id,
    qaApprovedAt: new Date(Date.now() - 86400000 * 3),
  });

  const live4 = await Device.create({
    sellRequest: req4._id,
    imei: '356782019283746',
    model: 'Other (eOS/LineageOS)',
    storage: '128GB',
    color: 'Speckled Green',
    grade: 'A+',
    batteryHealth: 99,
    os: '/e/OS',
    osVersion: 'v1.19.1-t',
    status: 'live',
    sellingPrice: 38999,
    listingTitle: 'Fairphone 4 5G (128GB, Green) — /e/OS De-Googled',
    listingDescription: 'Sustainable and modular Fairphone 4 5G running Murena /e/OS. Completely de-Googled ecosystem with microG pre-configured, built-in Advanced Privacy dashboard and tracker blocker.',
    photos: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'],
    warrantyMonths: 6,
    accessories: ['Fairphone Modular Screwdriver', 'VoltKart Privacy Booklet'],
    qaApprovedBy: users['engineer']._id,
    qaApprovedAt: new Date(Date.now() - 86400000 * 4),
  });

  // Sold device with active Order for buyer
  const soldDevice = await Device.create({
    sellRequest: req4._id,
    imei: '358129038475629',
    model: 'Pixel 7a',
    storage: '128GB',
    color: 'Sea Foam',
    grade: 'A',
    batteryHealth: 95,
    os: 'GrapheneOS',
    osVersion: '2024101500',
    status: 'sold',
    sellingPrice: 28999,
    listingTitle: 'Google Pixel 7a (128GB, Sea) — GrapheneOS',
    photos: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'],
    warrantyMonths: 6,
  });

  await Order.create({
    buyer: users['buyer']._id,
    device: soldDevice._id,
    price: 28999,
    address: {
      name: 'Ananya Roy',
      phone: '+91 99887 76655',
      street: 'Flat 402, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
    },
    paymentId: 'pay_rzp_mock_829103847',
    razorpayOrderId: 'order_rzp_mock_192837',
    paymentStatus: 'paid',
    status: 'shipped',
    trackingNumber: 'VKBLR9283746IN',
    courierName: 'BlueDart Express',
    estimatedDelivery: new Date(Date.now() + 86400000 * 2),
  });

  // Audit Logs
  await AuditLog.create([
    {
      actor: users['admin']._id,
      actorRole: 'admin',
      action: 'SYSTEM_INITIALIZED',
      targetModel: 'System',
      targetId: users['admin']._id,
      newValue: { status: 'ready', seeded: true },
    },
    {
      actor: users['engineer']._id,
      actorRole: 'engineer',
      action: 'DEVICE_FLASHED',
      targetModel: 'Device',
      targetId: live1._id,
      newValue: { os: 'GrapheneOS', build: '2024102000' },
    },
  ]);

  console.log('✅ VoltKart database seeded successfully with rich sample inventory!');
};

module.exports = { autoSeed };
