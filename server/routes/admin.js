const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getAllRequests, getRequestDetails, setOffer, assignAgent,
  getStats, getAllUsers, toggleBlockUser, getAgents,
  getAllOrders, updateOrderStatus,
  getBasePrices, upsertBasePrice, deleteBasePrice,
  getDeductions, upsertDeduction, deleteDeduction,
  getGradeRules, upsertGradeRule,
  getPriceMismatchAlerts, setEstimatedMax,
  adminListCounterOffers, adminApproveCounterOffer,
  adminListPayouts, adminRetryPayout,
} = require('../controllers/adminController');

const guard = [verifyToken, allowRoles('admin')];

// Dashboard
router.get('/stats', ...guard, getStats);

// Sell requests
router.get('/requests', ...guard, getAllRequests);
router.get('/requests/:id', ...guard, getRequestDetails);
router.patch('/requests/:id/offer', ...guard, setOffer);
router.post('/requests/:id/assign-agent', ...guard, assignAgent);

// Users
router.get('/users', ...guard, getAllUsers);
router.get('/agents', ...guard, getAgents);
router.patch('/users/:id/block', ...guard, toggleBlockUser);

// Orders
router.get('/orders', ...guard, getAllOrders);
router.patch('/orders/:id/status', ...guard, updateOrderStatus);

// Price tables
router.get('/price-tables/base', ...guard, getBasePrices);
router.post('/price-tables/base', ...guard, upsertBasePrice);
router.delete('/price-tables/base/:id', ...guard, deleteBasePrice);
router.get('/price-tables/deductions', ...guard, getDeductions);
router.post('/price-tables/deductions', ...guard, upsertDeduction);
router.delete('/price-tables/deductions/:id', ...guard, deleteDeduction);
router.get('/price-tables/grades', ...guard, getGradeRules);
router.post('/price-tables/grades', ...guard, upsertGradeRule);

// Alerts
router.get('/alerts', ...guard, getPriceMismatchAlerts);

// Counter-offers
router.get('/counter-offers', ...guard, adminListCounterOffers);
router.patch('/counter-offers/:id/approve', ...guard, adminApproveCounterOffer);

// Payouts
router.get('/payouts', ...guard, adminListPayouts);
router.post('/payouts/:id/retry', ...guard, adminRetryPayout);

// Admin set "up to" price for a request
router.post('/requests/:id/set-estimated-max', ...guard, setEstimatedMax);

module.exports = router;
