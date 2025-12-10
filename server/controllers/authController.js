const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const formatUserResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  country: user.country,
  state: user.state,
  city: user.city,
  linkedIn: user.linkedIn,
  github: user.github,
  portfolio: user.portfolio,
  bio: user.bio,
  createdAt: user.createdAt,
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({ success: true, token, data: { user: formatUserResponse(user) } });
};

// Register
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 400);
  const user = await User.create({ firstName, lastName, email, password, role: role || 'jobseeker' });
  sendTokenResponse(user, 201, res);
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Please provide email and password', 400);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid credentials', 401);
  sendTokenResponse(user, 200, res);
});

// Google OAuth
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, clientId } = req.body;
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  const payload = ticket.getPayload();
  const { email, given_name, family_name, picture } = payload;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName: given_name || 'User',
      lastName: family_name || '',
      email,
      password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16),
      profilePicture: picture,
      isEmailVerified: true,
    });
  }
  sendTokenResponse(user, 200, res);
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: { user: formatUserResponse(user) } });
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'country', 'state', 'city', 'linkedIn', 'github', 'portfolio', 'bio'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: formatUserResponse(user) }
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, googleAuth, getMe, updateProfile, logout };
