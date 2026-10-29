const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Prevent admin registration via API
  if (role === 'admin') {
    throw new AppError('Admin accounts cannot be created via registration', 403);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: role || 'buyer',
  });

  // If seller, create profile with phone fallback
  if (user.role === 'seller') {
    await SellerProfile.create({
      userId: user._id,
      phone: req.body.phone || '+91 0000000000',
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    action: 'REGISTER',
    targetModel: 'User',
    targetId: user._id,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, accessToken, refreshToken },
  });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError('Invalid email or password', 401);
  if (user.isBlocked) throw new AppError('Your account has been blocked', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    action: 'LOGIN',
    targetModel: 'User',
    targetId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
});

// POST /auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token required', 401);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    throw new AppError('Invalid refresh token', 401);
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);

  // Rotate refresh token
  await User.findByIdAndUpdate(user._id, {
    $pull: { refreshTokens: token },
    $push: { refreshTokens: newRefresh },
  });

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefresh },
  });
});

// POST /auth/logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    } else {
      await User.findOneAndUpdate(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } }
      );
    }
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, refreshToken, logout, getMe };
