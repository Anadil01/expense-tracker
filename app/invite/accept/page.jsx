'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AcceptInvitePage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const callbackUrl = token ? `/invite/accept?token=${token}` : '/invite/accept';

  const [requestStatus, setRequestStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState(token ? '' : 'Invite link is missing a token.');

  useEffect(() => {
    if (!token) return;
    if (sessionStatus === 'loading') return;
    if (!session) return;

    async function accept() {
      setRequestStatus('loading');

      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRequestStatus('error');
        setMessage(data.error);
        return;
      }

      // Refresh session so workspaceId + role update immediately
      await update();
      setRequestStatus('success');

      setTimeout(() => router.push('/dashboard'), 2000);
    }

    accept();
  }, [router, session, sessionStatus, token, update]);

  const status = !token
    ? 'error'
    : sessionStatus === 'loading' || (session && requestStatus === 'idle')
      ? 'loading'
      : !session
        ? 'auth'
        : requestStatus;

  const authMessage = 'Sign in or create an account to join this workspace.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Joining workspace...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-bold text-gray-900 mb-1">You&apos;re in!</h2>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'auth' && (
          <>
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="font-bold text-gray-900 mb-1">Sign in to continue</h2>
            <p className="text-sm text-gray-500 mb-4">{authMessage}</p>
            <div className="flex gap-3">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Log in
              </Link>
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
              >
                Sign up
              </Link>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="font-bold text-gray-900 mb-1">Invalid invite</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
