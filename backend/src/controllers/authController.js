const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const { asyncHandler, apiError } = require('../middleware/errorMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw apiError(400, 'Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw apiError(401, 'Invalid login credentials');
  }

  let memberId = null;
  if (user.role === 'member') {
    const member = await Member.findOne({ user: user._id });
    memberId = member ? member._id : null;
  }

  res.json({
    success: true,
    data: { token: generateToken(user._id), user: { ...sanitizeUser(user), memberId } },
  });
});

// @route POST /api/auth/register  (admin only)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw apiError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw apiError(400, 'Password must be at least 6 characters');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw apiError(400, 'An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'member',
  });

  res.status(201).json({ success: true, data: sanitizeUser(user) });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw apiError(404, 'User not found');

  let memberId = null;
  if (user.role === 'member') {
    const member = await Member.findOne({ user: user._id });
    memberId = member ? member._id : null;
  }

  res.json({ success: true, data: { ...sanitizeUser(user), memberId } });
});

// @route PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw apiError(400, 'Please provide current and new password');
  if (newPassword.length < 6) throw apiError(400, 'New password must be at least 6 characters');

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw apiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { login, register, getMe, changePassword };
