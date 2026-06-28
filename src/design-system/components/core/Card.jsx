import React from 'react';

/**
 * JARAM Card — a paper surface for grouped content.
 * `interactive` adds a hover lift; `accent="top"` draws a red rule across the head.
 */
export function Card({ children, interactive = false, accent = 'none', padding = 'lg', style, ...rest }) {
  const pads = { sm: '16px', md: '24px', lg: '32px' };
  const base = {
    position: 'relative',
    background: 'var(--surface-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    padding: pads[padding],
    transition: 'transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
    overflow: 'hidden',
    ...style,
  };
  if (accent === 'top') {
    base.borderTop = '3px solid var(--brand)';
  }
  const handlers = interactive ? {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    },
  } : {};
  return (
    <div style={base} {...handlers} {...rest}>
      {children}
    </div>
  );
}
