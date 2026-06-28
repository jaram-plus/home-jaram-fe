import React from 'react';

/**
 * JARAM Tag — a small label for categories, statuses, and metadata.
 * Three tones over warm paper; `seal` evokes the traditional vermilion stamp.
 */
export function Tag({ children, tone = 'neutral', size = 'md', style, ...rest }) {
  const tones = {
    neutral: { background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    brand: { background: 'var(--brand-tint)', color: 'var(--red-600)', border: '1px solid var(--red-100)' },
    seal: { background: 'var(--brand-deep)', color: '#fff', border: '1px solid var(--brand-deep)' },
    outline: { background: 'transparent', color: 'var(--text-body)', border: '1px solid var(--border-strong)' },
  };
  const sizes = {
    sm: { fontSize: '11px', padding: '3px 8px' },
    md: { fontSize: 'var(--fs-xs)', padding: '4px 10px' },
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--w-semibold)',
        letterSpacing: '0.02em',
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
