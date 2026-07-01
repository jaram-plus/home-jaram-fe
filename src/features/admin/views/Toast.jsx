import React from 'react';

/**
 * 저장 성공·승인 등 전역 토스트. 메시지는 admin 스토어(showToast)에서 옵니다.
 */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="adm-anim-toast"
      style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink-900)', color: 'var(--paper-100)', fontSize: 14, fontWeight: 600, padding: '13px 22px', borderRadius: 10, boxShadow: 'var(--shadow-lg)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--red-300)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      {message}
    </div>
  );
}
