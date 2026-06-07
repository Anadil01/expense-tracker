import Link from 'next/link';

const LINKS = {
  Product:  [
    { label: 'Features',  href: '/#features' },
    { label: 'Pricing',   href: '/#pricing' },
    { label: 'How it works', href: '/#how' },
    { label: 'Get started',  href: '/register' },
  ],
  Developers: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Expenses',  href: '/expenses' },
    { label: 'Export',    href: '/dashboard' },
    { label: 'Invite',    href: '/onboarding' },
  ],
  Company: [
    { label: 'About',   href: '/#features' },
    { label: 'Contact', href: 'mailto:hi@spendly.app' },
    { label: 'Privacy', href: 'mailto:privacy@spendly.app' },
    { label: 'Terms',   href: 'mailto:legal@spendly.app' },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--ink)',
      borderTop: '1px solid var(--border)',
      padding: '56px 5% 32px',
    }}>

      {/* Top grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '40px',
        marginBottom: '48px',
      }}>

        {/* Brand column */}
        <div style={{ gridColumn: 'span 1' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: "'Instrument Serif', serif",
            fontSize: '20px', color: '#fff',
            marginBottom: '10px',
          }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, var(--violet), var(--emerald))',
              borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>
              💸
            </div>
            Spendly
          </div>

          <p style={{
            fontSize: '13px', color: 'var(--muted)',
            lineHeight: 1.7, maxWidth: '220px', fontWeight: 300,
          }}>
            Expense management built for modern teams. Fast, transparent, and actually enjoyable to use.
          </p>

          {/* Socials */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {[
              { label: 'mail', href: 'mailto:hi@spendly.app' },
              { label: 'demo', href: '/register' },
              { label: 'app', href: '/dashboard' },
            ].map(s => (
              <a key={s.label} href={s.href} style={{
                width: '34px', height: '34px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: 'var(--muted-2)',
                textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--muted-2)';
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <div style={{
              fontSize: '12px', fontWeight: 600, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '16px',
            }}>
              {title}
            </div>
            {links.map(link => (
              <Link key={link.label} href={link.href} style={{
                display: 'block',
                fontSize: '13px', color: 'var(--muted)',
                textDecoration: 'none',
                marginBottom: '10px', fontWeight: 300,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
          © 2025 Spendly. Built with Next.js, MongoDB & ☕
        </p>

        {/* System status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: 'var(--emerald)',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--emerald)',
            animation: 'pulse 2s ease infinite',
          }} />
          All systems operational
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Cookies'].map(label => (
            <Link key={label} href={label === 'Privacy' ? 'mailto:privacy@spendly.app' : label === 'Terms' ? 'mailto:legal@spendly.app' : 'mailto:privacy@spendly.app'} style={{
              fontSize: '12px', color: 'var(--muted)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </footer>
  );
}
