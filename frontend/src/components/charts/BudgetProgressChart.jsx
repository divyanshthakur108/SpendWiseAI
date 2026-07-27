import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-white">{data.category}</p>
        <p className="text-slate-300">Spent: <span className="font-bold text-white">${data.spent}</span></p>
        <p className="text-slate-300">Budget: <span className="font-bold text-slate-400">${data.budget}</span></p>
        <p className="text-red-400 font-bold">{data.pct}% Used</p>
      </div>
    );
  }
  return null;
};

const BudgetProgressChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No active monthly budgets set.
      </div>
    );
  }

  const chartData = data.map((b) => ({
    category: b.category,
    pct: b.budget > 0 ? Math.min(100, Math.round((b.spent / b.budget) * 100)) : 0,
    spent: b.spent,
    budget: b.budget,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
          <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pct >= 100 ? '#f43f5e' : entry.pct >= 80 ? '#f59e0b' : '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetProgressChart;
