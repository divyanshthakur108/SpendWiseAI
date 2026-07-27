import React, { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, Calendar, Tag, CreditCard, AlignLeft, FileText } from 'lucide-react';
import ReceiptUploader from './ReceiptUploader';

const CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Utilities',
  'Software & Tech',
  'Salary',
  'Freelance',
  'Entertainment',
  'Health',
  'Travel',
  'Shopping',
  'Other',
];

const PAYMENT_METHODS = [
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Other', value: 'other' },
];

const TransactionModal = ({ isOpen, onClose, onSubmit, initialData = null, loading }) => {
  const isEditing = Boolean(initialData && !initialData._isNew);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Groceries',
    paymentMethod: 'credit_card',
    receiptImage: '',
    transactionDate: new Date().toISOString().split('T')[0],
    tags: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && !initialData._isNew) {
      const dateVal = initialData.transactionDate || initialData.date;
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Groceries',
        paymentMethod: initialData.paymentMethod || 'credit_card',
        receiptImage: initialData.receiptImage || '',
        transactionDate: dateVal ? new Date(dateVal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        type: initialData?.type || 'expense',
        category: 'Groceries',
        paymentMethod: 'credit_card',
        receiptImage: '',
        transactionDate: new Date().toISOString().split('T')[0],
        tags: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTags = typeof formData.tags === 'string'
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags;

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      tags: parsedTags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_32px_rgba(15,23,42,0.12)] overflow-hidden z-10 animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-[#0F172A]">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Type Toggle Buttons (Expense / Income) */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                formData.type === 'expense'
                  ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                formData.type === 'income'
                  ? 'bg-[#F0FDF4] text-[#22C55E] border border-[#BBF7D0] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Income
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
              Description / Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <AlignLeft className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Grocery Store, Freelance Retainer"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                  errors.description ? 'border-[#EF4444]' : 'border-[#CBD5E1] focus:border-[#DC2626]'
                } rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20`}
              />
            </div>
            {errors.description && (
              <p className="text-[11px] text-[#EF4444] font-medium">{errors.description}</p>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
                Amount ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.amount ? 'border-[#EF4444]' : 'border-[#CBD5E1] focus:border-[#DC2626]'
                  } rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-[#EF4444] font-medium">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
                Transaction Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
                Payment Method
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] text-xs focus:outline-none appearance-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. personal, urgent, tax-deductible"
              className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes or context..."
              className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none"
            />
          </div>

          {/* Receipt Image Upload */}
          <ReceiptUploader
            value={formData.receiptImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, receiptImage: url }))}
          />

          {/* Footer Controls */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E2E8F0] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
