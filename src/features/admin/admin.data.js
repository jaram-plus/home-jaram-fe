/**
 * Admin page copy — pure data, no JSX. Pending members come from the backend
 * (GET /api/admin/members/pending); only static copy lives here.
 */

export const MESSAGES = {
  reasonRequired: '거절 사유를 입력해 주세요.',
};

// Transient toast strings. `approved` takes the member name.
export const TOAST = {
  approved: (name) => `${name} 님의 가입을 승인했습니다.`,
  rejected: '가입을 거절했습니다.',
};

export const EMPTY = '승인 대기 중인 회원이 없습니다.';
