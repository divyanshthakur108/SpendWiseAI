/**
 * Validation schema for Transaction Endpoints
 */

export const validateTransactionInput = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
      errors.description = 'Description is required';
    }
  }

  if (!isUpdate || data.amount !== undefined) {
    if (data.amount === undefined || data.amount === null || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      errors.amount = 'Amount must be a positive number greater than zero';
    }
  }

  if (!isUpdate || data.type !== undefined) {
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.type = 'Type must be either income or expense';
    }
  }

  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
      errors.category = 'Category is required';
    }
  }

  if (data.paymentMethod !== undefined) {
    const validMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other'];
    if (!validMethods.includes(data.paymentMethod)) {
      errors.paymentMethod = 'Invalid payment method selected';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
