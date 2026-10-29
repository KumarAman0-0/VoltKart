const Device = require('../models/Device');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// GET /devices — public shop (live devices only, no seller info)
const getDevices = asyncHandler(async (req, res) => {
  const { model, os, grade, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;

  const filter = { status: 'live' };
  if (model) filter.model = model;
  if (os) filter.os = os;
  if (grade) filter.grade = grade;
  if (minPrice || maxPrice) {
    filter.sellingPrice = {};
    if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
    if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { listingTitle: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
  }

  const devices = await Device.find(filter)
    .select('model os osVersion grade batteryHealth sellingPrice listingTitle listingDescription photos warrantyMonths accessories storage color status createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Device.countDocuments(filter);

  res.json({
    success: true,
    data: devices,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

// GET /devices/:id — product details (no seller info)
const getDeviceById = asyncHandler(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.id, status: 'live' })
    .select('-sellRequest -flashedBy -receivedBy -qaApprovedBy -flashLog');

  if (!device) throw new AppError('Device not found', 404);
  res.json({ success: true, data: device });
});

// POST /orders — checkout (atomic stock lock)
const createOrder = asyncHandler(async (req, res) => {
  const { deviceId } = req.body;
  const address = req.body.address || req.body.shippingAddress;

  // Atomic stock lock — prevents double-selling
  const device = await Device.findOneAndUpdate(
    { _id: deviceId, status: 'live' },
    { status: 'sold' },
    { new: true }
  );

  if (!device) {
    throw new AppError('Device is no longer available', 409);
  }

  let order;
  let payOrder;
  try {
    order = await Order.create({
      buyer: req.user._id,
      device: device._id,
      price: device.sellingPrice,
      address,
      status: 'placed',
      paymentStatus: 'pending',
    });

    const paymentService = require('../services/paymentService');
    payOrder = await paymentService.createPaymentOrder({
      amount: device.sellingPrice,
      receipt: `order_${order._id}`,
    });
  } catch (err) {
    // Rollback atomic lock on failure
    await Device.findByIdAndUpdate(deviceId, { status: 'live' });
    throw err;
  }

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'buyer',
    action: 'ORDER_PLACED',
    targetModel: 'Order',
    targetId: order._id,
    newValue: { deviceId, price: device.sellingPrice, gatewayOrderId: payOrder.orderId },
  });

  res.status(201).json({
    success: true,
    message: 'Order placed. Proceed to payment.',
    data: {
      ...order.toObject(),
      gatewayOrder: payOrder,
    },
  });
});

// POST /orders/:id/pay — Razorpay payment verification
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const paymentService = require('../services/paymentService');
  const verification = paymentService.verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!verification.isValid) {
    throw new AppError('Payment signature verification failed', 400);
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, buyer: req.user._id },
    {
      paymentStatus: 'paid',
      status: 'paid',
      paymentId: verification.paymentId,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    },
    { new: true }
  );

  if (!order) throw new AppError('Order not found', 404);

  await AuditLog.create({
    actor: req.user._id,
    actorRole: 'buyer',
    action: 'PAYMENT_VERIFIED',
    targetModel: 'Order',
    targetId: order._id,
    newValue: { paymentId: razorpay_payment_id },
  });

  res.json({ success: true, message: 'Payment successful!', data: order });
});

// GET /orders/mine
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('device', 'model os grade photos listingTitle warrantyMonths')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
});

// GET /orders/:id (buyer's own)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
    .populate('device', 'model os grade photos listingTitle batteryHealth warrantyMonths');

  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
});

// POST /orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (!['placed', 'paid'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  order.status = 'cancelled';
  order.cancelReason = reason;
  await order.save();

  // Return device to live
  await Device.findByIdAndUpdate(order.device, { status: 'live' });

  res.json({ success: true, message: 'Order cancelled', data: order });
});

// GET /devices/:id/certificate - PDF download
const downloadDeviceCertificate = asyncHandler(async (req, res) => {
  const { generateDeviceCertificate } = require('../services/pdfService');
  const device = await Device.findById(req.params.id);
  if (!device) {
    throw new AppError('Device not found', 404);
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="VoltKart-Certificate-${(device.model || 'Device').replace(/\s+/g, '-')}.pdf"`);
  generateDeviceCertificate({ device }, res);
});

// GET /orders/:id/invoice - PDF download
const downloadOrderInvoice = asyncHandler(async (req, res) => {
  const { generateBuyerInvoice } = require('../services/pdfService');
  const order = await Order.findById(req.params.id).populate('device').populate('buyer', 'name email');
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="VoltKart-Invoice-${order._id.toString().slice(-6)}.pdf"`);
  generateBuyerInvoice({ order }, res);
});

module.exports = {
  getDevices,
  getDeviceById,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  downloadDeviceCertificate,
  downloadOrderInvoice,
};
