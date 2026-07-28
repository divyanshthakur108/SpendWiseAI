import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, DollarSign, Tag, Target } from 'lucide-react';

const CATEGORIES = [
  'Overall', 'Groceries', 'Dining Out', 'Utilities', 'Software & Tech',
  'Entertainment', 'Health', 'Travel', 'Shopping', 'Other',
];

const BudgetModal = ({ isOpen, onClose, onSubmit, initialData = null, loading }) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({ category: 'Overall', amount: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ category: initialData.category || 'Overall', amount: initialData.amount || '' });
    } else {
      setFormData({ category: 'Overall', amount: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // ESC Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid monthly budget amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ category: formData.category, amount: Number(formData.amount) });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in my-auto max-h-[90vh] flex flex-col transition-all duration-250 ease-out transform scale-100">
        
        {/* STICKY HEADER */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#111827]" />
            <h3 className="text-base font-semibold text-[#111827] tracking-tight">
              {isEditing ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Budget Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                <Tag className="w-4 h-4" />
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isEditing}
                className="w-full h-12 pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#111827] rounded-xl text-[#111827] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] disabled:opacity-60 appearance-none font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Target Monthly Limit ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="1"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className={`w-full h-12 pl-11 pr-4 py-3 bg-white border ${
                  errors.amount ? 'border-[#DC2626]' : 'border-[#E5E7EB] focus:border-[#111827]'
                } rounded-xl text-[#111827] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827] focus:shadow-xs transition-all duration-200`}
              />
            </div>
            {errors.amount && (
              <p className="text-[11px] text-[#DC2626] font-medium mt-1">{errors.amount}</p>
            )}
          </div>
        </form>

        {/* STICKY FOOTER */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white flex items-center justify-end space-x-3 shrink-0 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] font-medium text-xs hover:bg-[#F9FAFB] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#111827] text-white font-medium text-xs hover:bg-[#1F2937] transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Budget' : 'Save Budget'}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BudgetModal;
