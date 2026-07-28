import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-slate-300">
          Monthly Expenses: <span className="font-bold text-indigo-400">${payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const SpendingLineChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No monthly spending trajectory data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.8} />
          <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#818CF8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingLineChart;
