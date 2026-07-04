import React from 'react';

/**
 * Small presentational primitives shared across the login views.
 * All styling references design-system tokens; no hardcoded hex.
 */

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

/**
 * Segmented toggle — labelled row of mutually-exclusive pills, styled to match
 * the Input field (sunken track, brand-filled selection). `options` is
 * `[{ value, label }]`; `value` may be any primitive (string or boolean).
 */
export function Segmented({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-body)' }}>
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--surface-sunken)',
          border: '1.5px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--w-semibold)',
                color: active ? '#fff' : 'var(--text-muted)',
                background: active ? 'var(--brand)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'background var(--dur) var(--ease-out), color var(--dur) var(--ease-out)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Chips — single-select group of content-width pills that wrap. Used where the
 * option labels are too long for an equal-width Segmented. `options` is an array
 * of strings (the value is the label). Selection is brand-filled.
 */
export function Chips({ label, value, onChange, options, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-body)' }}>
          {label}
        </span>
      )}
      <div role="radiogroup" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt)}
              style={{
                padding: '9px 16px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--w-semibold)',
                color: active ? '#fff' : 'var(--text-body)',
                background: active ? 'var(--brand)' : 'var(--surface-raised)',
                border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background var(--dur) var(--ease-out), color var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--brand)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Read-only field — a labelled value the user can't edit (e.g. an auto-computed
 * 기수). Mirrors the Input layout but renders a sunken, muted box.
 */
export function ReadonlyField({ label, hint, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-body)' }}>
          {label}
        </span>
      )}
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-body)',
          color: 'var(--text-strong)',
          background: 'var(--surface-sunken)',
          border: '1.5px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '11px 14px',
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
      {hint && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
          {hint}
        </span>
      )}
    </div>
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
