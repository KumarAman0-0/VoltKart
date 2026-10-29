const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  
  // Delivery address
  address: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  
  // Payment
  paymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  
  // Order status machine
  status: {
    type: String,
    enum: ['placed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  },
  
  // Tracking
  trackingNumber: String,
  courierName: String,
  estimatedDelivery: Date,
  
  // Cancellation / return
  cancelReason: String,
  returnReason: String,
  
  // Invoice
  invoiceUrl: String,
  invoiceNumber: String,
}, { timestamps: true });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('Order', () => {
  return mongoose.models.Order || mongoose.model('Order', orderSchema);
});
