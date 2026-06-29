import React from 'react';

/** ALL-CAPS 아이라벨(빨강). 카드 좌상단 PROFILE 표시용. */
export function Eyebrow({ children }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--w-bold)', letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase', color: 'var(--brand)',
      }}
    >
      {children}
    </span>
  );
}

/** 헤어라인으로 구분된 라벨(좌)+값(우) 행. */
export function FieldRow({ label, children }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 'var(--space-4)', padding: 'var(--space-4) 0',
        borderTop: '1px solid var(--line)',
      }}
    >
      <span style={{ flex: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', wordBreak: 'break-word' }}>
        {children}
      </span>
    </div>
  );
}
