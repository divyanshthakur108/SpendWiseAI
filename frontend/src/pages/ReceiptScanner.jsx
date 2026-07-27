import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { uploadReceiptAPI } from '../services/uploadService';
import { scanReceiptOCRAPI } from '../services/ocrService';
import { createTransactionAPI } from '../services/transactionService';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  AlignLeft,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'Groceries', 'Dining Out', 'Utilities', 'Software & Tech',
  'Salary', 'Freelance', 'Entertainment', 'Health', 'Travel', 'Shopping', 'Other',
];

const PAYMENT_METHODS = [
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Other', value: 'other' },
];

const INPUT_CLS = 'w-full pl-9 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:bg-[#F8FAFC]';

const ReceiptScanner = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState('idle'); // idle | uploading | scanning | ready | saving
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    merchant: '',
    description: '',
    amount: '',
    category: 'Groceries',
    paymentMethod: 'credit_card',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
    receiptImage: '',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit. Please select a smaller receipt image.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    processUploadAndScan(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processUploadAndScan = async (file) => {
    setStage('uploading');
    setUploadProgress(10);
    setError('');
    setWarning('');

    try {
      const uploadRes = await uploadReceiptAPI(file, (progress) => {
        setUploadProgress(Math.min(70, Math.max(10, progress)));
      });

      if (!uploadRes || !uploadRes.url) throw new Error('Failed to retrieve uploaded receipt image URL');

      const imageUrl = uploadRes.url;
      setUploadProgress(80);
      setStage('scanning');
      showToast('Receipt uploaded! Extracting details...');

      const ocrRes = await scanReceiptOCRAPI(imageUrl);
      setUploadProgress(100);

      if (ocrRes && ocrRes.success) {
        const d = ocrRes.data;
        setFormData({
          merchant: d.merchant || 'Store Merchant',
          description: d.description || `Receipt from ${d.merchant}`,
          amount: d.amount || '',
          category: d.category || 'Groceries',
          paymentMethod: d.paymentMethod || 'credit_card',
          transactionDate: d.date || new Date().toISOString().split('T')[0],
          notes: d.notes || 'Scanned via SpendWise OCR Engine',
          receiptImage: imageUrl,
        });

        if (d.warning) setWarning(d.warning);
        setStage('ready');
        showToast('Receipt scanned & fields extracted!');
      }
    } catch (err) {
      console.error('Receipt Scan Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload or scan receipt image.');
      setStage('idle');
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setStage('idle');
    setUploadProgress(0);
    setFormData({
      merchant: '', description: '', amount: '', category: 'Groceries',
      paymentMethod: 'credit_card', transactionDate: new Date().toISOString().split('T')[0],
      notes: '', receiptImage: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      alert('Please complete description and amount before saving.');
      return;
    }

    setStage('saving');
    try {
      const res = await createTransactionAPI({
        description: formData.description.trim(),
        amount: Number(formData.amount),
        type: 'expense',
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        transactionDate: formData.transactionDate,
        notes: formData.notes,
        receiptImage: formData.receiptImage,
      });

      if (res && res.success) {
        showToast('Expense transaction saved! Redirecting...');
        setTimeout(() => navigate('/dashboard/transactions'), 1200);
      }
    } catch (err) {
      console.error('Error saving scanned transaction:', err);
      alert('Failed to save transaction. Please try again.');
      setStage('ready');
    }
  };

  const isDisabled = stage === 'uploading' || stage === 'scanning';

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Receipt Scanner & OCR Engine"
        subtitle="Upload paper receipt images for automatic text extraction, categorization, and transaction creation."
        icon={Camera}
        badge="AI OCR Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Zone */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <Upload className="w-4 h-4 text-[#DC2626]" />
              <span>1. Upload Receipt Image</span>
            </h3>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center space-x-3 animate-fade-in">
                <X className="w-5 h-5 text-[#EF4444] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drop Zone */}
            {!previewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#CBD5E1] hover:border-[#DC2626] rounded-2xl p-8 text-center space-y-3 bg-[#F8FAFC] hover:bg-[#FEF2F2] transition-all cursor-pointer group"
                onClick={() => document.getElementById('receipt-file-input').click()}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">
                    Drag & Drop your receipt here, or <span className="text-[#DC2626]">Browse</span>
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Supports JPG, JPEG, PNG, WEBP (Max size: 5 MB)
                  </p>
                </div>
                <input
                  id="receipt-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] p-2 space-y-3">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="w-full h-64 object-contain rounded-xl bg-white"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-[#FEF2F2] text-[#64748B] hover:text-[#EF4444] border border-[#E2E8F0] transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {(stage === 'uploading' || stage === 'scanning') && (
              <div className="space-y-2 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#DC2626] flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#DC2626]" />
                    <span>
                      {stage === 'uploading' ? 'Uploading image to Cloudinary...' : 'Scanning text with OCR Engine...'}
                    </span>
                  </span>
                  <span className="font-extrabold text-[#0F172A]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#FECACA]">
                  <div
                    className="bg-gradient-to-r from-[#DC2626] to-[#F97316] h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Extracted Fields Form */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#F97316]" />
              <span>2. Verify & Edit Extracted Details</span>
            </h3>

            {/* Low Confidence Warning */}
            {warning && (
              <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-xs flex items-center space-x-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>{warning}</span>
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                  Description / Merchant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <AlignLeft className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="e.g. Target Store, Starbucks Coffee"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                    Total Amount ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="0.00"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                    Transaction Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="transactionDate"
                      value={formData.transactionDate}
                      onChange={handleChange}
                      disabled={isDisabled}
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </div>

              {/* Category & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                    Suggested Category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                      <Tag className="w-4 h-4" />
                    </div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isDisabled}
                      className={INPUT_CLS + ' appearance-none'}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                    Payment Method
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      disabled={isDisabled}
                      className={INPUT_CLS + ' appearance-none'}
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                  Notes / Tax info
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isDisabled}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none disabled:opacity-50 disabled:bg-[#F8FAFC]"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={stage !== 'ready' && stage !== 'saving'}
                className="w-full py-3 bg-gradient-to-r from-[#DC2626] to-[#F97316] hover:from-[#B91C1C] hover:to-[#0891B2] text-white font-bold rounded-xl text-xs shadow-[0_8px_24px_rgba(220,38,38,0.25)] flex items-center justify-center space-x-2 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stage === 'saving' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Expense Transaction...</span>
                  </>
                ) : (
                  <>
                    <span>Save Expense Transaction</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptScanner;
