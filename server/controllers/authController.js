import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const expireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 7;
  const options = {
    expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  user.password = undefined;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: user,
  });
};

// @desc    Register admin user
// @route   POST /api/v1/auth/register
// @access  Private/SuperAdmin
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;
    const user = await User.create({ name, email, password, role, phone, department, createdBy: req.user?._id });
    sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};

// @desc    Register customer/patient
// @route   POST /api/v1/auth/register-customer
// @access  Public
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    // Default role 'user' for customers
    const user = await User.create({ name, email, password, phone, role: 'user' });
    sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    //console.log(user)
    // if (!user || user.password !== password) {
    //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // }
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    user.lastLogin = Date.now();
    user.loginAttempts = 0;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Update profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'department', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link below:\n\n${resetUrl}\n\nThis link expires in 10 minutes.`;

    try {
      await sendEmail({ email: user.email, subject: 'MFine Admin - Password Reset', message });
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) { next(error); }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};
