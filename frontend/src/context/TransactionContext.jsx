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

  const fetchTransactions = useCallback(async (customParams = null) => {
    setLoading(true);
    setError('');
    try {
      let rawParams = {};
      if (customParams && typeof customParams === 'object') {
        rawParams = { ...customParams };
      } else {
        rawParams = {
          page,
          limit,
          sort: sortOption,
        };
        if (search) rawParams.search = search;
        if (typeFilter) rawParams.type = typeFilter;
        if (categoryFilter) rawParams.category = categoryFilter;
        if (startDate) rawParams.startDate = startDate;
        if (endDate) rawParams.endDate = endDate;
        if (minAmount) rawParams.minAmount = minAmount;
        if (maxAmount) rawParams.maxAmount = maxAmount;
      }

      // Filter out empty strings, null, and undefined values from query params
      const cleanParams = {};
      Object.keys(rawParams).forEach((key) => {
        const val = rawParams[key];
        if (val !== '' && val !== null && val !== undefined) {
          cleanParams[key] = val;
        }
      });

      const res = await getTransactionsAPI(cleanParams);
      if (res && res.success) {
        setTransactions(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res?.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch transactions';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOption, search, typeFilter, categoryFilter, startDate, endDate, minAmount, maxAmount]);

  const createTransaction = async (data) => {
    try {
      const res = await createTransactionAPI(data);
      if (res && res.success) {
        showToast('Transaction added successfully');
        fetchTransactions();
        return res.data;
      } else {
        throw new Error(res?.message || 'Failed to create transaction');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create transaction';
      alert(msg);
      throw err;
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await updateTransactionAPI(id, data);
      if (res && res.success) {
        showToast('Transaction updated successfully');
        fetchTransactions();
        return res.data;
      } else {
        throw new Error(res?.message || 'Failed to update transaction');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update transaction';
      alert(msg);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await deleteTransactionAPI(id);
      if (res && res.success) {
        showToast('Transaction deleted');
        fetchTransactions();
      } else {
        throw new Error(res?.message || 'Failed to delete transaction');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete transaction';
      alert(msg);
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
        createTransaction,
        addTransaction: createTransaction,
        updateTransaction,
        editTransaction: updateTransaction,
        deleteTransaction,
        removeTransaction: deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    console.warn('useTransactions was used outside of TransactionProvider context');
    return {
      transactions: [],
      pagination: { currentPage: 1, limit: 10, totalTransactions: 0, totalPages: 1 },
      loading: false,
      error: '',
      toast: '',
      fetchTransactions: () => {},
      createTransaction: () => {},
      addTransaction: () => {},
      updateTransaction: () => {},
      editTransaction: () => {},
      deleteTransaction: () => {},
      removeTransaction: () => {},
    };
  }
  return context;
};

export default TransactionContext;
