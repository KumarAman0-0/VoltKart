const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { verifyToken, optionalVerifyToken } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', optionalVerifyToken, logout);
router.get('/me', verifyToken, getMe);

module.exports = router;
