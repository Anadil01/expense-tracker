// app/onboarding/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, monthlyBudget: Number(budget) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Workspace created (or already existed) — now refresh the session
    // We retry update() up to 5 times because sometimes it takes a moment
    let attempts = 0;
    let updatedSession = null;

    while (attempts < 5) {
      updatedSession = await update();   // triggers trigger === 'update' in JWT callback
      attempts++;

      // Check if workspaceId is now in the session
      if (updatedSession?.user?.workspaceId) break;

      // Wait 500ms before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!updatedSession?.user?.workspaceId) {
      // Session still didn't update — force a full page reload as last resort
      window.location.href = '/dashboard';
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{ background: 'var(--ink)' }}>
      <div style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%', maxWidth: '440px',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '28px', color: '#fff', marginBottom: '6px'
          }}>
            Create your workspace
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
            This is your team's shared expense hub. You can invite members after setup.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,118,117,0.1)',
            border: '1px solid rgba(255,118,117,0.3)',
            color: '#FF7675',
            fontSize: '13px', borderRadius: '8px',
            padding: '10px 14px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted-2)', marginBottom: '6px' }}>
              Workspace name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--ink-3)',
                border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '14px', color: '#fff', outline: 'none',
              }}
              placeholder="Acme Corp, My Team..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted-2)', marginBottom: '6px' }}>
              Monthly budget (₹)
              <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '4px' }}>— optional</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--ink-3)',
                border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '14px', color: '#fff', outline: 'none',
              }}
              placeholder="50000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--muted)' : 'var(--violet)',
              color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Setting up workspace...
              </>
            ) : 'Create workspace →'}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          input:focus {
            border-color: var(--violet) !important;
            box-shadow: 0 0 0 3px rgba(108,92,231,0.15);
          }
        `}</style>
      </div>
    </div>
  );
}