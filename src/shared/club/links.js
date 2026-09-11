/**
 * 학회 외부 채널 — 푸터(Connect 열)와 관리자 '설정' 탭이 같은 목록을 봐야 해서
 * 여기 한 곳에 둔다. 주소 자체는 서버가 갖고 있고(관리자 '설정' 탭에서 수정),
 * 이 파일은 어떤 채널이 있고 뭐라고 부르는지만 정한다.
 *
 * `always`인 채널은 주소가 비어 있어도 푸터에서 자리를 지킨다 — 학회의 공식
 * 창구라 목록에서 사라지면 "그런 채널이 없다"로 읽히기 때문이다. 나머지는 값이
 * 있을 때만 나온다.
 */
export const SITE_LINKS = [
  { key: 'github', label: 'GitHub' },
  { key: 'instagram', label: 'Instagram', always: true },
  { key: 'blog', label: '블로그' },
  { key: 'discord', label: 'Discord', always: true },
];

/** 주소가 하나도 없는 초기값 — 폼 시딩과 폴백에 쓴다. */
export const EMPTY_SITE_LINKS = Object.fromEntries(SITE_LINKS.map((l) => [l.key, '']));
