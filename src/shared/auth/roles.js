/**
 * 권한 판정의 단일 소스. /admin 가드(RequireAdmin)와 프로필의 콘솔 진입 버튼이
 * 같은 규칙을 보게 해서, 버튼은 보이는데 들어가면 403 이 뜨는 어긋남을 막습니다.
 *
 * 판정 필드는 레포 컨벤션인 `authority` 입니다. 클라이언트 판정은 UX 용이며,
 * 실제 권한은 API 가 재확인합니다.
 */
export const ADMIN_ROLES = ['OFFICER', 'ADMIN'];

/** 임원진·운영진인가. user 는 auth store 의 user 또는 GET /api/me 응답. */
export function isAdmin(user) {
  if (!user) return false;
  return ADMIN_ROLES.includes(user.authority);
}
