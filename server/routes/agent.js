const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getPickups, getPickupDetails, verifyPickup, startTrip } = require('../controllers/agentController');

const guard = [verifyToken, allowRoles('agent')];

router.get('/', ...guard, getPickups);
router.get('/:id', ...guard, getPickupDetails);
router.post('/:id/start-trip', ...guard, startTrip);
router.post('/:id/verify', ...guard, upload.array('photos', 5), verifyPickup);

module.exports = router;
