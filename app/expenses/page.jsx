'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const STATUS_STYLES = {
  pending:  'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

export default function ExpensesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  // Fetch expenses + budget data together
  useEffect(() => {
    async function load() {
      const [expRes, budRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/budget'),
      ]);
      const expData = await expRes.json();
      const budData = await budRes.json();
      setExpenses(expData.expenses || []);
      setBudget(budData);
      setLoading(false);
    }
    load();
  }, []);

  const handleReview = async (id, status) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote }),
    });

    if (res.ok) {
      // Update UI without refetching — find the expense and update it locally
      setExpenses(prev =>
        prev.map(exp =>
          exp._id === id ? { ...exp, status, reviewNote } : exp
        )
      );
      setReviewingId(null);
      setReviewNote('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Budget Alert Banner */}
      {budget?.isExceeded && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 
                        flex items-center gap-3">
          <span className="text-xl">🚨</span>
          <div>
            <p className="text-sm font-medium text-red-800">Budget exceeded!</p>
            <p className="text-xs text-red-600">
              Spent ₹{budget.totalSpent.toLocaleString()} of ₹{budget.budget.toLocaleString()} 
              ({budget.percentage}%)
            </p>
          </div>
        </div>
      )}

      {budget?.isWarning && !budget?.isExceeded && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 
                        flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Approaching budget limit
            </p>
            <p className="text-xs text-amber-600">
              Spent ₹{budget.totalSpent.toLocaleString()} of ₹{budget.budget.toLocaleString()} 
              ({budget.percentage}%)
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        {session?.user?.role !== 'viewer' && (
          <Link
            href="/expenses/new"
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm 
                       font-medium hover:bg-violet-700 transition"
          >
            + New Expense
          </Link>
        )}
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🧾</div>
          <p className="text-sm">No expenses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp._id}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{exp.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium 
                                    ${STATUS_STYLES[exp.status]}`}>
                      {exp.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{exp.category}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(exp.date).toLocaleDateString('en-IN')}
                    </span>
                    {/* Show submitter name to admins */}
                    {isAdmin && (
                      <span className="text-xs text-gray-400">
                        by {exp.submittedBy?.name}
                      </span>
                    )}
                  </div>

                  {/* Review note from admin */}
                  {exp.reviewNote && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Note: {exp.reviewNote}
                    </p>
                  )}

                  {/* Receipt link */}
                  {exp.receiptUrl && (
                    <a
                      href={exp.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 hover:underline mt-1 inline-block"
                    >
                      View receipt →
                    </a>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </p>

                  {/* Admin approve/reject buttons */}
                  {isAdmin && exp.status === 'pending' && (
                    <div className="mt-2">
                      {reviewingId === exp._id ? (
                        <div className="text-left w-48">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 
                                       text-xs mb-1.5 focus:outline-none focus:ring-1 
                                       focus:ring-violet-400"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleReview(exp._id, 'approved')}
                              className="flex-1 bg-green-500 text-white rounded px-2 py-1 
                                         text-xs font-medium hover:bg-green-600 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(exp._id, 'rejected')}
                              className="flex-1 bg-red-500 text-white rounded px-2 py-1 
                                         text-xs font-medium hover:bg-red-600 transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setReviewingId(null)}
                              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(exp._id)}
                          className="text-xs text-violet-600 hover:underline mt-1"
                        >
                          Review →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Delete button */}
                  {(isAdmin || (exp.submittedBy?._id === session?.user?.id && exp.status === 'pending')) && (
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 block ml-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
