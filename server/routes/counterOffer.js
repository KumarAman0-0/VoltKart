const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getCounterOfferBySellRequest,
  adminListCounterOffers,
  adminApproveCounterOffer,
  sellerAcceptCounterOffer,
  sellerDeclineCounterOffer,
  adminListPayouts,
  adminRetryPayout,
} = require('../controllers/counterOfferController');

// Seller & Admin routes
router.get(
  '/sell-request/:sellRequestId',
  verifyToken,
  allowRoles('seller', 'admin'),
  getCounterOfferBySellRequest
);

router.post(
  '/:id/accept',
  verifyToken,
  allowRoles('seller'),
  sellerAcceptCounterOffer
);

router.post(
  '/:id/decline',
  verifyToken,
  allowRoles('seller'),
  sellerDeclineCounterOffer
);

// Admin counter-offer management
router.get(
  '/admin',
  verifyToken,
  allowRoles('admin'),
  adminListCounterOffers
);

router.patch(
  '/:id/approve',
  verifyToken,
  allowRoles('admin'),
  adminApproveCounterOffer
);

module.exports = router;
