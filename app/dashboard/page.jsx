'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// Colors for pie chart slices
const PIE_COLORS = ['#534AB7', '#1D9E75', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

// Format numbers as ₹1,50,000
const formatINR = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth]   = useState(
    new Date().toISOString().slice(0, 7) // current month "2025-06"
  );

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const handleExport = (format) => {
    // Opens the download in the same tab
    // Browser sees Content-Disposition: attachment and saves the file
    window.open(`/api/export?format=${format}&month=${month}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  const { summary, monthlyChart, categoryChart, recentExpenses, topSpenders, workspace } = data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>

        {/* Export buttons — admin only */}
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 border border-gray-200 text-gray-700
                         px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              ↓ CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 bg-violet-600 text-white
                         px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition"
            >
              ↓ PDF
            </button>
          </div>
        )}
      </div>

      {/* ── Budget alert ──────────────────────────────────── */}
      {summary.isExceeded && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4
                        flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-medium text-red-800 text-sm">Budget exceeded</p>
            <p className="text-xs text-red-600 mt-0.5">
              Spent {formatINR(summary.totalApprovedAmount)} of{' '}
              {formatINR(workspace.budget)} ({summary.budgetPercentage}%)
            </p>
          </div>
          {/* Progress bar */}
          <div className="flex-1 ml-4 hidden sm:block">
            <div className="h-2 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {summary.isWarning && !summary.isExceeded && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4
                        flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-800 text-sm">Approaching budget limit</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Spent {formatINR(summary.totalApprovedAmount)} of{' '}
              {formatINR(workspace.budget)} ({summary.budgetPercentage}%)
            </p>
          </div>
          <div className="flex-1 ml-4 hidden sm:block">
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${summary.budgetPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Summary cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Spent',
            value: formatINR(summary.totalApprovedAmount),
            sub: 'approved this month',
            color: 'text-violet-600'
          },
          {
            label: 'Pending Review',
            value: summary.pending,
            sub: 'awaiting approval',
            color: 'text-amber-600'
          },
          {
            label: 'Approved',
            value: summary.approved,
            sub: 'this month',
            color: 'text-green-600'
          },
          {
            label: 'Rejected',
            value: summary.rejected,
            sub: 'this month',
            color: 'text-red-500'
          },
        ].map(card => (
          <div key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart — takes 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-gray-100
                        rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Monthly Spend (last 6 months)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChart} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatINR(value), 'Spent']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="total" fill="#534AB7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — takes 1/3 width */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            By Category
          </h2>
          {categoryChart.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryChart}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}    // donut shape
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {categoryChart.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => value}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value)]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent expenses */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No expenses yet</p>
            ) : recentExpenses.map(exp => (
              <div key={exp._id} className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center
                                justify-center text-violet-600 font-medium text-xs
                                flex-shrink-0 overflow-hidden">
                  {exp.submittedBy?.image
                    ? <img src={exp.submittedBy.image} alt="" className="w-full h-full object-cover" />
                    : exp.submittedBy?.name?.[0]?.toUpperCase()
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {exp.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {exp.submittedBy?.name} · {exp.category}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatINR(exp.amount)}
                  </p>
                  <span className={`text-xs font-medium ${
                    exp.status === 'approved' ? 'text-green-600'
                    : exp.status === 'rejected' ? 'text-red-500'
                    : 'text-amber-600'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top spenders */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top Spenders — {new Date().toLocaleString('en-IN', { month: 'long' })}
          </h2>
          {topSpenders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topSpenders.map((spender, i) => {
                // Calculate bar width relative to top spender
                const maxTotal = topSpenders[0].total;
                const pct = Math.round((spender.total / maxTotal) * 100);

                return (
                  <div key={spender.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center
                                        justify-center text-violet-600 font-medium text-xs
                                        overflow-hidden">
                          {spender.image
                            ? <img src={spender.image} alt="" className="w-full h-full object-cover" />
                            : spender.name?.[0]?.toUpperCase()
                          }
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {spender.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatINR(spender.total)}
                      </span>
                    </div>
                    {/* Relative progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
