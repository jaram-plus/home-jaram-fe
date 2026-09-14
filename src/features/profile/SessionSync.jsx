import { useEffect } from 'react';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useMe } from './profile.queries';

/**
 * localStorage 에 저장해 둔 user 를 GET /api/me 로 덮어쓴다.
 *
 * 세션은 로그인할 때 받은 user 를 그대로 두고 다시 읽지 않았다. 권한 판정이
 * authority 에서 permissions 로 옮겨 가면서 그 낡음이 문제가 된다 — 이미 로그인해
 * 둔 임원의 저장분에는 permissions 가 아예 없어서, 다시 로그인하기 전까지 콘솔에서
 * 튕겨난다. 임기가 바뀌거나 개명한 경우도 같은 이유로 어긋나 있었다.
 *
 * /api/me 는 로그인한 사용자라면 ReregisterNotice 가 이미 부르고 있고 react-query 가
 * 같은 키(['me'])로 합치므로, 이 컴포넌트 때문에 요청이 늘지는 않는다.
 */
export function SessionSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return null;
  return <Sync />;
}

function Sync() {
  const { data: me } = useMe();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!me) return;
    // store 의 user 는 로그인 응답(UserSummary)의 모양이다. /api/me 가 더 많은 것을
    // 주지만 그 모양을 유지한다 — 세션이 알아야 할 것만 담는다.
    setUser({
      id: me.id,
      name: me.name,
      email: me.email,
      roles: me.roles,
      permissions: me.permissions,
    });
  }, [me, setUser]);

  return null;
}

export default SessionSync;
