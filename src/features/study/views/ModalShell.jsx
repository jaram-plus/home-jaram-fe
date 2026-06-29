import React from 'react';

/**
 * Shared modal chrome — fixed backdrop + centered pop card with a serif
 * heading, optional lead, and a close button. `align` is 'center' for short
 * dialogs (apply) and 'top' for tall scrolling forms (create).
 */
export function ModalShell({ title, lead, onClose, maxWidth = 480, align = 'center', children }) {
  const top = align === 'top';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(28,24,19,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: top ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: top ? '5vh 24px' : 24,
        overflow: top ? 'auto' : undefined,
        animation: 'jrFade 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="jr-pop"
        style={{
          width: '100%',
          maxWidth,
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderTop: '3px solid var(--brand)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 32,
          animation: 'jrPop 0.24s cubic-bezier(0.2, 0.7, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 28, color: 'var(--text-strong)' }}>
              {title}
            </h3>
            {lead && (
              <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
                {lead}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
