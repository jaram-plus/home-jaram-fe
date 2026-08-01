/**
 * 프로필 페이지 표시 문자열 — 필드 라벨, 안내 문구, 메시지, 토스트.
 * 한국어·존댓말. 라틴 아이라벨은 ALL-CAPS.
 */
export const EYEBROW = 'PROFILE';

// 액션 버튼 라벨
export const ACTIONS = { edit: '수정', logout: '로그아웃' };

// authority 코드 → 한글 라벨
export const AUTHORITY_LABELS = { MEMBER: '회원', OFFICER: '임원', ADMIN: '관리자' };

// 카드 본문 그룹 아이라벨(ALL-CAPS) — 시스템/운영진이 부여하는 '계정' 정보,
// 임기 이력, 본인이 직접 쓰는 '소개'를 구분한다.
export const GROUPS = { account: 'ACCOUNT', terms: 'TERMS', profile: 'ABOUT' };

// 읽기 전용 필드 라벨(표시 순서대로) — gen은 헤더 부제목으로만 표시.
// department·title은 운영진이 부여하는 값으로 본인 수정 불가, 읽기로만 노출.
// faculty는 가입 때 받아 고정하는 값이라 여기서 읽기로만 보여 준다(MeUpdateRequest에 없음).
export const READONLY_LABELS = [
  ['email', '이메일'],
  ['studentId', '학번'],
  ['authority', '권한'],
  ['faculty', '학부'],
  ['department', '부서'],
  ['title', '직책'],
];

// 수정 가능 필드 라벨
export const LABELS = {
  phone: '연락처',
  bio: '자기소개',
  githubUrl: 'GitHub',
  blogUrl: '블로그',
};

export const PLACEHOLDERS = {
  phone: '010-1234-5678',
  bio: '간단한 자기소개를 적어 주세요.',
  githubUrl: 'https://github.com/username',
  blogUrl: 'https://your.blog',
};

// 임기 이력이 없을 때
export const TERMS_EMPTY = '맡은 임기가 없습니다.';

// 임기 한 건의 기간 표기 — 종료 기수가 없으면 현직.
export const termPeriod = (t) => (t.endGen == null ? `${t.startGen}기 –` : `${t.startGen}기 – ${t.endGen}기`);

export const MESSAGES = {
  loading: '프로필을 불러오는 중입니다.',
  loadError: '프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  saveError: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  empty: '아직 입력하지 않았습니다.',
  phoneRequired: '연락처를 입력해 주세요.',
};

export const TOAST = { saved: '프로필을 저장했습니다.' };
