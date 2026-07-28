import React from 'react';

const PageHeader = ({ title, subtitle, icon: Icon, badge, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-6">
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#111827] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-[10px] uppercase font-medium tracking-wider rounded-full bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                {badge}
              </span>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B]">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex items-center space-x-3 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
