import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadReceiptAPI } from '../services/uploadService';

const ReceiptUploader = ({ value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const inputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size cannot exceed 5MB');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const res = await uploadReceiptAPI(file, (percent) => {
        setProgress(percent);
      });

      if (res && (res.success || res.url)) {
        const uploadedUrl = res.url || localPreview;
        setPreview(uploadedUrl);
        onChange(uploadedUrl); // Send Cloudinary URL to parent form state
        showToast('Receipt image uploaded successfully!');
      }
    } catch (err) {
      console.error('Failed to upload receipt', err);
      setError(err.response?.data?.message || 'Failed to upload receipt image. Please try again.');
      // Keep local preview visible on screen as required
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    setProgress(0);
    setError('');
  };

  return (
    <div className="space-y-2">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Receipt Image (Drag & Drop)
      </label>

      {preview ? (
        /* Image Preview Card */
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-3 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800 relative">
            <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Receipt Attached</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
              Cloudinary Upload Complete
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? 'border-red-500 bg-red-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3 py-2">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Uploading receipt... {progress}%</p>
                <div className="w-48 mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-red-500 h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Drag & drop receipt image, or <span className="text-red-400">browse</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
};

export default ReceiptUploader;

