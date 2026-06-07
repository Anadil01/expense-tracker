'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Travel', 'Food & Drinks', 'Software',
  'Office Supplies', 'Marketing', 'Utilities', 'Other'
];

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null); // receipt image preview

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // today's date
    receipt: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, receipt: file }));

    // Show image preview before upload
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview('pdf'); // PDF — show icon instead
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use FormData — required for file uploads
    // JSON.stringify can't handle File objects
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('amount', form.amount);
    formData.append('category', form.category);
    formData.append('date', form.date);
    if (form.receipt) {
      formData.append('receipt', form.receipt);
    }

    const res = await fetch('/api/expenses', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header — browser sets it automatically
      // with the correct boundary for multipart/form-data
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push('/expenses');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">New Expense</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit an expense for admin approval
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 
                       text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Team lunch, Flight to Delhi..."
          />
        </div>

        {/* Amount + Category side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 
                         text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 
                         text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">Select...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 
                       text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receipt
            <span className="text-gray-400 font-normal ml-1">— optional</span>
          </label>

          {/* Custom file input — the default one is ugly */}
          <label className="flex flex-col items-center justify-center w-full h-32 
                            border-2 border-dashed border-gray-200 rounded-lg 
                            cursor-pointer hover:bg-gray-50 transition">
            {preview ? (
              preview === 'pdf' ? (
                <div className="text-center">
                  <div className="text-3xl mb-1">📄</div>
                  <p className="text-sm text-gray-600">PDF attached</p>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="h-full w-full object-contain rounded-lg"
                />
              )
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-1">📎</div>
                <p className="text-sm text-gray-500">Click to upload receipt</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-700 rounded-lg 
                       py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-violet-600 text-white rounded-lg py-2.5 text-sm 
                       font-medium hover:bg-violet-700 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Expense'}
          </button>
        </div>

      </form>
    </div>
  );
}
