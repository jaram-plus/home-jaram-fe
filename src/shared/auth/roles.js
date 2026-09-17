/**
 * 권한 판정의 단일 소스. /admin 가드(RequireAdmin)와 프로필의 콘솔 진입 버튼이
 * 같은 규칙을 보게 해서, 버튼은 보이는데 들어가면 403 이 뜨는 어긋남을 막습니다.
 *
 * 판정 필드는 서버가 현직 임기에서 전개해 주는 `permissions` 입니다. 하나라도
 * 있으면 콘솔에서 할 일이 있다는 뜻입니다. 예전에는 `authority` 를 봤지만 그 값이
 * 말해 주는 것은 '임기가 있는가' 뿐이라, 직책마다 권한이 갈린 뒤로는 홍보부원처럼
 * 좁은 직책을 회장과 구분하지 못합니다. 클라이언트 판정은 UX 용이며 실제 권한은
 * API 가 재확인합니다.
 */

/** 관리자 콘솔에 들어갈 수 있는가. user 는 auth store 의 user. */
export function isAdmin(user) {
  return Boolean(user?.permissions?.length);
}
