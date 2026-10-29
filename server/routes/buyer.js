const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getDevices, getDeviceById,
  createOrder, verifyPayment, getMyOrders, getOrderById, cancelOrder,
  downloadDeviceCertificate, downloadOrderInvoice,
} = require('../controllers/buyerController');

// Public shop routes
router.get('/devices', getDevices);
router.get('/devices/:id', getDeviceById);
router.get('/devices/:id/certificate', downloadDeviceCertificate);

// Protected order routes
router.post('/orders', verifyToken, allowRoles('buyer'), createOrder);
router.post('/orders/:id/pay', verifyToken, allowRoles('buyer'), verifyPayment);
router.get('/orders/mine', verifyToken, allowRoles('buyer'), getMyOrders);
router.get('/orders/:id', verifyToken, allowRoles('buyer'), getOrderById);
router.get('/orders/:id/invoice', downloadOrderInvoice);
router.post('/orders/:id/cancel', verifyToken, allowRoles('buyer'), cancelOrder);

module.exports = router;
