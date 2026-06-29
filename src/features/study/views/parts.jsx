import React from 'react';

/**
 * Small presentational primitives shared across the study views.
 * All styling references design-system tokens; no hardcoded hex.
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

/** Underline tab in the page sub-nav (스터디 / 내 활동 / 관리). */
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
        padding: '12px 16px',
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

/** Pill toggle used for filter chips and the manage sub-nav. */
export function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 'var(--w-semibold)',
        padding: '7px 16px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--brand)' : 'var(--surface-card)',
        color: active ? '#fff' : 'var(--text-muted)',
        border: active ? '1px solid var(--brand)' : '1px solid var(--border-strong)',
      }}
    >
      {children}
    </button>
  );
}

/** Small field/category tag (Frontend, React, CS …). */
export function FieldChip({ children }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 'var(--w-semibold)',
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-sunken)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </span>
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

/** Definition-list row helper — renders [dt, dd] pairs in a 2-col grid. */
export function DefList({ rows }) {
  return (
    <dl
      style={{
        margin: '18px 0 0',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '9px 14px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
      }}
    >
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt style={{ color: 'var(--text-faint)' }}>{label}</dt>
          <dd style={{ margin: 0, color: 'var(--text-body)' }}>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
