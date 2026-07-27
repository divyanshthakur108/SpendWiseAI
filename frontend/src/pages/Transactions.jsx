import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { TransactionProvider, useTransactions } from '../context/TransactionContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

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

const TransactionsContent = () => {
  const {
    transactions,
    pagination,
    loading,
    error,
    toast,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    sortOption,
    setSortOption,
    page,
    setPage,
    limit,
    setLimit,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState(null);
  const [deletingTxDesc, setDeletingTxDesc] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const location = useLocation();

  // Filter Bar Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync route path (/income, /expenses, /transactions) with typeFilter
  useEffect(() => {
    if (location.pathname.includes('/income')) {
      setTypeFilter('income');
    } else if (location.pathname.includes('/expenses')) {
      setTypeFilter('expense');
    } else if (location.pathname.includes('/transactions')) {
      setTypeFilter('');
    }
    setPage(1);
  }, [location.pathname, setTypeFilter, setPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenAddModal = () => {
    const defaultType = location.pathname.includes('/income')
      ? 'income'
      : location.pathname.includes('/expenses')
      ? 'expense'
      : 'expense';
    setEditingTx({ type: defaultType, _isNew: true });
    setModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingTx && !editingTx._isNew) {
        await editTransaction(editingTx._id, formData);
      } else {
        await addTransaction(formData);
      }
      setModalOpen(false);
      setEditingTx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDeleteModal = (tx) => {
    setDeletingTxId(tx._id);
    setDeletingTxDesc(tx.description);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTxId) return;
    setDeleteLoading(true);
    try {
      await removeTransaction(deletingTxId);
      setDeleteModalOpen(false);
      setDeletingTxId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine dynamic title and header icon based on current path
  let pageTitle = 'Transaction Management';
  let pageSubtitle = 'Track, filter, and manage your income & expense transactions.';
  let HeaderIcon = Receipt;

  if (location.pathname.includes('/income')) {
    pageTitle = 'Income Management';
    pageSubtitle = 'Track, filter, and manage all your income earnings.';
    HeaderIcon = TrendingUp;
  } else if (location.pathname.includes('/expenses')) {
    pageTitle = 'Expense Management';
    pageSubtitle = 'Track, filter, and manage all your expense spending.';
    HeaderIcon = TrendingDown;
  }

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        icon={HeaderIcon}
        badge={`${pagination.totalTransactions || 0} Entries`}
        action={
          <button
            onClick={handleOpenAddModal}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        }
      />

      {/* Search, Filter & Sort Control Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search transactions by description..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Quick Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#334155] text-xs focus:outline-none appearance-none font-semibold"
            >
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#334155] text-xs focus:outline-none appearance-none font-semibold"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2.5 bg-white border border-[#CBD5E1] focus:border-[#DC2626] rounded-xl text-[#334155] text-xs focus:outline-none appearance-none pr-8 font-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                showAdvancedFilters
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Range Filters</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Range Filter Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:border-[#DC2626] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:border-[#DC2626] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Min Amount ($)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  setPage(1);
                }}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:border-[#DC2626] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Max Amount ($)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  setPage(1);
                }}
                placeholder="10000"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] text-xs focus:border-[#DC2626] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[#F1F5F9] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
            <p className="text-xs text-[#EF4444] font-semibold">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0F172A]">No transactions found</h3>
              <p className="text-xs text-[#475569]">
                Try adjusting your search criteria or add a new transaction.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="btn-primary"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">
                      {formatDate(tx.transactionDate || tx.date)}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0F172A]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0F172A] max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                          tx.type === 'income'
                            ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748B] capitalize">
                      {(tx.paymentMethod || 'credit_card').replace('_', ' ')}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-extrabold whitespace-nowrap ${
                        tx.type === 'income' ? 'text-[#16A34A]' : 'text-[#0F172A]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(tx)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Footer */}
        {pagination.totalTransactions > 0 && (
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div className="flex items-center space-x-2 font-medium">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[#334155] text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalTransactions)} of {pagination.totalTransactions}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#334155] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A]">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#334155] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingTx}
        loading={submitLoading}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        itemTitle={`Transaction: ${deletingTxDesc}`}
      />
    </DashboardLayout>
  );
};

const Transactions = () => (
  <TransactionProvider>
    <TransactionsContent />
  </TransactionProvider>
);

export default Transactions;
