import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Middleware to protect private routes by verifying JWT Bearer token
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header (Bearer <token>) or HttpOnly cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_jwt_secret'
      );

      // Extract logged-in user from database (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user account not found or removed',
        });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by an administrator.',
        });
      }

      return next();
    } catch (error) {
      console.error(`[Auth Error] Token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

/**
 * @desc    Middleware to restrict route access strictly to Admin users
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin authorization required',
  });
};
