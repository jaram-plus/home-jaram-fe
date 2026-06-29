import React from 'react';

/**
 * Small presentational primitives shared across the people views.
 * All styling references design-system tokens; no hardcoded hex.
 */

/** Section eyebrow / Latin label above the page title. */
export function Eyebrow({ children }) {
  return (
    <p
      style={{
        margin: '0 0 14px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--w-semibold)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: 'var(--brand)',
      }}
    >
      {children}
    </p>
  );
}

/** Underline tab in the page nav (임원 / 기여자 / 졸업자). */
export function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none',
        background: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        fontWeight: 'var(--w-semibold)',
        padding: '13px 18px',
        marginBottom: -1,
        border: 'none',
        color: active ? 'var(--brand)' : 'var(--text-muted)',
        borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
      }}
    >
      {children}
    </button>
  );
}

/** Department group heading: red tick + serif title + trailing hairline. */
export function GroupHeading({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <span style={{ width: 6, height: 22, background: 'var(--brand)', borderRadius: 2, flex: 'none' }} />
      <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 700, color: 'var(--text-strong)' }}>
        {children}
      </h2>
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

/** Icon-only social link (GitHub / blog). `kind` picks the glyph. */
export function SocialLink({ kind, href = '#', label }) {
  return (
    <a href={href} className="jr-soc" aria-label={label}>
      {kind === 'github' ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )}
    </a>
  );
}

/** Centered empty state with a seal glyph. */
export function EmptyState({ children }) {
  return (
    <div style={{ textAlign: 'center', padding: '90px 20px', color: 'var(--text-faint)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, color: 'var(--surface-tonal)', lineHeight: 1 }}>空</div>
      <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-body)' }}>{children}</p>
    </div>
  );
}
