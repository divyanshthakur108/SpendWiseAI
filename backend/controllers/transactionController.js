import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
} from '../services/transactionService.js';
import { validateTransactionInput } from '../validations/transactionValidation.js';

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res, next) => {
  try {
    const { errors, isValid } = validateTransactionInput(req.body, false);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation failed';
      return res.status(400).json({ success: false, message: firstError, errors });
    }

    const transaction = await createTransactionService(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user transactions (supports search, filtering, sorting, pagination)
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { transactions, pagination } = await getTransactionsService(req.user._id, req.query);

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await getTransactionByIdService(req.user._id, req.params.id);

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const { errors, isValid } = validateTransactionInput(req.body, true);
    if (!isValid) {
      const firstError = Object.values(errors)[0] || 'Validation failed';
      return res.status(400).json({ success: false, message: firstError, errors });
    }

    const transaction = await updateTransactionService(req.user._id, req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const result = await deleteTransactionService(req.user._id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
