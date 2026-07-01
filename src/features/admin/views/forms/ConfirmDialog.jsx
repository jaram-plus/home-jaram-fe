import React from 'react';

/**
 * 삭제·이탈 확인 다이얼로그. tone='danger' 면 확인 버튼이 레드.
 * 백드롭 클릭/취소로 닫힙니다.
 */
export function ConfirmDialog({ title, message, confirmLabel = '확인', cancelLabel = '취소', tone = 'default', onConfirm, onCancel }) {
  const confirmStyle = tone === 'danger'
    ? { background: 'var(--brand)', color: '#fff', border: '1px solid transparent', boxShadow: 'var(--shadow-brand)' }
    : { background: 'var(--brand)', color: '#fff', border: '1px solid transparent' };
  return (
    <div
      className="adm-anim-fade"
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 'var(--radius-lg, 14px)', boxShadow: 'var(--shadow-lg)', padding: 28 }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22, color: 'var(--text-strong)' }}>{title}</h3>
        {message && <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{message}</p>}
        <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '10px 18px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--text-body)', background: 'transparent', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer' }}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} style={{ padding: '10px 18px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, borderRadius: 8, cursor: 'pointer', ...confirmStyle }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
