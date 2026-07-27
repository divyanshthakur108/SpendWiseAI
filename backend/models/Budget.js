import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify budget category'],
      trim: true,
      default: 'Overall',
    },
    amount: {
      type: Number,
      required: [true, 'Please specify monthly budget amount'],
      min: [1, 'Budget amount must be at least 1'],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      default: () => new Date().getMonth() + 1,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique budget per category per month per year for each user
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
