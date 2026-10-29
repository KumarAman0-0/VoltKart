const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  submitInspection,
  getInspection,
  sendHandoverOtp,
  confirmHandover,
  createDiagnosticSession,
  getDiagnosticByCode,
  submitDiagnosticAutoTests,
  getLiveStatus,
} = require('../controllers/inspectionController');

// Agent routes (submit + handover)
const agentGuard = [verifyToken, allowRoles('agent')];

// Diagnostic public routes (seller phone browser)
router.get(['/:code', '/diagnostic/:code'], getDiagnosticByCode);
router.post(['/:code/auto-tests', '/diagnostic/:code/auto-tests'], submitDiagnosticAutoTests);

// Diagnostic agent routes
router.post('/:sellRequestId/diagnostic-session', ...agentGuard, createDiagnosticSession);
router.get('/:sellRequestId/live-status', ...agentGuard, getLiveStatus);

// POST /api/inspections — agent submits full inspection + triggers price engine
router.post(
  '/',
  ...agentGuard,
  upload.array('photos', 10),
  submitInspection
);

// GET /api/inspections/:sellRequestId — agent/seller/admin dekhe
router.get(
  '/:sellRequestId',
  verifyToken,
  allowRoles('agent', 'seller', 'admin'),
  getInspection
);

// POST /api/inspections/:id/send-otp — OTP seller ke phone par bhejo
router.post('/:id/send-otp', ...agentGuard, sendHandoverOtp);

// POST /api/inspections/:id/confirm — seller OTP verify karke handover
router.post('/:id/confirm', ...agentGuard, confirmHandover);

module.exports = router;
