'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession(); // update() refreshes the session
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          monthlyBudget: Number(budget)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not create workspace');
        setLoading(false);
        return;
      }

      // Refresh the auth session so middleware sees the new workspace immediately.
      const updatedSession = await update();

      if (!updatedSession?.user?.workspaceId) {
        window.location.assign('/dashboard');
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Something went wrong while creating your workspace');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create your workspace
          </h1>
          <p className="text-gray-500 text-sm">
            This is your team&apos;s shared expense hub. You can invite members after setup.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workspace name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Acme Corp, My Team..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly budget (₹)
              <span className="text-gray-400 font-normal ml-1">— optional</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="50000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create workspace →'}
          </button>
        </form>
      </div>
    </div>
  );
}
