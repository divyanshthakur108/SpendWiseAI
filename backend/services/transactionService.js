import Transaction from '../models/Transaction.js';

/**
 * Service: Create a new transaction
 */
export const createTransactionService = async (userId, data) => {
  const transaction = await Transaction.create({
    user: userId,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    paymentMethod: data.paymentMethod || 'credit_card',
    tags: Array.isArray(data.tags) ? data.tags : [],
    receiptImage: data.receiptImage || '',
    transactionDate: data.transactionDate || data.date || new Date(),
    notes: data.notes || '',
  });

  return transaction;
};

/**
 * Service: Get paginated, filtered, and sorted transactions
 */
export const getTransactionsService = async (userId, queryParams) => {
  const {
    search,
    type,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = queryParams;

  const filter = { user: userId };

  // Search by description
  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  // Filter by Type (income / expense)
  if (type && ['income', 'expense'].includes(type)) {
    filter.type = type;
  }

  // Filter by Category
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }

  // Filter by Date Range
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) {
      filter.transactionDate.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate.$lte = end;
    }
  }

  // Filter by Amount Range
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  // Sorting
  let sortOptions = { transactionDate: -1 };
  if (sort === 'oldest') {
    sortOptions = { transactionDate: 1 };
  } else if (sort === 'highest') {
    sortOptions = { amount: -1 };
  } else if (sort === 'lowest') {
    sortOptions = { amount: 1 };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const totalTransactions = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    transactions,
    pagination: {
      currentPage: pageNum,
      limit: limitNum,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / limitNum) || 1,
    },
  };
};

/**
 * Service: Get single transaction by ID (user isolated)
 */
export const getTransactionByIdService = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  }).lean();

  if (!transaction) {
    const error = new Error('Transaction not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Service: Update transaction (user isolated)
 */
export const updateTransactionService = async (userId, transactionId, data) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error('Transaction not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  if (data.type !== undefined) transaction.type = data.type;
  if (data.category !== undefined) transaction.category = data.category;
  if (data.amount !== undefined) transaction.amount = Number(data.amount);
  if (data.description !== undefined) transaction.description = data.description;
  if (data.paymentMethod !== undefined) transaction.paymentMethod = data.paymentMethod;
  if (data.tags !== undefined) transaction.tags = data.tags;
  if (data.receiptImage !== undefined) transaction.receiptImage = data.receiptImage;
  if (data.transactionDate !== undefined || data.date !== undefined) {
    transaction.transactionDate = data.transactionDate || data.date;
  }
  if (data.notes !== undefined) transaction.notes = data.notes;

  await transaction.save();
  return transaction;
};

/**
 * Service: Delete transaction (user isolated)
 */
export const deleteTransactionService = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error('Transaction not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  return { id: transactionId };
};
