import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Groceries', type: 'expense', color: '#10b981', isDefault: true },
  { name: 'Dining Out', type: 'expense', color: '#f59e0b', isDefault: true },
  { name: 'Utilities', type: 'expense', color: '#06b6d4', isDefault: true },
  { name: 'Software & Tech', type: 'expense', color: '#6366f1', isDefault: true },
  { name: 'Salary', type: 'income', color: '#10b981', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#a855f7', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', isDefault: true },
  { name: 'Health', type: 'expense', color: '#f43f5e', isDefault: true },
  { name: 'Travel', type: 'expense', color: '#8b5cf6', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#3b82f6', isDefault: true },
  { name: 'Other', type: 'both', color: '#64748b', isDefault: true },
];

/**
 * @desc    Get system-wide dashboard statistics for admin
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsersCount = await User.countDocuments({ isBlocked: true });
    const totalTransactions = await Transaction.countDocuments();

    const volumeAgg = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalVolume = volumeAgg.length > 0 ? volumeAgg[0].totalAmount : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        blockedUsersCount,
        activeUsersCount: totalUsers - blockedUsersCount,
        totalTransactions,
        totalVolume: Math.round(totalVolume * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users for User Management (with search & pagination)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle block/unblock status for a user
 * @route   PUT /api/admin/users/:id/block
 * @access  Private/Admin
 */
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot block their own account' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user and cascade delete user transactions and budgets
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot delete their own account' });
    }

    // Cascade delete user data
    await Transaction.deleteMany({ user: user._id });
    await Budget.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories for Category Management (seeds defaults if empty)
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find().sort({ name: 1 });

    if (categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
    }

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new system category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ name: name.trim() });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      type: type || 'expense',
      color: color || '#6366f1',
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};
