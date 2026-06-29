/**
 * Study page copy + seed data — pure data, no JSX.
 *
 * `STUDIES` is the browsable catalogue; `SEED_PENDING` / `SEED_APPLICANTS`
 * seed the officer-management demo lists (the page filters them locally on
 * approve/reject). In production these come from the backend — keep only the
 * static copy (messages, badge maps, empty states) here.
 */

// Browsable studies. `status` drives the badge; `apply` drives the CTA state.
//   status: recruiting | closed | ongoing | ended
//   apply:  open | applied | closed | joined
export const STUDIES = [
  { id: 's1', title: 'React 심화 스터디', fields: ['Frontend', 'React'], leader: '이성장', schedule: '매주 화 19:00', period: '8주 과정', mode: '온·오프라인 병행', cur: 3, cap: 6, status: 'recruiting', apply: 'open' },
  { id: 's2', title: '알고리즘 문제풀이', fields: ['Algorithm', 'C++'], leader: '김자람', schedule: '매주 목 20:00', period: '12주 과정', mode: '오프라인', cur: 5, cap: 6, status: 'recruiting', apply: 'applied' },
  { id: 's3', title: '운영체제 뿌수기', fields: ['CS', 'OS'], leader: '박나눔', schedule: '매주 월 19:30', period: '10주 과정', mode: '온라인', cur: 6, cap: 6, status: 'closed', apply: 'closed' },
  { id: 's4', title: 'Spring 백엔드 실전', fields: ['Backend', 'Spring'], leader: '최순환', schedule: '매주 수 19:00', period: '진행 중', mode: '오프라인', cur: 5, cap: 5, status: 'ongoing', apply: 'joined' },
  { id: 's5', title: '자료구조 입문', fields: ['CS'], leader: '한그루', schedule: '매주 금 18:00', period: '8주 과정', mode: '온라인', cur: 2, cap: 8, status: 'recruiting', apply: 'open' },
  { id: 's6', title: 'Docker · Kubernetes', fields: ['DevOps'], leader: '정포부', schedule: '격주 토 14:00', period: '6주 과정', mode: '온·오프라인 병행', cur: 4, cap: 5, status: 'recruiting', apply: 'open' },
];

// status → Tag content. tone maps to the design-system Tag `tone` prop.
export const STATUS_BADGE = {
  recruiting: { label: '모집 중', tone: 'brand' },
  closed: { label: '모집 마감', tone: 'neutral' },
  ongoing: { label: '진행 중', tone: 'seal' },
  ended: { label: '종료', tone: 'neutral' },
};

// apply state → disabled CTA label (when the user can't apply).
export const APPLY_LABEL = {
  applied: '승인 대기 중',
  closed: '모집이 마감되었습니다',
  joined: '참여 중인 스터디입니다',
};

// --- "내 활동" (read-only demo) ---
export const MY_APPS = [
  { id: 'app1', title: 'React 심화 스터디', message: '승인 대기 중입니다.', badge: '대기', tone: 'neutral' },
  { id: 'app2', title: '알고리즘 문제풀이', message: '참여가 확정되었습니다.', badge: '승인', tone: 'brand' },
  { id: 'app3', title: '운영체제 뿌수기', message: '이번 스터디에는 함께하지 못하게 되었습니다. 사유: 모집 인원이 모두 마감되었습니다.', badge: '거절', tone: 'neutral' },
];

export const MY_STUDIES = [
  { id: 'my1', title: 'Rust 입문 스터디', message: '임원 확인 후 공개됩니다.', badge: '승인 대기', tone: 'neutral' },
  { id: 'my2', title: 'Spring 백엔드 실전', message: '전체에 공개되어 모집 중입니다.', badge: '공개 중', tone: 'brand' },
  { id: 'my3', title: '블록체인 기초', message: '개설이 반려되었습니다. 사유: 유사한 스터디가 이미 운영 중입니다.', badge: '반려됨', tone: 'neutral' },
];

// --- officer management seed (mutated locally on approve/reject) ---
export const SEED_PENDING = [
  { id: 'p1', title: 'Rust 입문 스터디', field: 'Backend', creator: '김자람', recruit: '4명', schedule: '매주 화 19:00 · 8주 과정', intro: '시스템 프로그래밍 언어 Rust의 소유권 모델부터 비동기까지 함께 학습합니다.', date: '2026.06.20' },
  { id: 'p2', title: 'Figma UI 스터디', field: 'Design', creator: '박나눔', recruit: '6명', schedule: '매주 목 18:00 · 6주 과정', intro: '컴포넌트 설계와 오토레이아웃 중심으로 실무형 UI를 만들어 봅니다.', date: '2026.06.22' },
];

export const SEED_APPLICANTS = [
  { id: 'a1', name: '이정민', sid: '2023012345', motive: '프론트엔드 실력을 키우고 실제 프로젝트에 기여하고 싶습니다. 꾸준히 참여하겠습니다.', date: '2026.06.21' },
  { id: 'a2', name: '홍서연', sid: '2022098765', motive: '알고리즘 기초가 약해 함께 꾸준히 문제를 풀며 성장하고 싶어 신청합니다.', date: '2026.06.23' },
];

// Client-side validation messages.
export const MESSAGES = {
  motiveRequired: '지원 동기를 입력해 주세요.',
  titleRequired: '제목을 입력해 주세요.',
};

// Transient toast strings. `studyPublished` / `applicantApproved` take a name.
export const TOAST = {
  applied: '신청이 접수되었습니다. 승인 결과를 기다려 주세요.',
  created: '스터디 개설을 신청했습니다. 임원 승인 후 공개됩니다.',
  studyPublished: (title) => `‘${title}’을(를) 공개했습니다.`,
  studyRejected: '스터디 개설을 반려했습니다.',
  applicantApproved: (name) => `${name} 님의 신청을 승인했습니다.`,
  applicantRejected: '신청을 거절했습니다.',
};

export const EMPTY = {
  studies: '현재 진행 중인 스터디가 없습니다.',
  pending: '승인 대기 중인 스터디가 없습니다.',
  applicants: '대기 중인 신청이 없습니다.',
};
