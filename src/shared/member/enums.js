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

// 부서와 무관하게 라벨이 고정된 직책
export const ABSOLUTE_TITLE_LABELS = {
  PRESIDENT: '회장',
  VICE_PRESIDENT: '부회장',
  SERVER_ADMIN: '서버 관리자',
};

// 부서 라벨에 붙여 라벨을 만드는 직위 (학술부 + 장 → 학술부장)
export const TITLE_SUFFIX = {
  LEAD: '장',
  STAFF: '원',
};

// 부서마다 허용되는 직책 (백엔드 MemberTitle.allowedIn 과 동일 규칙)
export const TITLES_BY_DEPARTMENT = {
  LEADERSHIP: ['PRESIDENT', 'VICE_PRESIDENT'],
  ACADEMIC: ['LEAD', 'STAFF'],
  PR: ['LEAD', 'STAFF'],
  FINANCE: ['LEAD', 'STAFF'],
  INFRA: ['SERVER_ADMIN'],
};

// 키 배열 — 셀렉터 옵션 등에 사용 (표시·선택 순서 유지)
export const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS);
export const TITLES = ['PRESIDENT', 'VICE_PRESIDENT', 'LEAD', 'STAFF', 'SERVER_ADMIN'];

/** 부서 키 → 한글 라벨. 모르는/빈 키는 null. */
export function departmentLabel(key) {
  return key ? DEPARTMENT_LABELS[key] ?? null : null;
}

/** 한글 라벨 → 부서 키. 모르는/빈 라벨은 null. */
export function departmentKey(label) {
  return DEPARTMENTS.find((k) => DEPARTMENT_LABELS[k] === label) ?? null;
}

/**
 * 직책 키 + 부서 키 → 한글 라벨. 모르는/빈 키는 null.
 * LEAD/STAFF는 부서 라벨에 접미사를 붙여 파생한다 (백엔드 MemberTitle.label과 동일 규칙).
 */
export function titleLabel(title, department) {
  if (!title) return null;
  if (ABSOLUTE_TITLE_LABELS[title]) return ABSOLUTE_TITLE_LABELS[title];
  const suffix = TITLE_SUFFIX[title];
  if (!suffix) return null;
  return (departmentLabel(department) ?? '부') + suffix;
}

/**
 * 한글 직책 라벨 → 직책 키. 허용 조합의 라벨은 전부 유일해서(회장·부회장·서버 관리자·
 * 학술부장·학술부원…) 부서 없이도 역인덱스가 성립한다. 모르는/빈 라벨은 null.
 */
export function titleKey(label) {
  if (!label) return null;
  for (const [department, titles] of Object.entries(TITLES_BY_DEPARTMENT)) {
    const hit = titles.find((t) => titleLabel(t, department) === label);
    if (hit) return hit;
  }
  return null;
}
