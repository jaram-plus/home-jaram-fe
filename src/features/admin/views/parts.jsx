import React from 'react';

/**
 * Small presentational primitives for the admin page. All styling references
 * design-system tokens; no hardcoded hex.
 */

/** Section eyebrow / Latin label above a page title. */
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

/** Centered empty state with a seal glyph. */
export function EmptyState({ children }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-faint)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--surface-tonal)', lineHeight: 1 }}>空</div>
      <p style={{ margin: '16px 0 0', fontSize: 'var(--fs-body)' }}>{children}</p>
    </div>
  );
}
