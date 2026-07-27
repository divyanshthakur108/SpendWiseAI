import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import BudgetModal from '../components/BudgetModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getBudgetsAPI,
  setBudgetAPI,
  updateBudgetAPI,
  deleteBudgetAPI,
} from '../services/budgetService';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  PieChart,
  ShieldAlert,
} from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBudgetsAPI();
      if (res && res.success) {
        setBudgets(res.data);
      }
    } catch (err) {
      console.error('Failed to load budgets', err);
      setError('Could not load budget data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveBudget = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedBudget) {
        await updateBudgetAPI(selectedBudget._id, formData);
        showToast('Budget updated successfully');
      } else {
        await setBudgetAPI(formData);
        showToast('Monthly budget set successfully');
      }
      setIsModalOpen(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error saving budget', err);
      alert(err.response?.data?.message || 'Error saving budget');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteBudgetAPI(deleteId);
      showToast('Budget deleted successfully');
      setIsDeleteOpen(false);
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget', err);
      alert('Error deleting budget');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const openDeleteModal = (budget) => {
    setDeleteId(budget._id);
    setDeleteTitle(`${budget.category} Budget ($${budget.amount})`);
    setIsDeleteOpen(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const criticalBudgets = budgets.filter((b) => b.spentPercentage >= 100);
  const warningBudgets = budgets.filter(
    (b) => b.spentPercentage >= 90 && b.spentPercentage < 100
  );
  const cautionBudgets = budgets.filter(
    (b) => b.spentPercentage >= 80 && b.spentPercentage < 90
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0] mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center space-x-2">
            <span>Monthly Budgets & Thresholds</span>
          </h1>
          <p className="text-xs text-[#475569] mt-1">
            Track monthly limits, remaining funds, and automated 80%, 90%, and 100% threshold warnings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Threshold Warnings */}
      <div className="space-y-3">
        {criticalBudgets.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-start space-x-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#DC2626]">Critical Alert: Budget Exceeded (100%+)</p>
              <p className="mt-0.5 text-[#DC2626]/80">
                You have exceeded the monthly limit for:{' '}
                <strong>{criticalBudgets.map((b) => b.category).join(', ')}</strong>.
              </p>
            </div>
          </div>
        )}

        {warningBudgets.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#D97706]">High Usage Warning (90%+ Spent)</p>
              <p className="mt-0.5 text-[#D97706]/80">
                Approaching budget limit for:{' '}
                <strong>{warningBudgets.map((b) => b.category).join(', ')}</strong>.
              </p>
            </div>
          </div>
        )}

        {cautionBudgets.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#CA8A04] flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#CA8A04]">Budget Caution (80%+ Spent)</p>
              <p className="mt-0.5 text-[#CA8A04]/80">
                You have passed 80% threshold for:{' '}
                <strong>{cautionBudgets.map((b) => b.category).join(', ')}</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E8F0] rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
          <p className="text-xs text-[#475569]">Calculating monthly budget status...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-2 bg-white border border-[#E2E8F0] rounded-2xl">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
          <p className="text-xs text-[#EF4444] font-semibold">{error}</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="p-12 text-center space-y-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#0F172A]">No Monthly Budgets Configured</p>
            <p className="text-xs text-[#475569] max-w-sm mx-auto">
              Set your target monthly spending limits to receive automated threshold warnings and remaining fund tracking.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.spentPercentage >= 100;
            const isWarning = b.spentPercentage >= 90 && b.spentPercentage < 100;
            const isCaution = b.spentPercentage >= 80 && b.spentPercentage < 90;

            let progressColor = 'bg-gradient-to-r from-[#DC2626] to-[#F97316]';
            let badgeBg = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
            let statusText = 'Normal';

            if (isExceeded) {
              progressColor = 'bg-[#EF4444]';
              badgeBg = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
              statusText = '100%+ Exceeded';
            } else if (isWarning) {
              progressColor = 'bg-[#F59E0B]';
              badgeBg = 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
              statusText = '90%+ Warning';
            } else if (isCaution) {
              progressColor = 'bg-[#EAB308]';
              badgeBg = 'bg-[#FFFBEB] text-[#CA8A04] border-[#FDE68A]';
              statusText = '80%+ Caution';
            }

            return (
              <div
                key={b._id}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)] transition-all duration-250"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center font-bold text-xs">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] leading-tight">{b.category}</h3>
                      <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Monthly Budget</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(b)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount Stats */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[11px] text-[#64748B] block font-medium">Spent</span>
                    <span className="font-extrabold text-[#0F172A] text-sm">{formatCurrency(b.spent)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block font-medium">Remaining</span>
                    <span className={`font-extrabold text-sm ${isExceeded ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                      {formatCurrency(b.remaining)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#475569] font-medium">Limit: {formatCurrency(b.amount)}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeBg}`}>
                      {b.spentPercentage}% ({statusText})
                    </span>
                  </div>

                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden border border-[#E2E8F0]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(b.spentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        onSubmit={handleSaveBudget}
        initialData={selectedBudget}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        itemTitle={deleteTitle}
      />
    </DashboardLayout>
  );
};

export default Budgets;
