import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT authentication token
 * @param {string} id - User MongoDB ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
