import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/auth.store';
import { isAdmin } from '@/shared/auth/roles';

/**
 * /admin 역할 가드 (기획.md §9). 임원진/운영진만 진입.
 *
 * 미인증 → /login?redirect=… , 권한 부족 → /403.
 * 서버 middleware/route-guard 와 이중 가드 개념이며, 클라이언트 가드는 UX 용입니다.
 * 실제 권한은 API 가 재확인합니다.
 *
 * 역할 판정은 `shared/auth/roles` 한 곳에서만 합니다. 프로필의 콘솔 진입
 * 버튼도 같은 함수를 씁니다.
 */

export function RequireAdmin({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (!isAdmin(user)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

export default RequireAdmin;
