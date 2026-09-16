import React from 'react';

/**
 * 켜고 끄는 스위치. 누르는 즉시 뜻이 바뀌는 설정 하나를 나타냅니다.
 * (설정의 신학기 자동 승급, 스터디 관리의 개설 신청 창)
 */
export function Toggle({ on, onClick, disabled = false, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      aria-label={label}
      style={{ width: 46, height: 26, borderRadius: 999, background: on ? 'var(--brand)' : 'var(--border-strong)', position: 'relative', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1, transition: 'background 200ms', border: 'none', flexShrink: 0, padding: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}
