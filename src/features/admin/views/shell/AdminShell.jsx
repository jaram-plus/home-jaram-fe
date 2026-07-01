import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// 레포 공통 헤더 (본 작업 범위 밖 · 기획.md §0). export 형태가 default 면 `import Header ...` 로 이 줄만 맞추세요.
import { Header } from '@/shared/ui/Header';
import { Sidebar } from './Sidebar';
import { Toast } from '../Toast';
import { ConfirmDialog } from '../forms/ConfirmDialog';
import { useAdminStore, dirtyCount } from '../../admin.store';
import { MESSAGES } from '../../admin.data';

/** /admin/<seg> (+ ?tab=) → 현재 리소스 키. 이탈 가드·라벨에 사용. */
export function currentResource(pathname, tab) {
  const seg = pathname.split('/').filter(Boolean)[1] || 'dashboard'; // ['admin', <seg>]
  if (seg === 'members') return tab || 'member';
  return seg; // dashboard | seminars | studies | applications | settings
}

/**
 * 관리자 셸 — 공통 헤더 슬롯 + 좌측 사이드바 + 우측 콘텐츠(<Outlet/>).
 * 레이아웃 라우트라 화면 전환 시 사이드바/헤더는 유지되고 main 만 교체됩니다.
 * 미저장 변경 이탈 가드(사이드바 이동·새로고침)를 함께 담당합니다 (기획.md §8-7).
 */
export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const byResource = useAdminStore((s) => s.byResource);
  const toast = useAdminStore((s) => s.toast);
  const reset = useAdminStore((s) => s.reset);

  const resource = currentResource(location.pathname, sp.get('tab'));
  const currentDirty = dirtyCount(byResource[resource]);
  const anyDirty = Object.values(byResource).some((sl) => dirtyCount(sl) > 0);

  const [pendingNav, setPendingNav] = useState(null);

  // 새로고침·탭 닫기 가드. (데이터 라우터로 올리면 useBlocker 로 대체 가능)
  useEffect(() => {
    if (!anyDirty) return undefined;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [anyDirty]);

  const requestNav = useCallback((to) => {
    const path = to.startsWith('/') ? to : `/admin/${to}`;
    if (currentDirty > 0) setPendingNav(path);
    else navigate(path);
  }, [currentDirty, navigate]);

  const confirmLeave = () => {
    reset(resource);
    const to = pendingNav;
    setPendingNav(null);
    if (to) navigate(to);
  };

  return (
    <div
      className="admin-root"
      style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        background: 'var(--surface-page)', color: 'var(--text-body)',
        fontFamily: 'var(--font-sans)', overflow: 'hidden',
      }}
    >
      {/* 기존 공통 헤더가 여기 들어갑니다 (셸 슬롯). */}
      <Header />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar onNavigate={requestNav} />
        <main className="adm-scroll" style={{ flex: 1, minWidth: 0, overflow: 'auto', position: 'relative' }}>
          <div style={{ padding: '34px 40px 120px', maxWidth: 1180, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <Toast message={toast} />

      {pendingNav && (
        <ConfirmDialog
          title="저장하지 않은 변경이 있어요"
          message={MESSAGES.leaveGuard}
          confirmLabel="나가기"
          cancelLabel="계속 편집"
          tone="danger"
          onConfirm={confirmLeave}
          onCancel={() => setPendingNav(null)}
        />
      )}
    </div>
  );
}
