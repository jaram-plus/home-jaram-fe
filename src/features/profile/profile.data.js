/**
 * 프로필 페이지 표시 문자열 — 필드 라벨, 안내 문구, 메시지, 토스트.
 * 한국어·존댓말. 라틴 아이라벨은 ALL-CAPS.
 */
export const EYEBROW = 'PROFILE';

// 액션 버튼 라벨
export const ACTIONS = { edit: '수정', logout: '로그아웃' };

// authority 코드 → 한글 라벨
export const AUTHORITY_LABELS = { MEMBER: '회원', OFFICER: '임원', ADMIN: '관리자' };

// 읽기 전용 필드 라벨(표시 순서대로) — gen은 헤더 부제목으로만 표시.
// department·title은 운영진이 부여하는 값으로 본인 수정 불가, 읽기로만 노출.
export const READONLY_LABELS = [
  ['email', '이메일'],
  ['studentId', '학번'],
  ['authority', '권한'],
  ['department', '부서'],
  ['title', '직책'],
];

// 수정 가능 필드 라벨
export const LABELS = {
  bio: '자기소개',
  githubUrl: 'GitHub',
  blogUrl: '블로그',
};

export const PLACEHOLDERS = {
  bio: '간단한 자기소개를 적어 주세요.',
  githubUrl: 'https://github.com/username',
  blogUrl: 'https://your.blog',
};

export const MESSAGES = {
  loading: '프로필을 불러오는 중입니다.',
  loadError: '프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  saveError: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  empty: '아직 입력하지 않았습니다.',
};

export const TOAST = { saved: '프로필을 저장했습니다.' };
