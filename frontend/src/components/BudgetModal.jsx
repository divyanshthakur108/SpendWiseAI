import React, { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-md overflow-hidden z-10 animate-fade-in">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#111827]" />
            <h3 className="text-base font-semibold text-[#0F172A]">
              {isEditing ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Budget Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Tag className="w-4 h-4" />
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isEditing}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#111827] rounded-xl text-[#0F172A] text-xs focus:outline-none disabled:opacity-60 appearance-none font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Target Monthly Limit ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="1"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                  errors.amount ? 'border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#111827]'
                } rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-1 focus:ring-[#111827]`}
              />
            </div>
            {errors.amount && (
              <p className="text-[11px] text-[#DC2626] font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
