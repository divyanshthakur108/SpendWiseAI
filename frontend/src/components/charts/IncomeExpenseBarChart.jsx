import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between items-center space-x-4">
            <span style={{ color: item.color }} className="font-medium">{item.name}:</span>
            <span className="font-bold text-white">${item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const IncomeExpenseBarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No income or expense trajectory data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span className="text-[11px] text-slate-400 capitalize">{value}</span>} />
          <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
          <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseBarChart;
