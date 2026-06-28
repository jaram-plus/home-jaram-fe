import React from 'react';

/**
 * Section eyebrow — the recurring "hairline rule + uppercase latin label"
 * that opens most landing sections. Latin label only, lowercase→uppercased
 * via CSS (brand voice: no emoji, Latin used as small all-caps labels).
 */
export function Eyebrow({ children, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...style }}>
      <span style={{ height: 1, width: 40, background: 'var(--brand)' }} />
      <span
        style={{
          fontSize: 13,
          fontWeight: 'var(--w-semibold)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--brand)',
        }}
      >
        {children}
      </span>
    </div>
  );
}
