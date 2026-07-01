import React from 'react';

/**
 * 사이드바 네비 항목 하나. 활성 시 좌측 3px 버밀리언 바 + brand-tint 배경 + brand 텍스트.
 * 아이콘은 Heroicons 아웃라인(stroke-2) 규격. 링크가 아니라 가드된 onNavigate 를 호출합니다.
 */
export function NavItem({ icon, label, to, active, badge, onNavigate }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => onNavigate(to)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '11px 12px 11px 18px',
        border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)',
        textAlign: 'left',
        background: active ? 'var(--brand-tint)' : hover ? 'var(--surface-sunken)' : 'transparent',
        color: active ? 'var(--brand-deep)' : 'var(--text-body)',
        transition: 'background 140ms, color 140ms',
      }}
    >
      {active && (
        <span style={{ position: 'absolute', left: 5, top: 10, bottom: 10, width: 3, borderRadius: 3, background: 'var(--brand)' }} />
      )}
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
      {badge > 0 && (
        <span
          style={{
            marginLeft: 'auto', background: 'var(--brand)', color: '#fff',
            fontSize: 11, fontWeight: 'var(--w-bold)', minWidth: 20, height: 20,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 999, padding: '0 6px',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
