import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  description,
  icon: Icon,
  accentColor = 'indigo',
}) => {
  const colorMap = {
    indigo: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    emerald: 'text-[#22C55E] bg-[#F0FDF4] border-[#BBF7D0]',
    rose: 'text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]',
    purple: 'text-[#9333EA] bg-[#FAF5FF] border-[#E9D5FF]',
    amber: 'text-[#F59E0B] bg-[#FFFBEB] border-[#FDE68A]',
  };

  const selectedColor = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)] transition-all duration-250 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${selectedColor} group-hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{value}</div>

        {change && (
          <div
            className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
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
        <p className="mt-2 text-[11px] text-[#475569] font-medium">{description}</p>
      )}
    </div>
  );
};

export const DashboardCard = ({ title, action, children, className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_8px_24px_rgba(15,23,42,0.08)] space-y-4 hover:border-[#CBD5E1] transition-all duration-250 ${className}`}>
      {title && (
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
