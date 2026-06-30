/**
 * Member 부서·직책 enum — 백엔드 com.jaram.be.member.MemberDepartment /
 * MemberTitle 와 1:1 미러. 와이어에는 enum name(키)이 오고, 화면 표시는
 * 여기 한글 라벨로 매핑한다. FE 전역에서 부서/직책을 다루는 단일 소스.
 */

// 부서 키 → 한글 라벨 (표시·선택 순서 유지)
export const DEPARTMENT_LABELS = {
  LEADERSHIP: '회장단',
  ACADEMIC: '학술부',
  PR: '홍보부',
  FINANCE: '회계부',
  INFRA: '인프라',
};

// 직책 키 → 한글 라벨 (표시·선택 순서 유지)
export const TITLE_LABELS = {
  PRESIDENT: '회장',
  VICE_PRESIDENT: '부회장',
  ACADEMIC_LEAD: '학술부장',
  ACADEMIC_MEMBER: '학술부원',
  PR_LEAD: '홍보부장',
  PR_MEMBER: '홍보부원',
  FINANCE_LEAD: '회계부장',
  FINANCE_MEMBER: '회계부원',
  SERVER_ADMIN: '서버 관리자',
  OB: 'OB',
  REGULAR: '정회원',
  ASSOCIATE: '준회원',
  NEWCOMER: '신입부원',
};

// 키 배열 — 셀렉터 옵션 등에 사용
export const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS);
export const TITLES = Object.keys(TITLE_LABELS);

/** 부서 키 → 한글 라벨. 모르는/빈 키는 null. */
export function departmentLabel(key) {
  return key ? DEPARTMENT_LABELS[key] ?? null : null;
}

/** 직책 키 → 한글 라벨. 모르는/빈 키는 null. */
export function titleLabel(key) {
  return key ? TITLE_LABELS[key] ?? null : null;
}
