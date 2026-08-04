/**
 * admin 기능 정적 데이터 — 컬럼 스키마 · enum 라벨 · 문구 · 개발용 시드. (JSX 없음)
 *
 * 운영에서 표 데이터/대시보드 수치는 백엔드 응답으로 채웁니다. 이 파일에는 다음만 남기세요.
 *   - SCHEMAS          : DataTable 을 구동하는 리소스별 컬럼 정의 (화면 스키마)
 *   - *_LABEL          : enum 키 ↔ 한글 라벨 맵. 가능하면 @/shared/member/enums 로 승격하세요.
 *   - MESSAGES / TOAST : 문구 (존댓말 · 이모지 금지)
 *   - SEED             : USE_MOCK=true 개발용 시드. 리소스가 백엔드에 붙으면 지우세요.
 *
 * 화면은 한글 라벨로 다루고, 와이어(백엔드)는 enum 키로 주고받습니다. 라벨↔키 매핑은
 * admin.api.js 의 toWire / fromWire 경계 한 곳에서만 수행합니다 (DEVELOPMENT.md §5 도메인 enum).
 */
import { SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS } from '@/shared/seminar/enums';
import { DEPARTMENT_LABELS } from '@/shared/member/enums';

/* ── enum 키 ↔ 한글 라벨 ─────────────────────────────────────────────── */
export const GRADE_LABEL = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };
export const STATUS_LABEL = { ACTIVE: '활동', ON_LEAVE: '휴학', WITHDRAWN: '탈퇴' };
// 부서는 @/shared/member/enums 가 단일 소스 (BE MemberDepartment 미러). 여기서 다시 정의하지 않는다.
export const DEPARTMENT_LABEL = DEPARTMENT_LABELS;
export const APPLICATION_STATUS_LABEL = { PENDING: '대기', APPROVED: '승인', REJECTED: '반려' };
export const STUDY_STATUS_LABEL = { RECRUITING: '모집', ONGOING: '진행', CLOSED: '종료' };
// admin.api.js / admin.validation.js 는 여기서 재수출된 걸 import한다(수입 경로 최소 변경).
export { SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS };

/** 라벨 맵을 옵션 배열로. (필요하면 일부만 골라 쓰세요) */
export const labelsOf = (map) => Object.values(map);

/* ── 리소스 메타 : 라우트 경로 · 단위 · 탭 소속 ───────────────────────── */
export const RESOURCES = {
  member: { path: 'members', unit: '명', tab: 'member' },
  exec: { path: 'members', unit: '명', tab: 'exec' },
  contrib: { path: 'members', unit: '명', tab: 'contrib' },
  grad: { path: 'members', unit: '명', tab: 'grad' },
  seminars: { path: 'seminars', unit: '건' },
  studies: { path: 'studies', unit: '건' },
  applications: { path: 'applications', unit: '건' },
  seminarApprovals: { path: 'seminars', unit: '건' },
};

/** 인원 관리 상단 탭 (URL ?tab= 로 상태화). */
export const PEOPLE_TABS = [
  { key: 'member', label: '회원' },
  { key: 'exec', label: '임원진' },
  { key: 'contrib', label: '기여자' },
  { key: 'grad', label: '졸업생' },
];

/* ── 리소스별 컬럼 스키마 ─────────────────────────────────────────────
 * type: text | select | tag | static | match | actions
 * width: CSS grid track. align: 'left'|'center'. options: select 옵션(라벨).
 * actions: ['delete'] | ['approve','reject']
 */
export const SCHEMAS = {
  member: {
    // 수기 등록(creates)은 서버가 거부한다("회원은 일괄 생성이 지원되지 않습니다") —
    // 가입은 신청·승인 절차로만 이뤄지므로 추가 버튼을 두지 않는다.
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '',
    desc: '승인된 회원 명단입니다. 셀을 눌러 바로 수정하고, 변경분을 모아 저장하세요.',
    filters: [
      { key: 'grade', label: '등급', options: ['전체', '수습회원', '준회원', '정회원', '졸업생'] },
      { key: 'gen', label: '기수', options: ['전체', '41기', '40기', '39기', '38기'] },
      { key: 'status', label: '상태', options: ['전체', '활동', '휴학', '탈퇴'] },
    ],
    cols: [
      { key: 'name', label: '이름', type: 'text', width: '1.1fr' },
      { key: 'studentId', label: '학번', type: 'text', width: '1fr' },
      { key: 'gen', label: '기수', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'grade', label: '등급', type: 'select', width: '1fr', options: ['수습회원', '준회원', '정회원', '졸업생'] },
      { key: 'status', label: '상태', type: 'select', width: '0.8fr', options: ['활동', '휴학', '탈퇴'] },
      // 이메일은 서버가 내려주지만 일괄 수정 화이트리스트에 없어 읽기 전용이다.
      { key: 'email', label: '이메일', type: 'static', width: '1.4fr' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'delete'] },
    ],
  },
  exec: {
    // 이름·학번·기수는 회원 정보라 이 표에서 고치지 않는다(회원 탭이 담당). 여기서 바꾸는 건
    // 부서·직책, 즉 임기뿐이며 그마저도 로그인한 임원의 권한만큼만 열린다(exec.roles.js).
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '임원 지정',
    desc: '임원진 부서·직책 배정입니다. 임원 지정으로 회원을 임명하고, 부서·직책은 권한 범위 안에서 바꿀 수 있습니다.',
    filters: [{ key: 'department', label: '부서', options: ['전체', '회장단', '학술부', '홍보부', '회계부', '인프라'] }],
    cols: [
      { key: 'name', label: '이름', type: 'static', width: '0.9fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'gen', label: '기수', type: 'static', width: '0.6fr', align: 'center' },
      { key: 'department', label: '부서', type: 'assign', width: '1fr' },
      { key: 'title', label: '직책', type: 'assign', width: '1fr' },
      { key: 'term', label: '임기', type: 'static', width: '0.7fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '0.9fr', align: 'center', actions: ['unassign'] },
    ],
  },
  contrib: {
    // 이름·학번·기수·등급은 회원 정보라 이 표에서 고치지 않는다(회원 탭이 담당).
    // 여기서 바꾸는 건 기여자 여부뿐이며, 그것도 '기여자 해제'로만 이뤄진다.
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '기여자 추가',
    desc: '자람에 힘을 더해주신 분들입니다. 임원 임기를 받으면 자동으로 등록되고, 기여자 추가로 직접 등록할 수 있습니다.',
    filters: [{ key: 'grade', label: '등급', options: ['전체', '수습회원', '준회원', '정회원', '졸업생'] }],
    cols: [
      { key: 'name', label: '이름', type: 'static', width: '0.9fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'gen', label: '기수', type: 'static', width: '0.6fr', align: 'center' },
      { key: 'role', label: '직책 이력', type: 'static', width: '1.1fr' },
      { key: 'grade', label: '등급', type: 'static', width: '0.8fr' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'uncontrib'] },
    ],
  },
  grad: {
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '졸업생 추가',
    desc: '졸업생 명단과 현재 소속·직무입니다.',
    filters: [{ key: 'gen', label: '기수', options: ['전체', '36기', '35기', '34기', '33기', '32기', '31기'] }],
    cols: [
      { key: 'name', label: '이름', type: 'text', width: '1fr' },
      { key: 'gen', label: '기수', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'gradYear', label: '졸업연도', type: 'text', width: '0.7fr', align: 'center' },
      { key: 'org', label: '현재 소속', type: 'text', width: '1fr' },
      { key: 'job', label: '직무', type: 'text', width: '1fr' },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
    ],
  },
  seminars: {
    // 표는 훑어보는 자리다 — 내용 수정·출석 관리는 행마다 여는 상세 모달이 담당한다.
    // 상태는 서버가 시각으로 파생하므로(예정/진행/종료) 사람이 고르는 값이 아니다.
    eyebrow: 'SEMINAR', title: '세미나 관리', addLabel: '세미나 개설',
    desc: '세미나 목록입니다. 상세보기에서 내용을 고치고 출석을 관리하세요. 일정에 없는 세미나는 개설로 직접 열 수 있습니다.',
    filters: [{ key: 'status', label: '상태', options: ['전체', ...labelsOf(SEMINAR_STATUS_LABELS)] }],
    cols: [
      { key: 'title', label: '세미나명', type: 'static', width: '1.6fr' },
      { key: 'speaker', label: '발표자', type: 'static', width: '0.8fr' },
      { key: 'startsAt', label: '일시', type: 'static', width: '1.1fr' },
      { key: 'place', label: '장소', type: 'static', width: '1fr' },
      { key: 'status', label: '상태', type: 'tag', width: '0.7fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'delete'] },
    ],
  },
  seminarApprovals: {
    eyebrow: 'SEMINAR', title: '세미나 승인', addLabel: '',
    desc: '학회원이 자기 슬롯에서 제출한 세미나를 검토하고 승인/반려하세요. 승인하면 정식 세미나 목록에 노출됩니다.',
    filters: [],
    cols: [
      { key: 'title', label: '세미나명', type: 'text', width: '1.3fr' },
      { key: 'speaker', label: '발표자', type: 'text', width: '0.8fr' },
      { key: 'topic', label: '주제', type: 'text', width: '0.7fr' },
      { key: 'startsAt', label: '일시', type: 'static', width: '1fr' },
      { key: 'status', label: '상태', type: 'tag', width: '0.7fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['approve', 'reject'] },
    ],
  },
  studies: {
    eyebrow: 'STUDY', title: '스터디 관리', addLabel: '스터디 개설',
    desc: '스터디 모집·진행·출석률을 관리합니다.',
    filters: [{ key: 'status', label: '상태', options: ['전체', '모집', '진행', '종료'] }],
    cols: [
      { key: 'title', label: '스터디명', type: 'text', width: '1.4fr' },
      { key: 'leader', label: '스터디장', type: 'text', width: '0.8fr' },
      { key: 'count', label: '인원', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'schedule', label: '요일·시간', type: 'text', width: '0.9fr' },
      { key: 'period', label: '기간', type: 'text', width: '1fr' },
      { key: 'rate', label: '출석률', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'status', label: '상태', type: 'select', width: '0.8fr', options: ['모집', '진행', '종료'] },
      { key: '__act', label: '', type: 'actions', width: '0.55fr', align: 'center', actions: ['delete'] },
    ],
  },
  applications: {
    // 수기 등록(creates)은 대응 엔드포인트가 없어 추가 버튼을 두지 않는다 — 가입은 신청 절차로만.
    eyebrow: 'JOIN', title: '가입 신청 · 승인', addLabel: '',
    desc: '대기 중인 가입 신청을 검토하고 승인/반려하세요. 승인 시 기수 기준으로 등급이 자동 부여됩니다.',
    filters: [],
    cols: [
      { key: 'name', label: '신청자', type: 'static', width: '1fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'appliedAt', label: '신청일', type: 'static', width: '1fr', align: 'center' },
      { key: 'status', label: '상태', type: 'tag', width: '0.8fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['approve', 'reject'] },
    ],
  },
};

/* ── 문구 ─────────────────────────────────────────────────────────────── */
export const MESSAGES = {
  savePartialFail: '일부 행을 저장하지 못했습니다. 표시된 행을 확인해 주세요.',
  conflict: '다른 곳에서 먼저 변경되었습니다. 다시 불러온 뒤 편집해 주세요.',
  leaveGuard: '저장하지 않은 변경이 있습니다. 이 페이지를 벗어나시겠어요?',
  deleteRefWarn: '임원·스터디장으로 배정된 회원입니다. 삭제하면 배정도 함께 해제됩니다.',
  driveNotConnected: '표를 스프레드시트로 내보내려면 설정에서 Google Drive를 먼저 연결하세요.',
  confirmGraduate: (n) => `졸업생으로 변경하는 회원 ${n}명의 진행 중인 임원 임기가 종료됩니다. 임기 이력은 남으며 임원진 명단에서는 빠집니다. 계속할까요?`,
  noAssignPermission: '임원을 지정할 권한이 없습니다. 회장·부회장 또는 각 부처의 부장에게 요청해 주세요.',
  handoverPresident: '회장 자리를 넘기면 본인의 회장 임기가 함께 종료되어 임원 권한을 잃습니다. 계속할까요?',
  noAssignable: '지정할 수 있는 회원이 없습니다. 이미 임기가 있거나 졸업생인 회원은 목록에 나오지 않습니다.',
  noContribCandidate: '등록할 수 있는 회원이 없습니다. 이미 기여자로 등록된 회원은 목록에 나오지 않습니다.',
  seminarSaveFail: '세미나 내용을 저장하지 못했습니다.',
  attendanceFail: '출석 처리 중 오류가 발생했습니다.',
  noAttendee: '아직 출석한 회원이 없습니다.',
  noAttendCandidate: '출석 처리할 수 있는 회원이 없습니다. 이미 출석한 회원은 목록에 나오지 않습니다.',
  codeNotIssued: '아직 발급하지 않았습니다.',
  closeAttendanceWarn: '마감하면 출석 시간이 남아 있어도 더 받지 않습니다. 되돌릴 수 없습니다.',
};

export const TOAST = {
  saved: (n) => `변경분 ${n}건이 저장되었습니다.`,
  // 직책마다 조사가 갈려(회장'으로' / 서버 관리자'로') '직책으로' 로 묶는다.
  assigned: (name, title) => `${name} 님을 ${title} 직책으로 지정했습니다.`,
  contribAdded: (name) => `${name} 님을 기여자로 등록했습니다.`,
  approved: '신청을 승인했습니다. 저장 시 회원으로 편입됩니다.',
  rejected: '신청을 반려했습니다.',
  seminarApproved: '세미나를 승인했습니다. 저장 시 정식 목록에 노출됩니다.',
  seminarRejected: '세미나를 반려했습니다.',
  seminarCreated: '세미나를 개설했습니다.',
  seminarSaved: '세미나 내용을 저장했습니다.',
  codeIssued: '출석 코드를 발급했습니다.',
  attendanceClosed: '출석을 마감했습니다.',
  attendeeAdded: (name) => `${name} 님을 출석 처리했습니다.`,
  attendeeRemoved: (name) => `${name} 님의 출석을 취소했습니다.`,
  exported: '현재 목록을 Google Drive 스프레드시트로 내보냈습니다.',
  settingsSaved: '설정이 저장되었습니다.',
};

export const EMPTY = {
  noData: { title: '아직 등록된 항목이 없어요', desc: '상단에서 새 항목을 추가해 시작하세요.' },
  noResult: { title: '검색 결과가 없어요', desc: '검색어나 필터를 바꿔 보세요.' },
};

/* ── 개발용 시드 (USE_MOCK=true) — 백엔드 연동 시 삭제 ────────────────── */
export const SEED = {
  // member·exec·contrib 는 실 서버(GET /api/admin/members)로 전환되어 시드를 두지 않는다.
  grad: [
    { id: 'g1', name: '한지호', gen: '35기', gradYear: '2021', org: '네이버', job: '백엔드 엔지니어' },
    { id: 'g2', name: '오세훈', gen: '34기', gradYear: '2020', org: '카카오', job: '안드로이드 개발자' },
    { id: 'g3', name: '임채원', gen: '33기', gradYear: '2019', org: '라인', job: '프론트엔드 개발자' },
    { id: 'g4', name: '서동건', gen: '32기', gradYear: '2018', org: '쿠팡', job: '데이터 엔지니어' },
    { id: 'g5', name: '백지안', gen: '36기', gradYear: '2022', org: '토스', job: 'iOS 개발자' },
    { id: 'g6', name: '남기훈', gen: '31기', gradYear: '2017', org: '삼성전자', job: 'SW 엔지니어' },
  ],
  studies: [
    { id: 'st1', title: '알고리즘 코테반', leader: '강준혁', count: '12명', schedule: '월 20:00', period: '2026-03 ~ 06', rate: '92%', status: '진행' },
    { id: 'st2', title: 'CS 전공 스터디', leader: '최유나', count: '8명', schedule: '수 19:00', period: '2026-03 ~ 06', rate: '85%', status: '진행' },
    { id: 'st3', title: '토이 프로젝트 A', leader: '박도윤', count: '5명', schedule: '금 18:00', period: '2026-03 ~ 08', rate: '78%', status: '진행' },
    { id: 'st4', title: '리액트 심화', leader: '이하은', count: '6명', schedule: '화 20:00', period: '2026-03 ~ 06', rate: '—', status: '모집' },
    { id: 'st5', title: 'AI 논문 리딩', leader: '윤서아', count: '7명', schedule: '목 19:00', period: '2026-03 ~ 06', rate: '81%', status: '진행' },
    { id: 'st6', title: '자바 백엔드', leader: '정시우', count: '9명', schedule: '토 14:00', period: '2025-09 ~ 12', rate: '88%', status: '종료' },
  ],
};

export const SETTINGS_SEED = {
  semester: '2026-2학기',
  currentGen: 41,
  autoPromote: true,
  driveConnected: true,
  driveFolder: '/자람/명단백업',
};
