const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getWarehouseDevices, getDeviceDetails,
  updateDeviceStatus, addFlashLog, setPricing,
  verifyWarehouseDevice, createWarehouseCounterOffer,
} = require('../controllers/engineerController');

const guard = [verifyToken, allowRoles('engineer', 'admin')];

router.get('/', ...guard, getWarehouseDevices);
router.get('/:id', ...guard, getDeviceDetails);
router.patch('/:id/status', ...guard, updateDeviceStatus);
router.post('/:id/flash-log', ...guard, addFlashLog);
router.patch('/:id/pricing', ...guard, setPricing);
router.post('/:id/verify', ...guard, verifyWarehouseDevice);
router.post('/:id/counter-offer', ...guard, createWarehouseCounterOffer);

module.exports = router;
