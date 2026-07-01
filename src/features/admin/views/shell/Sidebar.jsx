import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/auth.store';
import { NavItem } from './NavItem';
import { useDashboardStats } from '../../admin.queries';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const I = (d) => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>{d}</svg>
);

const NAV = [
  { to: 'dashboard', label: '대시보드', icon: I(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>) },
  { to: 'members', label: '인원 관리', icon: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>) },
  { to: 'seminars', label: '세미나 관리', icon: I(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>) },
  { to: 'studies', label: '스터디 관리', icon: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>) },
  { to: 'applications', label: '가입 신청·승인', badgeKey: 'pendingApplications', icon: I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>) },
  { to: 'settings', label: '설정', icon: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>) },
];

/**
 * 관리자 사이드바 — JR 마크 + ADMIN 라벨, 네비(활성/대기 배지), 하단 운영진 칩.
 * 활성 표시는 현재 경로 기준. 대기 건수 배지는 대시보드 통계에서 가져옵니다.
 */
export function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const isActive = (to) => pathname === `/admin/${to}` || pathname.startsWith(`/admin/${to}`);

  const logout = () => {
    clear();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 248, flexShrink: 0, background: 'var(--surface-card)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        padding: '22px 14px 16px',
      }}
    >
      <div style={{ padding: '0 8px 18px' }}>
        <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>ADMIN</p>
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>관리자 콘솔</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map((n) => (
          <NavItem
            key={n.to}
            to={n.to}
            label={n.label}
            icon={n.icon}
            active={isActive(n.to)}
            badge={n.badgeKey ? stats?.[n.badgeKey] : 0}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-soft, var(--border))', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-deep)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'var(--w-bold)', fontFamily: 'var(--font-serif)', flexShrink: 0 }}>
          {(user?.name || '운').slice(0, 1)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>{user?.name || '운영진'}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>{user?.roleLabel || '운영진'}</p>
        </div>
        <button type="button" onClick={logout} aria-label="로그아웃" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'inline-flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </div>
    </aside>
  );
}
