import React from 'react';

/**
 * Small presentational primitives shared across the login views.
 * All styling references design-system tokens; no hardcoded hex.
 */

export const blockBtn = { width: '100%', justifyContent: 'center' };

export function Eyebrow({ children }) {
  return (
    <p
      style={{
        margin: '0 0 12px',
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

export function Title({ size = 36, lh = 1.1, children }) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: 'var(--font-serif)',
        fontWeight: 400,
        fontSize: size,
        color: 'var(--text-strong)',
        lineHeight: lh,
      }}
    >
      {children}
    </h1>
  );
}

export function Lead({ children }) {
  return (
    <p
      style={{
        margin: '12px 0 0',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--text-muted)',
        lineHeight: 'var(--lh-normal)',
      }}
    >
      {children}
    </p>
  );
}

/** Centered lead used on the icon-badge confirmation views. */
export function CenterText({ children }) {
  return (
    <p
      style={{
        margin: '18px auto 0',
        maxWidth: 340,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--text-muted)',
        lineHeight: 'var(--lh-normal)',
      }}
    >
      {children}
    </p>
  );
}

/** Inline form-level error banner (e.g. failed login). */
export function FormError({ message }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        background: 'var(--brand-tint)',
        border: '1px solid var(--red-100)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--brand)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        !
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-sm)',
          color: 'var(--red-600)',
          lineHeight: 'var(--lh-normal)',
        }}
      >
        {message}
      </span>
    </div>
  );
}

/** Round icon badge above confirmation headings. */
export function IconBadge({ tone = 'brand', children }) {
  const tones = {
    brand: { background: 'var(--brand-tint)', border: '1px solid var(--red-100)' },
    muted: { background: 'var(--surface-sunken)', border: '1px solid var(--border)' },
  };
  return (
    <div
      style={{
        width: 64,
        height: 64,
        margin: '0 auto 22px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...tones[tone],
      }}
    >
      {children}
    </div>
  );
}

export const CheckIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

export const AlertIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
