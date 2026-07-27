import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getTransactionsAPI,
  createTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
} from '../services/transactionService';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalTransactions: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        sort: sortOption,
      };

      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const res = await getTransactionsAPI(params);
      if (res && res.success) {
        setTransactions(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOption, search, typeFilter, categoryFilter, startDate, endDate, minAmount, maxAmount]);

  const addTransaction = async (data) => {
    try {
      const res = await createTransactionAPI(data);
      if (res && res.success) {
        showToast('Transaction added successfully');
        fetchTransactions();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create transaction';
      alert(msg);
      throw err;
    }
  };

  const editTransaction = async (id, data) => {
    try {
      const res = await updateTransactionAPI(id, data);
      if (res && res.success) {
        showToast('Transaction updated successfully');
        fetchTransactions();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update transaction';
      alert(msg);
      throw err;
    }
  };

  const removeTransaction = async (id) => {
    try {
      const res = await deleteTransactionAPI(id);
      if (res && res.success) {
        showToast('Transaction deleted');
        fetchTransactions();
      }
    } catch (err) {
      alert('Failed to delete transaction');
      throw err;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
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
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
