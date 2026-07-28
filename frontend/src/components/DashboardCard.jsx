import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  description,
  icon: Icon,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] group-hover:bg-[#E2E8F0] transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-semibold text-[#0F172A] tracking-tight">{value}</div>

        {change && (
          <div
            className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
              isPositive
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-[11px] text-[#64748B] font-normal">{description}</p>
      )}
    </div>
  );
};

export const DashboardCard = ({ title, action, children, className = '' }) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
