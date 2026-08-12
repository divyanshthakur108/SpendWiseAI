import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { uploadReceiptAPI } from '../services/uploadService';
import { scanReceiptOCRAPI } from '../services/ocrService';
import { useTransactions } from '../context/TransactionContext';
import {
  Camera,
  Upload,
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';

const ReceiptScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const { createTransaction } = useTransactions();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrData(null);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUploadAndScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    setOcrData(null);

    try {
      // 1. Upload receipt image to Cloudinary / Data URI
      const uploadRes = await uploadReceiptAPI(selectedFile);
      if (uploadRes && uploadRes.success) {
        const imageUrl = uploadRes.url || previewUrl;

        // 2. Perform OCR Field Extraction API scan
        const ocrRes = await scanReceiptOCRAPI(imageUrl);
        if (ocrRes && ocrRes.success && ocrRes.data) {
          setOcrData(ocrRes.data);
          showToast('Receipt scanned successfully with OCR!');
        } else {
          throw new Error(ocrRes?.message || 'Failed to extract receipt fields via OCR');
        }
      } else {
        throw new Error(uploadRes?.message || 'Failed to upload receipt image');
      }
    } catch (err) {
      console.error('Error scanning receipt', err);
      setError(err.response?.data?.message || err.message || 'Error processing OCR receipt scanner');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateTransactionFromReceipt = async () => {
    if (!ocrData) return;

    try {
      const merchantName = ocrData.merchantName || ocrData.merchant || 'Scanned Receipt';
      await createTransaction({
        type: 'expense',
        category: ocrData.category || 'Shopping',
        amount: typeof ocrData.amount === 'number' ? ocrData.amount : parseFloat(ocrData.amount) || 0,
        description: `Receipt: ${merchantName}`,
        transactionDate: ocrData.date || new Date().toISOString().split('T')[0],
        receiptImage: ocrData.receiptUrl || ocrData.receiptImage || previewUrl,
        notes: ocrData.warning
          ? `OCR Warning: ${ocrData.warning}`
          : `Scanned via SpendWise OCR Engine (Confidence: ${ocrData.confidence || '95%'})`,
      });

      showToast('Transaction created from scanned receipt!');
      setSelectedFile(null);
      setPreviewUrl('');
      setOcrData(null);
    } catch (err) {
      alert('Failed to convert receipt to transaction entry');
    }
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-2xl shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Receipt OCR Scanner"
        subtitle="Upload receipt images to automatically extract merchant, date, amount, and category using Tesseract & AI Vision OCR."
        icon={Camera}
        badge="OCR Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center space-x-2">
            <Upload className="w-4 h-4 text-[#111827]" />
            <span>Upload Receipt Image</span>
          </h3>

          <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#111827] bg-[#F8FAFC] rounded-2xl p-8 text-center transition-all cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-64 mx-auto rounded-xl border border-[#E2E8F0] object-contain shadow-xs"
                />
                <p className="text-xs text-[#64748B] font-medium">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] text-[#111827] flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A]">
                    Click or Drag & Drop receipt image
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">Supports PNG, JPG, JPEG, WEBP</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleUploadAndScan}
            disabled={!selectedFile || scanning}
            className="btn-primary w-full disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Receipt with AI OCR...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Scan Receipt Data</span>
              </>
            )}
          </button>
        </div>

        {/* OCR Result Preview */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Extracted OCR Receipt Data</span>
          </h3>

          {!ocrData ? (
            <div className="p-12 text-center text-xs text-[#64748B] space-y-2 border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]">
              <Camera className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="font-semibold text-[#0F172A]">No Receipt Scanned Yet</p>
              <p className="text-[11px] text-[#64748B]">
                Upload an image on the left and click "Scan Receipt Data" to parse receipt fields.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {ocrData.warning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{ocrData.warning}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium">Merchant / Vendor</span>
                  <span className="font-semibold text-[#0F172A]">
                    {ocrData.merchantName || ocrData.merchant || 'Unknown Vendor'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium">Extracted Amount</span>
                  <span className="font-semibold text-[#16A34A] text-sm">
                    ${typeof ocrData.amount === 'number' ? ocrData.amount.toFixed(2) : ocrData.amount || '0.00'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium">Transaction Date</span>
                  <span className="font-semibold text-[#0F172A]">
                    {ocrData.date || new Date().toISOString().split('T')[0]}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium">Detected Category</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] font-semibold text-[#475569]">
                    {ocrData.category || 'Shopping'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">OCR Confidence</span>
                  <span className="font-semibold text-[#0F172A]">{ocrData.confidence || '95%'}</span>
                </div>
              </div>

              <button
                onClick={handleCreateTransactionFromReceipt}
                className="btn-primary w-full"
              >
                <Plus className="w-4 h-4" />
                <span>Save As Expense Entry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReceiptScanner;



