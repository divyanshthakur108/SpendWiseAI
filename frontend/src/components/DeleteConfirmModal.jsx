import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading, itemTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_16px_32px_rgba(15,23,42,0.12)] p-6 space-y-5 z-10 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Confirm Delete</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#475569] bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
          Are you sure you want to delete <strong className="text-[#0F172A]">"{itemTitle || 'this item'}"</strong>?
        </p>

        <div className="flex items-center justify-end space-x-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all flex items-center space-x-2 disabled:opacity-50"
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
};

export default DeleteConfirmModal;
