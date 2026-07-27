import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type',
      },
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify transaction amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    description: {
      type: String,
      required: [true, 'Please specify a description'],
      trim: true,
      maxlength: [250, 'Description cannot exceed 250 characters'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'credit_card',
    },
    tags: {
      type: [String],
      default: [],
    },
    receiptImage: {
      type: String,
      default: '',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for backward compatibility alias 'date'
transactionSchema.virtual('date').get(function () {
  return this.transactionDate;
}).set(function (v) {
  this.transactionDate = v;
});

// Compound indexes for fast querying & sorting
transactionSchema.index({ user: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, type: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, category: 1, transactionDate: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
