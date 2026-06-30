/**
 * Login page copy — pure data, no JSX.
 *
 * Field-level validation messages, server-error copy, and toast strings.
 * Keep all user-facing text here so it is easy to review and localize.
 */

// Client-side field validation messages.
export const MESSAGES = {
  emailRequired: '이메일을 입력해 주세요.',
  emailFormat: '올바른 이메일 형식이 아닙니다.',
  emailHanyang: '한양대 이메일(@hanyang.ac.kr)만 사용할 수 있습니다.',
  emailTaken: '이미 가입 신청된 이메일입니다.',
  pwRequired: '비밀번호를 입력해 주세요.',
  pwRule: '비밀번호는 8자 이상이며 영문·숫자·특수문자를 포함해야 합니다.',
  pwMismatch: '비밀번호가 일치하지 않습니다.',
  nameRequired: '이름을 입력해 주세요.',
  sidRequired: '학번을 정확히 입력해 주세요.',
  genRequired: '기수를 입력해 주세요. (예: 41)',
  facultyRequired: '학부를 선택해 주세요.',
  facultyEtcRequired: '학부를 입력해 주세요.',
  phoneRequired: '전화번호를 입력해 주세요.',
  phoneFormat: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)',
};

// 2단계(추가 정보) 폼의 선택지. value는 와이어로 보내는 값, label은 화면 표시.
export const STUDENT_TYPES = [
  { value: 'new', label: '신입생' },
  { value: 'current', label: '재학생' },
];

// 신입생 기수 — 가입 신청 연도 기준 자동 산출(현재 년도 - 창립연도). 예: 2026 → 42.
export { currentGen as newcomerGen } from '@/shared/club/founding';

// 재학여부 토글 — boolean 그대로 전송.
export const ENROLLMENT = [
  { value: true, label: '재학' },
  { value: false, label: '휴학' },
];

// 학부 선택지. '기타' 선택 시 직접 입력 칸이 열린다.
export const FACULTY_ETC = '기타';
export const FACULTIES = ['컴퓨터학부', '인공지능학과', 'ICT융합학부', FACULTY_ETC];

// Server-side login failures → user-facing copy.
// `api.login` rejects with an Error whose `.code` is one of these keys.
export const LOGIN_ERROR = {
  NOT_FOUND: '등록된 회원 정보가 없습니다. 가입 신청 내역을 확인해 주세요.',
  PENDING: '가입 승인을 기다리는 중입니다. 승인 완료 후 로그인할 수 있습니다.',
  INVALID: '이메일 또는 비밀번호가 일치하지 않습니다.',
  SERVER: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

// 가입 신청 폼 레벨 실패 → 사용자 카피.
export const SIGNUP_ERROR = {
  SERVER: '가입 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

// Transient toast messages.
export const TOAST = {
  login: '로그인되었습니다.',
  logout: '로그아웃되었습니다.',
  expired: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
};
