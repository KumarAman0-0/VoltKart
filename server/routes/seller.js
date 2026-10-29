const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  createSellRequest, getMySellRequests, getSellRequestById,
  respondToOffer, updateSellerProfile, getSellerProfile, getPriceEstimate,
  downloadSellerReceipt,
} = require('../controllers/sellerController');

const guard = [verifyToken, allowRoles('seller')];

router.get('/estimate', getPriceEstimate);
router.get('/profile', ...guard, getSellerProfile);
router.put('/profile', ...guard, upload.single('idProof'), updateSellerProfile);
router.post('/', ...guard, upload.array('photos', 3), createSellRequest);
router.get('/mine', ...guard, getMySellRequests);
router.get('/:id', ...guard, getSellRequestById);
router.get('/:id/receipt', downloadSellerReceipt);
router.post('/:id/accept-offer', ...guard, respondToOffer);

module.exports = router;
