import React from 'react';

/** Bottom-center pill toast. message 비면 아무것도 렌더하지 않음. */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="jr-toast"
      role="status"
      style={{
        position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface-ink)', color: 'var(--text-on-ink)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)',
        padding: '13px 22px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-lg)',
        animation: 'jrToastIn 0.24s cubic-bezier(0.2, 0.7, 0.2, 1)',
      }}
    >
      <span style={{ flex: 'none', width: 7, height: 7, borderRadius: '50%', background: 'var(--red-300)', display: 'inline-block' }} />
      {message}
    </div>
  );
}
