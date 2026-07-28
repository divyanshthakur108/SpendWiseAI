import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactionsAPI } from '../services/transactionService';
import {
  ArrowRight,
  ShoppingCart,
  Utensils,
  Zap,
  Laptop,
  Briefcase,
  Film,
  HeartPulse,
  Plane,
  ShoppingBag,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

const getCategoryIcon = (category = '', type = 'expense') => {
  const cat = category.toLowerCase();
  if (cat.includes('grocery') || cat.includes('food')) return ShoppingCart;
  if (cat.includes('dining') || cat.includes('restaurant') || cat.includes('cafe')) return Utensils;
  if (cat.includes('utility') || cat.includes('bill') || cat.includes('electric')) return Zap;
  if (cat.includes('software') || cat.includes('tech')) return Laptop;
  if (cat.includes('salary') || cat.includes('freelance') || cat.includes('income')) return Briefcase;
  if (cat.includes('entertainment') || cat.includes('movie')) return Film;
  if (cat.includes('health') || cat.includes('medical')) return HeartPulse;
  if (cat.includes('travel') || cat.includes('flight')) return Plane;
  if (cat.includes('shopping')) return ShoppingBag;
  return type === 'income' ? DollarSign : CreditCard;
};

const RecentTransactionsCard = ({ initialData = null, loading: parentLoading = false }) => {
  const [transactions, setTransactions] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setTransactions(initialData.slice(0, 5));
      setLoading(parentLoading);
    } else {
      let isMounted = true;
      const fetchRecent = async () => {
        setLoading(true);
        try {
          const res = await getTransactionsAPI({ limit: 5, sort: 'newest' });
          if (isMounted && res && res.success) {
            setTransactions((res.data || []).slice(0, 5));
          }
        } catch (err) {
          console.error('Failed to load recent transactions', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchRecent();
      return () => {
        isMounted = false;
      };
    }
  }, [initialData, parentLoading]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">Recent Transactions</h3>
          <p className="text-[11px] text-[#64748B]">Your latest 5 financial activities</p>
        </div>

        <Link
          to="/dashboard/transactions"
          className="text-xs font-semibold text-[#111827] hover:text-[#475569] flex items-center space-x-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Body Content */}
      {loading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]" />
                <div className="space-y-1.5">
                  <div className="w-28 h-3.5 bg-[#F1F5F9] rounded animate-pulse" />
                  <div className="w-20 h-2.5 bg-[#F1F5F9] rounded animate-pulse" />
                </div>
              </div>
              <div className="w-16 h-4 bg-[#F1F5F9] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-[#0F172A]">No recent transactions</p>
          <p className="text-[11px] text-[#64748B] max-w-xs mx-auto">
            Transactions will appear here as soon as you record income or expense entries.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {transactions.slice(0, 5).map((tx) => {
            const Icon = getCategoryIcon(tx.category, tx.type);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx._id}
                className="py-3 flex items-center justify-between hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors"
              >
                {/* Left: Category Icon & Text */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                        : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold text-[#0F172A] text-xs truncate">
                      {tx.description || tx.category}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-[#64748B]">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] font-medium text-[#475569]">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{formatDateTime(tx.transactionDate || tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`font-semibold text-xs tracking-tight ${
                      isIncome ? 'text-[#16A34A]' : 'text-[#0F172A]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
