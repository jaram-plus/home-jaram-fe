/**
 * Study page copy + seed data — pure data, no JSX.
 *
 * `STUDIES`, `MY_APPS`, `MY_STUDIES`, `SEED_PENDING` / `SEED_APPLICANTS` mirror
 * the original mock catalogue/officer-management lists; the page now fetches
 * all of these from the backend via study.api.js, so these exports are
 * currently unused. Keep only the static copy (messages, badge maps, empty
 * states) here.
 */

// Browsable studies. `status` drives the badge; `apply` drives the CTA state.
//   status (StudyStatus): PENDING | REJECTED | RECRUITING | ONGOING | FINISHED
//   apply  (ApplyState):  OPEN | APPLIED | CLOSED | JOINED
export const STUDIES = [
  { id: 's1', title: 'React 심화 스터디', fields: ['Frontend', 'React'], leader: '이성장', schedule: '매주 화 19:00', period: '8주 과정', mode: '온·오프라인 병행', cur: 3, cap: 6, status: 'RECRUITING', apply: 'OPEN' },
  { id: 's2', title: '알고리즘 문제풀이', fields: ['Algorithm', 'C++'], leader: '김자람', schedule: '매주 목 20:00', period: '12주 과정', mode: '오프라인', cur: 5, cap: 6, status: 'RECRUITING', apply: 'APPLIED' },
  { id: 's3', title: '운영체제 뿌수기', fields: ['CS', 'OS'], leader: '박나눔', schedule: '매주 월 19:30', period: '10주 과정', mode: '온라인', cur: 6, cap: 6, status: 'CLOSED', apply: 'CLOSED' },
  { id: 's4', title: 'Spring 백엔드 실전', fields: ['Backend', 'Spring'], leader: '최순환', schedule: '매주 수 19:00', period: '진행 중', mode: '오프라인', cur: 5, cap: 5, status: 'ONGOING', apply: 'JOINED' },
  { id: 's5', title: '자료구조 입문', fields: ['CS'], leader: '한그루', schedule: '매주 금 18:00', period: '8주 과정', mode: '온라인', cur: 2, cap: 8, status: 'RECRUITING', apply: 'OPEN' },
  { id: 's6', title: 'Docker · Kubernetes', fields: ['DevOps'], leader: '정포부', schedule: '격주 토 14:00', period: '6주 과정', mode: '온·오프라인 병행', cur: 4, cap: 5, status: 'RECRUITING', apply: 'OPEN' },
];

// status → Tag content. tone maps to the design-system Tag `tone` prop.
export const STATUS_BADGE = {
  PENDING: { label: '승인 대기', tone: 'neutral' },
  REJECTED: { label: '반려됨', tone: 'neutral' },
  RECRUITING: { label: '모집 중', tone: 'brand' },
  ONGOING: { label: '진행 중', tone: 'seal' },
  FINISHED: { label: '종료', tone: 'neutral' },
};

// apply state → disabled CTA label (when the user can't apply).
export const APPLY_LABEL = {
  APPLIED: '승인 대기 중',
  CLOSED: '모집이 마감되었습니다',
  JOINED: '참여 중인 스터디입니다',
};

// --- "내 활동" (original mock, now unused — see study.api.js listMyActivity) ---
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

// --- officer management (original mock, unused — 임원 승인은 관리자 콘솔로 옮겼다) ---
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
  recruitClosed: '지금은 개설 신청을 받지 않습니다. 임원에게 문의해 주세요.',
  signInRequired: '로그인 후 신청할 수 있습니다.',
  createFailed: '개설 신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

// Transient toast strings.
// 임원의 승인·반려 문구는 여기 없다 — 관리자 콘솔이 admin.data.js 에 들고 있다.
export const TOAST = {
  applied: '신청이 접수되었습니다. 승인 결과를 기다려 주세요.',
  created: '스터디 개설을 신청했습니다. 임원 승인 후 공개됩니다.',
  applicationDeleted: '신청을 삭제했습니다. 다시 신청할 수 있습니다.',
};

export const EMPTY = {
  studies: '현재 진행 중인 스터디가 없습니다.',
};

/**
 * /my 의 두 배열을 '내 스터디' 카드 한 벌로 합친다.
 *
 * 서버는 관계를 내려보내지 않는다 — 두 배열이 이미 관계를 말하고 있어서, 같은 뜻을
 * 서버에도 두면 두 곳이 어긋날 자리만 는다.
 *
 * 분야·일정·스터디장과 '신청한 스터디의 현재 상태'는 둘러보기 목록(useStudies)에서
 * 붙인다. 그 목록은 RECRUITING·ONGOING 을 다 싣고 이 페이지가 어차피 부른다.
 * 내가 개설한 PENDING·REJECTED 스터디는 그 목록에 없지만, 그 카드가 쓰는 값
 * (제목·상태·반려 사유)은 전부 MyStudy 안에 있다.
 *
 * @param my   { apps, studies } — GET /api/studies/my
 * @param browse StudyResponse[] — GET /api/studies 의 items
 */
export function toMyStudyItems(my, browse = []) {
  const byId = new Map(browse.map((s) => [s.id, s]));
  const detail = (id) => byId.get(id) ?? {};

  const led = (my?.studies ?? []).map((s) => ({
    ...detail(s.id),
    id: s.id,
    title: s.title,
    status: s.status,           // MyStudy 가 권위다. 둘러보기 목록보다 최신이다
    reason: s.reason,
    pendingApplicants: s.pendingApplicants,
    relation: 'LEADER',
    applicationId: null,
  }));

  const applied = (my?.apps ?? []).map((a) => {
    const d = detail(a.studyId);
    return {
      ...d,
      id: a.studyId,
      title: a.title ?? d.title,
      // 신청의 상태(PENDING/APPROVED/REJECTED)가 아니라 스터디의 상태다.
      // 목록에 없으면(= 종료·삭제) 카드가 상태 배지를 그리지 않는다.
      status: d.status ?? null,
      reason: a.reason,
      pendingApplicants: null,
      relation: { APPROVED: 'MEMBER', PENDING: 'APPLIED', REJECTED: 'REJECTED' }[a.status],
      applicationId: a.id,      // 삭제하기가 쓰는 id — 스터디 id 가 아니다
    };
  });

  return [...led, ...applied].filter(keep);
}

/**
 * 종료된 스터디는 어느 관계로도 '내 스터디'에 오지 않는다. 끝난 것이 계속 쌓이면
 * 이 화면이 이력 목록이 된다.
 *
 * 서버는 /my 에서 거르지 않으므로(응답 모양을 안 건드렸다) 여기서 거른다.
 * 둘러보기 목록이 RECRUITING·ONGOING 만 실으므로, 신청 카드의 status 가 null 이면
 * 그 스터디는 종료됐거나 사라진 것이다.
 */
function keep(item) {
  if (item.status === 'FINISHED') return false;
  // 반려된 신청은 이력이라 남긴다 — 지워야 그 스터디에 다시 신청할 수 있다.
  if (item.relation === 'REJECTED') return true;
  if (item.relation !== 'LEADER' && item.status == null) return false;
  return true;
}

/**
 * 관계 칩 — 이 화면의 구조다. 왜 이 카드가 저 카드와 다르게 생겼는지를 설명하는
 * 유일한 값이므로 장식이 아니라 정보다.
 */
export const RELATION_CHIP = {
  LEADER:   { label: '스터디장', tone: 'brand' },
  MEMBER:   { label: '참여 중', tone: 'seal' },
  APPLIED:  { label: '신청 대기', tone: 'outline' },
  REJECTED: { label: '반려됨', tone: 'neutral' },
};

/** 카드 가운데 한 줄. 관계 x 상태가 정한다. */
export function relationLine(item) {
  const { relation, status } = item;
  if (relation === 'LEADER') {
    if (status === 'PENDING') return '개설 승인을 기다리는 중입니다';
    if (status === 'REJECTED') return item.reason || '개설이 반려되었습니다';
    if (status === 'RECRUITING') {
      return item.pendingApplicants
        ? `신청 ${item.pendingApplicants}건이 기다리고 있습니다`
        : '새 신청이 없습니다';
    }
    // 진행 중 카드에는 숫자가 없다. 출석 수·기록된 주차 수를 실으려면 /my 에 필드가
    // 셋 더 붙어야 하는데 이번 단계는 pendingApplicants 하나만 더했다.
    // 숫자는 '관리하기'를 열면 나온다.
    if (status === 'ONGOING') return '진행 중입니다';
  }
  if (relation === 'MEMBER') {
    if (status === 'ONGOING') return '참여 중입니다';
    return '참여가 확정됐습니다. 곧 시작합니다';
  }
  if (relation === 'APPLIED') return '신청이 검토 중입니다';
  return item.reason || '신청이 반려되었습니다';
}

/** 멤버에게 '관리하기'는 거짓말이다 — 관리할 것이 없고 자기 출석을 볼 뿐이다. */
export const RELATION_ACTION = {
  LEADER: '관리하기',
  MEMBER: '출석 보기',
  REJECTED: '삭제하기',
};

export const ATTENDANCE_LABEL = {
  PRESENT: '출석',
  ABSENT: '결석',
  NOT_TAKEN: '아직',
};

/* ── 개설 신청 폼 ─────────────────────────────────────────────────
 * 계약 StudyCreateRequest 는 아홉 칸이 전부 필수다 — period 는 없어졌고
 * 커리큘럼 주차 수가 그 자리를 대신한다. 화면이 계약보다 느슨하면 서버가 422 로
 * 돌려보내는데, 그때는 어느 칸이 비었는지 볼 폼이 이미 닫힌 뒤다. 여기서 먼저 막는다.
 */

/** 주차 한 줄. weekNo 는 저장할 때 순서가 정하므로 담지 않는다. */
export const BLANK_WEEK = { title: '', content: '' };

export const CREATE_BLANK = {
  title: '',
  fields: '',
  capacity: '',
  schedule: '',
  place: '',
  mode: '',
  contact: '',
  intro: '',
  weeks: [{ ...BLANK_WEEK }],
};

/** 분야 태그는 한 칸에 쉼표로 적고 배열로 나간다. */
export function splitFields(s) {
  return String(s ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 계약 StudyCreateRequest 로 옮긴다. weekNo 는 화면에 놓인 순서가 곧 답이다. */
export function toCreatePayload(v) {
  return {
    title: v.title.trim(),
    fields: splitFields(v.fields),
    capacity: Number(v.capacity),
    intro: v.intro.trim(),
    schedule: v.schedule.trim(),
    place: v.place.trim(),
    mode: v.mode.trim(),
    contact: v.contact.trim(),
    weeks: v.weeks.map((w, i) => ({
      weekNo: i + 1,
      title: w.title.trim(),
      content: w.content.trim() || null,
    })),
  };
}

const CREATE_REQUIRED = {
  title: MESSAGES.titleRequired,
  schedule: '언제 모이는지 적어 주세요.',
  place: '어디서 모이는지 적어 주세요.',
  mode: '진행 방식을 적어 주세요.',
  contact: '문의받을 연락처를 적어 주세요.',
  intro: '스터디 소개를 적어 주세요.',
};

/** 빈 오류 맵이면 보낼 수 있다. 키는 폼 필드 이름과 같다. */
export function validateCreate(v) {
  const e = {};
  Object.entries(CREATE_REQUIRED).forEach(([k, msg]) => {
    if (!String(v[k] ?? '').trim()) e[k] = msg;
  });
  if (splitFields(v.fields).length === 0) e.fields = '분야를 하나 이상 적어 주세요.';
  const cap = Number(v.capacity);
  if (!String(v.capacity).trim() || !Number.isInteger(cap) || cap < 1) {
    e.capacity = '희망 인원은 1 이상의 숫자입니다.';
  }
  // 주차는 제목이 필수고 내용은 선택이다. 빈 줄을 조용히 버리면 적다 만 주차가
  // 말없이 사라지므로, 채우든 지우든 사용자가 고르게 한다.
  if (v.weeks.every((w) => !w.title.trim())) e.weeks = '커리큘럼을 한 주차 이상 적어 주세요.';
  else if (v.weeks.some((w) => !w.title.trim())) e.weeks = '제목이 빈 주차가 있습니다. 채우거나 지워 주세요.';
  return e;
}

/** 개설 신청이 실패한 이유 한 줄. 서버가 code 를 주면 그것을 믿는다. */
export function createErrorMessage(error) {
  if (!error) return '';
  const status = error.response?.status;
  if (error.response?.data?.code === 'RECRUIT_CLOSED') return MESSAGES.recruitClosed;
  if (status === 401) return MESSAGES.signInRequired;
  return error.response?.data?.message || MESSAGES.createFailed;
}

