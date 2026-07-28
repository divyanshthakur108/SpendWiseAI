import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading = false, itemTitle }) => {
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

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 space-y-5 z-10 animate-fade-in my-auto transition-all duration-250 ease-out transform scale-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#111827]">Confirm Delete</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#475569] bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] leading-relaxed">
          Are you sure you want to delete <strong className="text-[#111827]">"{itemTitle || 'this item'}"</strong>?
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] text-xs font-medium hover:bg-[#F9FAFB] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-medium transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteConfirmModal;
