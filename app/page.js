'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── Reusable components ──────────────────────────────────────

function Badge({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'rgba(108,92,231,0.12)',
      border: '1px solid rgba(108,92,231,0.3)',
      borderRadius: '99px', padding: '6px 14px',
      fontSize: '12px', fontWeight: 500, color: 'var(--violet-l)',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      marginBottom: '28px',
      animation: 'fadeUp 0.6s ease both',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'var(--emerald)',
        animation: 'pulse 2s ease infinite', flexShrink: 0,
      }} />
      {children}
    </div>
  );
}

function BtnPrimary({ href, children, size = 'md' }) {
  const styles = {
    md: { padding: '8px 20px', fontSize: '14px', borderRadius: '8px' },
    xl: { padding: '14px 32px', fontSize: '15px', borderRadius: '10px' },
  }[size];

  return (
    <Link href={href} style={{
      ...styles,
      display: 'inline-block',
      background: 'var(--violet)',
      color: '#fff', fontWeight: 500,
      textDecoration: 'none',
      border: 'none',
      boxShadow: '0 4px 24px rgba(108,92,231,0.35)',
      transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--violet-l)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,92,231,0.5)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--violet)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,92,231,0.35)';
      }}
    >
      {children}
    </Link>
  );
}

function BtnOutline({ href, children }) {
  return (
    <Link href={href} style={{
      display: 'inline-block',
      padding: '14px 32px', fontSize: '15px',
      borderRadius: '10px', fontWeight: 500,
      background: 'transparent',
      color: 'var(--muted-2)',
      border: '1px solid var(--border)',
      textDecoration: 'none',
      transition: 'color 0.2s, border-color 0.2s, background 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        e.currentTarget.style.background = 'var(--surface)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--muted-2)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <div className="reveal" style={{ transitionDelay: `${delay}s` }}>
      <div style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px',
        height: '100%',
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(108,92,231,0.4)';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'rgba(108,92,231,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', marginBottom: '18px',
        }}>
          {icon}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function StepItem({ num, title, desc, delay = 0 }) {
  return (
    <div className="reveal" style={{ textAlign: 'center', padding: '0 24px', transitionDelay: `${delay}s` }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'var(--ink)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Instrument Serif', serif",
        fontSize: '22px', color: 'var(--violet-l)',
        margin: '0 auto 20px', position: 'relative', zIndex: 1,
      }}>
        {num}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
    </div>
  );
}

function PricingCard({ plan, price, period, features, cta, ctaHref, featured }) {
  return (
    <div style={{
      background: featured
        ? 'linear-gradient(160deg, rgba(108,92,231,0.1), var(--ink-2))'
        : 'var(--ink-2)',
      border: featured ? '1px solid var(--violet)' : '1px solid var(--border)',
      borderRadius: '20px', padding: '32px',
      position: 'relative',
      boxShadow: featured ? '0 0 0 1px var(--violet), 0 20px 60px rgba(108,92,231,0.2)' : 'none',
      transition: 'transform 0.3s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {featured && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--violet)', color: '#fff',
          fontSize: '11px', fontWeight: 600,
          padding: '4px 14px', borderRadius: '99px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Most popular
        </div>
      )}

      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        {plan}
      </div>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
        {price}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>{period}</div>
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

      {features.map(f => (
        <div key={f} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '13px', color: 'var(--muted-2)',
          marginBottom: '12px', fontWeight: 300,
        }}>
          <span style={{ color: 'var(--emerald)', fontSize: '14px' }}>✓</span>
          {f}
        </div>
      ))}

      <Link href={ctaHref} style={{
        display: 'block', width: '100%',
        padding: '12px', borderRadius: '10px',
        fontSize: '14px', fontWeight: 500,
        textAlign: 'center', textDecoration: 'none',
        marginTop: '24px',
        background: featured ? 'var(--violet)' : 'transparent',
        color: featured ? '#fff' : 'var(--muted-2)',
        border: featured ? 'none' : '1px solid var(--border)',
        boxShadow: featured ? '0 4px 24px rgba(108,92,231,0.3)' : 'none',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => {
          if (featured) {
            e.currentTarget.style.background = 'var(--violet-l)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,92,231,0.5)';
          } else {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.background = 'var(--surface)';
          }
        }}
        onMouseLeave={e => {
          if (featured) {
            e.currentTarget.style.background = 'var(--violet)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,92,231,0.3)';
          } else {
            e.currentTarget.style.color = 'var(--muted-2)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

export default function LandingPage() {

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <main>

        {/* ── HERO ─────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', textAlign: 'center',
          padding: '100px 5% 60px',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Mesh glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, rgba(108,92,231,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0,200,150,0.08) 0%, transparent 60%)
            `,
          }} />

          {/* Animated grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            animation: 'gridShift 20s linear infinite',
          }} />

          <Badge>Now in public beta</Badge>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(44px, 7vw, 88px)',
            lineHeight: 1.05, letterSpacing: '-2px',
            color: '#fff', maxWidth: '800px',
            marginBottom: '24px',
            animation: 'fadeUp 0.6s 0.1s ease both',
          }}>
            Team expenses,{' '}
            <em style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, var(--violet-l), var(--emerald))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              finally under control
            </em>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'var(--muted)', maxWidth: '480px',
            lineHeight: 1.7, marginBottom: '40px', fontWeight: 300,
            animation: 'fadeUp 0.6s 0.2s ease both',
          }}>
            Submit receipts, track budgets, approve requests — all in one clean workspace. Built for teams who are done with spreadsheets.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            flexWrap: 'wrap', justifyContent: 'center',
            animation: 'fadeUp 0.6s 0.3s ease both',
          }}>
            <BtnPrimary href="/register" size="xl">Start free today →</BtnPrimary>
            <BtnOutline href="/#how">See how it works</BtnOutline>
          </div>

          {/* Social proof */}
          <div style={{
            marginTop: '56px',
            display: 'flex', alignItems: 'center', gap: '16px',
            justifyContent: 'center',
            animation: 'fadeUp 0.6s 0.4s ease both',
          }}>
            <div style={{ display: 'flex' }}>
              {[
                { letter: 'A', bg: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' },
                { letter: 'R', bg: 'linear-gradient(135deg, #00C896, #55efc4)' },
                { letter: 'S', bg: 'linear-gradient(135deg, #F5A623, #ffeaa7)' },
                { letter: 'M', bg: 'linear-gradient(135deg, #e17055, #fab1a0)' },
              ].map((a, i) => (
                <div key={a.letter} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '2px solid var(--ink)',
                  marginLeft: i === 0 ? 0 : '-10px',
                  background: a.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 500, color: '#fff',
                }}>
                  {a.letter}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
              <strong style={{ color: '#fff', fontWeight: 500 }}>400+ teams</strong> already<br />
              tracking expenses smarter
            </p>
          </div>

          {/* Dashboard preview */}
          <div style={{
            marginTop: '72px', position: 'relative',
            maxWidth: '860px', width: '100%',
            animation: 'fadeUp 0.8s 0.5s ease both',
          }}>
            <div style={{
              position: 'absolute', inset: '-40px',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(108,92,231,0.2), transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--border)',
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              position: 'relative',
            }}>
              {/* Window chrome */}
              <div style={{
                background: 'var(--ink-3)', height: '40px',
                display: 'flex', alignItems: 'center',
                padding: '0 16px', gap: '8px',
                borderBottom: '1px solid var(--border)',
              }}>
                {[['#FF5F57'], ['#FEBC2E'], ['#28C840']].map(([c]) => (
                  <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                ))}
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  borderRadius: '5px', height: '22px', maxWidth: '260px',
                  margin: '0 auto', display: 'flex', alignItems: 'center',
                  padding: '0 10px', fontSize: '11px', color: 'var(--muted)',
                }}>
                  🔒 spendly.vercel.app/dashboard
                </div>
              </div>

              {/* Mini dashboard */}
              <div style={{ padding: '20px' }}>
                {/* Stats row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px', marginBottom: '16px',
                }}>
                  {[
                    { label: 'Total Spent', val: '₹2.4L', color: 'var(--violet-l)' },
                    { label: 'Approved',    val: '34',    color: 'var(--emerald)' },
                    { label: 'Pending',     val: '7',     color: 'var(--amber)' },
                    { label: 'Budget Used', val: '82%',   color: '#FF7675' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--ink-3)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '12px',
                    }}>
                      <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: s.color }}>
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  {/* Bar chart */}
                  <div style={{
                    background: 'var(--ink-3)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '12px', fontWeight: 500 }}>
                      Monthly Spend
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px' }}>
                      {[35, 55, 42, 78, 90, 65].map((h, i) => (
                        <div key={i} style={{
                          flex: 1, height: `${h}%`,
                          borderRadius: '3px 3px 0 0',
                          background: i === 4 ? 'var(--violet)' : 'rgba(108,92,231,0.3)',
                          animation: `barGrow 0.8s ${0.6 + i * 0.05}s ease both`,
                          transformOrigin: 'bottom',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Donut */}
                  <div style={{
                    background: 'var(--ink-3)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 500, alignSelf: 'flex-start' }}>
                      By Category
                    </div>
                    <svg width="72" height="72" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#6C5CE7" strokeWidth="14" strokeDasharray="56 188" strokeDashoffset="0" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#00C896" strokeWidth="14" strokeDasharray="38 188" strokeDashoffset="-56" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#F5A623" strokeWidth="14" strokeDasharray="28 188" strokeDashoffset="-94" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#FF7675" strokeWidth="14" strokeDasharray="22 188" strokeDashoffset="-122" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────── */}
        <section id="features" style={{ padding: '80px 5%' }}>
          <div className="reveal">
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--violet-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Features
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, letterSpacing: '-1px', color: '#fff', maxWidth: '560px', marginBottom: '16px' }}>
              Everything your finance team needs
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '480px', lineHeight: 1.7, fontWeight: 300 }}>
              From receipt upload to PDF reports — the full workflow, designed for speed.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px', marginTop: '56px',
          }}>
            {[
              { icon: '🛡️', title: 'Role-based access',  delay: 0,    desc: 'Admin, Member, Viewer — each role sees exactly what they need. Invite team members via secure token links that expire in 24 hours.' },
              { icon: '📊', title: 'Live dashboard',      delay: 0.05, desc: 'Bar charts, pie charts, top spenders, budget progress — computed server-side in parallel with Promise.all.' },
              { icon: '📎', title: 'Receipt uploads',     delay: 0.1,  desc: 'Upload JPG, PNG, or PDF receipts. Stored on Cloudinary, deleted automatically when the expense is removed.' },
              { icon: '⚡', title: 'Instant approvals',   delay: 0.15, desc: 'Admins approve or reject with an optional note. Members see status update immediately. No email chains.' },
              { icon: '🚨', title: 'Budget alerts',       delay: 0.2,  desc: 'Get warned at 80% and alerted at 100% of monthly budget. Calculated with MongoDB aggregation — always accurate.' },
              { icon: '📄', title: 'CSV & PDF export',    delay: 0.25, desc: 'Admins export filtered expense reports by month. PDF generated server-side with pdf-lib — pure Node.js.' },
            ].map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section id="how" style={{
          padding: '80px 5%',
          background: 'var(--ink-2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="reveal" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--violet-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              How it works
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, letterSpacing: '-1px', color: '#fff', marginBottom: '0' }}>
              Up and running in minutes
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0', marginTop: '56px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '28px', left: '10%', right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--border), var(--border), transparent)',
            }} />
            {[
              { num: '1', title: 'Create workspace',  delay: 0,    desc: 'Sign up, name your org, set a monthly budget. You become admin automatically.' },
              { num: '2', title: 'Invite your team',  delay: 0.1,  desc: 'Send invite links by email. Members join with their assigned role instantly.' },
              { num: '3', title: 'Submit expenses',   delay: 0.2,  desc: 'Members log expenses with receipts. Each submission lands in the approval queue.' },
              { num: '4', title: 'Approve & export',  delay: 0.3,  desc: 'Review, approve or reject with a note. Export the month as CSV or PDF anytime.' },
            ].map(s => <StepItem key={s.num} {...s} />)}
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────── */}
        <section id="pricing" style={{ padding: '80px 5%' }}>
          <div className="reveal">
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--violet-l)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Pricing
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, letterSpacing: '-1px', color: '#fff', maxWidth: '560px', marginBottom: '16px' }}>
              Simple, honest pricing
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '480px', lineHeight: 1.7, fontWeight: 300 }}>
              No hidden fees. No per-seat surprises. Cancel any time.
            </p>
          </div>

          <div className="reveal" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px', marginTop: '56px', maxWidth: '900px',
          }}>
            <PricingCard
              plan="Starter" price="₹0" period="Free forever"
              features={['1 workspace', 'Up to 3 members', '50 expenses/month', 'CSV export', 'Receipt uploads (500MB)']}
              cta="Get started free" ctaHref="/register"
            />
            <PricingCard
              plan="Pro" price="₹499" period="per month"
              features={['Unlimited workspaces', 'Unlimited members', 'Unlimited expenses', 'PDF + CSV export', 'Budget alerts', 'Priority support']}
              cta="Start 14-day trial →" ctaHref="/register"
              featured
            />
            <PricingCard
              plan="Enterprise" price="Custom" period="talk to us"
              features={['Everything in Pro', 'SSO / SAML', 'Custom roles', 'Audit logs', 'Dedicated support']}
              cta="Contact sales" ctaHref="mailto:hi@spendly.app"
            />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section style={{
          textAlign: 'center', padding: '80px 5% 100px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(108,92,231,0.1), transparent 70%)',
          }} />
          <div className="reveal">
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.05, letterSpacing: '-1.5px',
              color: '#fff', marginBottom: '20px',
            }}>
              Your team deserves<br />better than spreadsheets
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '40px', fontWeight: 300 }}>
              Join teams who&apos;ve moved their entire expense workflow to Spendly.
            </p>
            <BtnPrimary href="/register" size="xl">Create free workspace →</BtnPrimary>
          </div>
        </section>

      </main>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridShift {
          from { background-position: 0 0; }
          to   { background-position: 60px 60px; }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
