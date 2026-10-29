const SellRequest = require('../models/SellRequest');
const Device = require('../models/Device');
const Order = require('../models/Order');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const AuditLog = require('../models/AuditLog');
const BasePrice = require('../models/BasePrice');
const Deduction = require('../models/Deduction');
const GradeRule = require('../models/GradeRule');
const Inspection = require('../models/Inspection');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /admin/requests
const getAllRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const requests = await SellRequest.find(filter)
    .populate('seller', 'name email')
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await SellRequest.countDocuments(filter);

  res.json({ success: true, data: requests, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /admin/requests/:id (with seller KYC)
const getRequestDetails = asyncHandler(async (req, res) => {
  const request = await SellRequest.findById(req.params.id)
    .populate('seller', 'name email')
    .populate('agent', 'name email');

  if (!request) throw new AppError('Request not found', 404);

  // Admin can see seller KYC
  const sellerId = request.seller?._id || request.seller;
  const sellerProfile = sellerId ? await SellerProfile.findOne({ userId: sellerId }) : null;

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'KYC_ACCESS',
    targetModel: 'SellRequest',
    targetId: request._id,
    metadata: { sellerId: sellerId || null },
    ipAddress: req.ip,
  });

  res.json({ success: true, data: { request, sellerProfile } });
});

// PATCH /admin/requests/:id/offer
const setOffer = asyncHandler(async (req, res) => {
  const { offeredPrice, rejectionReason } = req.body;
  const request = await SellRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found', 404);

  if (rejectionReason) {
    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
  } else {
    if (!offeredPrice) throw new AppError('offeredPrice is required', 400);
    request.offeredPrice = offeredPrice;
    request.status = 'approved';
    request.sellerResponse = 'pending';
  }

  await request.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: rejectionReason ? 'REQUEST_REJECTED' : 'OFFER_SET',
    targetModel: 'SellRequest',
    targetId: request._id,
    newValue: { offeredPrice, rejectionReason },
  });

  res.json({ success: true, message: 'Updated', data: request });
});

// POST /admin/requests/:id/assign-agent
const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;

  const agent = await User.findOne({ _id: agentId, role: 'agent' });
  if (!agent) throw new AppError('Agent not found', 404);

  const request = await SellRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found', 404);
  if (request.sellerResponse !== 'accepted') {
    throw new AppError('Seller must accept the offer first', 400);
  }

  request.agent = agentId;
  request.status = 'agent_assigned';
  request.agentAssignedAt = new Date();
  await request.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'AGENT_ASSIGNED',
    targetModel: 'SellRequest',
    targetId: request._id,
    newValue: { agentId },
  });

  res.json({ success: true, message: 'Agent assigned', data: request });
});

// GET /admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [
    totalRequests, pendingRequests, activeDevices, totalOrders,
    revenue, totalUsers, recentLogs,
  ] = await Promise.all([
    SellRequest.countDocuments(),
    SellRequest.countDocuments({ status: { $in: ['submitted', 'approved', 'agent_assigned'] } }),
    Device.countDocuments({ status: 'live' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]),
    User.countDocuments(),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('actor', 'name role'),
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      pendingRequests,
      activeDevices,
      totalOrders,
      revenue: revenue[0]?.total || 0,
      totalUsers,
      recentLogs,
    },
  });
});

// GET /admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = role ? { role } : {};

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);
  res.json({ success: true, data: users, total });
});

// PATCH /admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot block admin', 403);

  user.isBlocked = !user.isBlocked;
  await user.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    targetModel: 'User',
    targetId: user._id,
  });

  res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, data: user });
});

// GET /admin/agents — list all agents for assignment
const getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: 'agent', isBlocked: false }).select('name email');
  res.json({ success: true, data: agents });
});

// GET /admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const orders = await Order.find(filter)
    .populate('buyer', 'name email')
    .populate('device', 'model os grade sellingPrice')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);
  res.json({ success: true, data: orders, total });
});

// PATCH /admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, courierName } = req.body;
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) throw new AppError('Invalid status', 400);

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(trackingNumber && { trackingNumber }), ...(courierName && { courierName }) },
    { new: true }
  );

  if (!order) throw new AppError('Order not found', 404);

  // If order is cancelled, return device to live inventory
  if (status === 'cancelled' && order.device) {
    await Device.findByIdAndUpdate(order.device, { status: 'live' });
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'ORDER_STATUS_UPDATED',
    targetModel: 'Order',
    targetId: order._id,
    newValue: { status },
  });

  res.json({ success: true, data: order });
});

// ─── PRICE TABLES ────────────────────────────────────────────────────────────

// GET /admin/price-tables/base
const getBasePrices = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  const filter = { isActive: true };
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (model) filter.model = new RegExp(model, 'i');
  const prices = await BasePrice.find(filter).sort({ brand: 1, model: 1, storage: 1 });
  res.json({ success: true, data: prices });
});

// POST /admin/price-tables/base — upsert (add ya update)
const upsertBasePrice = asyncHandler(async (req, res) => {
  const { brand, model, storage, basePrice, minFloor } = req.body;
  if (!brand || !model || !storage || !basePrice) {
    throw new AppError('brand, model, storage, basePrice required', 400);
  }

  const doc = await BasePrice.findOneAndUpdate(
    { brand, model, storage },
    { basePrice: Number(basePrice), minFloor: minFloor ? Number(minFloor) : 500, isActive: true, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'BASE_PRICE_UPDATED',
    targetModel: 'BasePrice',
    targetId: doc._id,
    newValue: { brand, model, storage, basePrice },
  });

  res.json({ success: true, message: 'Base price saved', data: doc });
});

// DELETE /admin/price-tables/base/:id
const deleteBasePrice = asyncHandler(async (req, res) => {
  const doc = await BasePrice.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!doc) throw new AppError('Not found', 404);
  res.json({ success: true, message: 'Deactivated' });
});

// GET /admin/price-tables/deductions
const getDeductions = asyncHandler(async (req, res) => {
  const deductions = await Deduction.find({ isActive: true }).sort({ category: 1 });
  res.json({ success: true, data: deductions });
});

// POST /admin/price-tables/deductions — upsert
const upsertDeduction = asyncHandler(async (req, res) => {
  const { issueCode, description, category, amount, isPercentage } = req.body;
  if (!issueCode || !description || !category) {
    throw new AppError('issueCode, description, category required', 400);
  }

  const doc = await Deduction.findOneAndUpdate(
    { issueCode: issueCode.toUpperCase() },
    { description, category, amount: Number(amount) || 0, isPercentage: Boolean(isPercentage), isActive: true, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'DEDUCTION_UPDATED',
    targetModel: 'Deduction',
    targetId: doc._id,
    newValue: { issueCode, amount },
  });

  res.json({ success: true, message: 'Deduction saved', data: doc });
});

// DELETE /admin/price-tables/deductions/:id
const deleteDeduction = asyncHandler(async (req, res) => {
  const doc = await Deduction.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!doc) throw new AppError('Not found', 404);
  res.json({ success: true, message: 'Deactivated' });
});

// GET /admin/price-tables/grades
const getGradeRules = asyncHandler(async (req, res) => {
  const rules = await GradeRule.find().sort({ minScore: -1 });
  res.json({ success: true, data: rules });
});

// POST /admin/price-tables/grades — upsert
const upsertGradeRule = asyncHandler(async (req, res) => {
  const { grade, label, minScore, maxScore, description } = req.body;
  if (!grade || minScore === undefined || maxScore === undefined) {
    throw new AppError('grade, minScore, maxScore required', 400);
  }
  const doc = await GradeRule.findOneAndUpdate(
    { grade },
    { label, minScore: Number(minScore), maxScore: Number(maxScore), description, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: doc });
});

// GET /admin/alerts — price mismatch alerts
const getPriceMismatchAlerts = asyncHandler(async (req, res) => {
  const alerts = await Inspection.find({ priceMismatchAlert: true, sellerAccepted: null })
    .populate({ path: 'sellRequest', select: 'model estimatedMax offeredPrice status' })
    .populate('agent', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: alerts });
});

// POST /admin/requests/:id/set-estimated-max
// Admin "up to" price set karta hai (estimatedMax)
const setEstimatedMax = asyncHandler(async (req, res) => {
  const { estimatedMax } = req.body;
  if (!estimatedMax) throw new AppError('estimatedMax required', 400);

  const request = await SellRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found', 404);

  request.estimatedMax = Number(estimatedMax);
  await request.save();

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'ESTIMATED_MAX_SET',
    targetModel: 'SellRequest',
    targetId: request._id,
    newValue: { estimatedMax },
  });

  res.json({ success: true, message: 'Estimated max price set', data: request });
});

module.exports = {
  getAllRequests, getRequestDetails, setOffer, assignAgent,
  getStats, getAllUsers, toggleBlockUser, getAgents,
  getAllOrders, updateOrderStatus,
  // Price tables
  getBasePrices, upsertBasePrice, deleteBasePrice,
  getDeductions, upsertDeduction, deleteDeduction,
  getGradeRules, upsertGradeRule,
  // Alerts
  getPriceMismatchAlerts, setEstimatedMax,
  // Counter offers & Payouts
  adminListCounterOffers: require('./counterOfferController').adminListCounterOffers,
  adminApproveCounterOffer: require('./counterOfferController').adminApproveCounterOffer,
  adminListPayouts: require('./counterOfferController').adminListPayouts,
  adminRetryPayout: require('./counterOfferController').adminRetryPayout,
};
