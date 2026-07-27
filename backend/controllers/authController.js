import {
  registerUserService,
  loginUserService,
  getCurrentUserService,
  forgotPasswordService,
  resetPasswordService,
} from '../services/authService.js';

import {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from '../validations/authValidation.js';

/**
 * Helper to set JWT token in HttpOnly Cookie
 */
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation failed';
      return res.status(400).json({ success: false, message: firstError, errors });
    }

    const { user, token } = await registerUserService(req.body);
    sendTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation failed';
      return res.status(400).json({ success: false, message: firstError, errors });
    }

    const { user, token } = await loginUserService(req.body);
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await getCurrentUserService(req.user._id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Private/Public
 */
export const logoutUser = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Initiate forgot password (generates reset token)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { errors, isValid } = validateForgotPasswordInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { resetToken, email } = await forgotPasswordService(req.body);

    // Construct Reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken,
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { errors, isValid } = validateResetPasswordInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { resetToken } = req.params;
    const { password } = req.body;

    const { user, token } = await resetPasswordService({ resetToken, newPassword: password });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};
