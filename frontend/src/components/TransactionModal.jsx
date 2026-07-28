import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, DollarSign, Calendar, Tag, CreditCard, AlignLeft, Plus } from 'lucide-react';
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

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultType = 'expense',
  loading = false,
}) => {
  const isEditing = Boolean(initialData && !initialData._isNew);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: defaultType || 'expense',
    category: defaultType === 'income' ? 'Salary' : 'Groceries',
    paymentMethod: 'credit_card',
    receiptImage: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [tagsList, setTagsList] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Sync Form State when modal opens or initialData/defaultType changes
  useEffect(() => {
    if (initialData && !initialData._isNew) {
      const dateVal = initialData.transactionDate || initialData.date;
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount || '',
        type: initialData.type || defaultType || 'expense',
        category: initialData.category || (initialData.type === 'income' ? 'Salary' : 'Groceries'),
        paymentMethod: initialData.paymentMethod || 'credit_card',
        receiptImage: initialData.receiptImage || '',
        transactionDate: dateVal
          ? new Date(dateVal).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });

      const initialTags = Array.isArray(initialData.tags)
        ? initialData.tags
        : typeof initialData.tags === 'string'
        ? initialData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      setTagsList(initialTags);
    } else {
      setFormData({
        description: '',
        amount: '',
        type: initialData?.type || defaultType || 'expense',
        category: (initialData?.type || defaultType) === 'income' ? 'Salary' : 'Groceries',
        paymentMethod: 'credit_card',
        receiptImage: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setTagsList([]);
    }
    setTagInput('');
    setErrors({});
  }, [initialData, defaultType, isOpen]);

  // Accessibility: Lock background scroll & handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Tag Chips Handlers
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagsList((prev) => prev.filter((t) => t !== tagToRemove));
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

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      tags: tagsList,
    });
  };

  let modalTitle = 'Add New Transaction';
  if (isEditing) {
    modalTitle = 'Edit Transaction';
  } else if (formData.type === 'income') {
    modalTitle = 'Add New Income';
  } else if (formData.type === 'expense') {
    modalTitle = 'Add New Expense';
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Full-Screen Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Shell */}
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in max-h-[90vh] flex flex-col my-auto transition-all duration-250 ease-out transform scale-100">
        
        {/* STICKY HEADER */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0 sticky top-0 z-20">
          <h3 id="modal-title" className="text-base font-semibold text-[#111827] tracking-tight">
            {modalTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-130px)]">
          
          {/* 1. Segmented Control Toggle (Expense / Income) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Transaction Type
            </label>
            <div className="p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] grid grid-cols-2 gap-1 h-12 items-center">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
                className={`h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                  formData.type === 'expense'
                    ? 'bg-[#111827] text-white shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
                className={`h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                  formData.type === 'income'
                    ? 'bg-[#111827] text-white shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* 2. Description / Title Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Description / Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                <AlignLeft className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={
                  formData.type === 'income'
                    ? 'e.g. Monthly Salary, Client Retainer, Investment Return'
                    : 'e.g. Grocery Store, Software Subscription'
                }
                className={`w-full h-12 pl-11 pr-4 py-3 bg-white border ${
                  errors.description ? 'border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#111827]'
                } rounded-xl text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200`}
              />
            </div>
            {errors.description && (
              <p className="text-[11px] text-[#DC2626] font-medium mt-1">{errors.description}</p>
            )}
          </div>

          {/* 3. Responsive Grid: Amount & Transaction Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Amount ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full h-12 pl-11 pr-4 py-3 bg-white border ${
                    errors.amount ? 'border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#111827]'
                  } rounded-xl text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-[#DC2626] font-medium mt-1">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Transaction Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#111827] rounded-xl text-[#111827] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* 4. Responsive Grid: Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#111827] rounded-xl text-[#111827] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200 appearance-none font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Payment Method
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#111827] rounded-xl text-[#111827] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200 appearance-none font-medium"
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

          {/* 5. Removable Chips Tags Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Tags
            </label>
            <div className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl min-h-[52px] flex flex-wrap items-center gap-2 focus-within:border-[#111827] focus-within:ring-1 focus-within:ring-[#111827] transition-all duration-200">
              {tagsList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] rounded-lg text-xs font-medium animate-fade-in"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:text-[#DC2626] transition-colors rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleAddTag}
                placeholder={tagsList.length === 0 ? 'Type tag and press Enter...' : 'Add another tag...'}
                className="flex-1 min-w-[140px] h-8 bg-transparent text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none"
              />

              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1 bg-[#111827] text-white text-[11px] font-semibold rounded-lg hover:bg-[#1F2937] transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>

          {/* 6. Textarea (Additional Notes) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional additional notes or context..."
              className="w-full min-h-[120px] p-4 bg-white border border-[#E5E7EB] focus:border-[#111827] rounded-xl text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200 resize-y"
            />
          </div>

          {/* 7. Receipt Image Upload */}
          <ReceiptUploader
            value={formData.receiptImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, receiptImage: url }))}
          />
        </form>

        {/* STICKY FOOTER */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white flex items-center justify-end space-x-3 shrink-0 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] font-medium text-xs hover:bg-[#F9FAFB] transition-all focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#111827] text-white font-medium text-xs hover:bg-[#1F2937] transition-all shadow-xs flex items-center justify-center space-x-2 focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>
                {isEditing
                  ? 'Update Entry'
                  : formData.type === 'income'
                  ? 'Save Income'
                  : 'Save Expense'}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TransactionModal;
