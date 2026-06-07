'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: scrolled ? 'rgba(13,13,18,0.95)' : 'rgba(13,13,18,0.7)',
        transition: 'background 0.3s',
      }}>

        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--violet), var(--emerald))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>
            💸
          </div>
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '19px', color: '#fff', letterSpacing: '-0.3px',
          }}>
            Spendly
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul style={{
          display: 'flex', alignItems: 'center', gap: '32px',
          listStyle: 'none',
        }} className="desktop-nav">
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How it works', href: '/#how' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(link => (
            <li key={link.label}>
              <Link href={link.href} style={{
                fontSize: '14px', fontWeight: 400,
                color: 'var(--muted-2)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--muted-2)'}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {session ? (
            // Logged in — show dashboard link + avatar
            <>
              <Link href="/dashboard" style={{
                fontSize: '14px', fontWeight: 500,
                color: 'var(--muted-2)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'color 0.2s, background 0.2s',
              }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'var(--surface)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--muted-2)'; e.target.style.background = 'transparent'; }}
              >
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                fontSize: '14px', fontWeight: 500,
                color: '#fff',
                background: 'var(--violet)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.target.style.background = 'var(--violet-l)'}
                onMouseLeave={e => e.target.style.background = 'var(--violet)'}
              >
                Sign out
              </button>
            </>
          ) : (
            // Logged out
            <>
              <Link href="/login" style={{
                fontSize: '14px', fontWeight: 500,
                color: 'var(--muted-2)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--muted-2)'}
              >
                Log in
              </Link>
              <Link href="/register" style={{
                fontSize: '14px', fontWeight: 500,
                color: '#fff',
                background: 'var(--violet)',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                display: 'inline-block',
                boxShadow: '0 0 0 0 rgba(108,92,231,0)',
              }}
                onMouseEnter={e => {
                  e.target.style.background = 'var(--violet-l)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(108,92,231,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'var(--violet)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Get started →
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none', border: 'none',
              color: '#fff', fontSize: '20px', cursor: 'pointer',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'rgba(13,13,18,0.98)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          zIndex: 99,
          padding: '16px 5%',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[
            { label: 'Features', href: '/#features' },
            { label: 'How it works', href: '/#how' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(link => (
            <Link key={link.label} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '15px', color: 'var(--muted-2)',
                textDecoration: 'none', padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
              flex: 1, textAlign: 'center', padding: '10px',
              border: '1px solid var(--border)', borderRadius: '8px',
              color: 'var(--muted-2)', textDecoration: 'none', fontSize: '14px',
            }}>
              Log in
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} style={{
              flex: 1, textAlign: 'center', padding: '10px',
              background: 'var(--violet)', borderRadius: '8px',
              color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            }}>
              Get started
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}