import React from 'react';

/**
 * JARAM Card — a paper surface for grouped content.
 * `interactive` adds a hover lift.
 *
 * 상단 빨강 룰(`accent="top"`)은 없앴다 — 카드·모달에 빨간 강조 줄을 두지 않는다.
 * 구분은 테두리 한 줄과 여백·타이포 위계가 맡는다.
 */
export function Card({ children, interactive = false, padding = 'lg', style, ...rest }) {
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
