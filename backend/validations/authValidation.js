/**
 * Helper validation functions for Authentication Endpoints
 */

export const validateRegisterInput = ({ name, email, password }) => {
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters long';
  } else if (name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password is required and must be at least 8 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateLoginInput = ({ email, password }) => {
  const errors = {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateForgotPasswordInput = ({ email }) => {
  const errors = {};

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateResetPasswordInput = ({ password }) => {
  const errors = {};

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password is required and must be at least 8 characters long';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
