import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Service: Register new user
 */
export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Service: Login user
 */
export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error('Your account has been suspended by an administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Service: Get current logged in user
 */
export const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Service: Generate reset password token
 */
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const error = new Error('There is no user registered with that email address');
    error.statusCode = 404;
    throw error;
  }

  // Generate unhashed random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiration (15 minutes)
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  return {
    resetToken,
    email: user.email,
  };
};

/**
 * Service: Reset password using token
 */
export const resetPasswordService = async ({ resetToken, newPassword }) => {
  // Hash the incoming token to match DB record
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired password reset token');
    error.statusCode = 400;
    throw error;
  }

  // Set new password (pre-save hook will hash it automatically)
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  const token = generateToken(user._id);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    token,
  };
};
