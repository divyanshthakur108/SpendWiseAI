import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, badge, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0] mb-6">
      <div className="space-y-1">
        <div className="flex items-center space-x-2.5">
          {Icon && <Icon className="w-6 h-6 text-[#DC2626] shrink-0" />}
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center space-x-2">
            <span>{title}</span>
            {badge && (
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                {badge}
              </span>
            )}
          </h1>
        </div>
        {subtitle && <p className="text-xs text-[#475569]">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center space-x-3 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
