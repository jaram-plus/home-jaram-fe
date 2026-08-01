/**
 * admin 기능 정적 데이터 — 컬럼 스키마 · enum 라벨 · 문구 · 개발용 시드. (JSX 없음)
 *
 * 운영에서 표 데이터/대시보드 수치는 백엔드 응답으로 채웁니다. 이 파일에는 다음만 남기세요.
 *   - SCHEMAS          : DataTable 을 구동하는 리소스별 컬럼 정의 (화면 스키마)
 *   - *_LABEL          : enum 키 ↔ 한글 라벨 맵. 가능하면 @/shared/member/enums 로 승격하세요.
 *   - MESSAGES / TOAST : 문구 (존댓말 · 이모지 금지)
 *   - SEED / DASHBOARD_SEED : USE_MOCK=true 개발용 시드. 백엔드 연동 시 삭제하세요.
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
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '회원 추가',
    desc: '회원 명단입니다. 셀을 눌러 바로 수정하고, 변경분을 모아 저장하세요.',
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
      { key: 'phone', label: '연락처', type: 'text', width: '1.1fr' },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
    ],
  },
  exec: {
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '임원 지정',
    desc: '임원진 부서·직책 배정입니다. 학번으로 회원 명부와 대조한 뒤 회장단·학술부·홍보부·회계부·인프라로 지정하세요.',
    filters: [{ key: 'department', label: '부서', options: ['전체', '회장단', '학술부', '홍보부', '회계부', '인프라'] }],
    cols: [
      { key: 'name', label: '이름', type: 'text', width: '0.9fr' },
      { key: 'studentId', label: '학번', type: 'text', width: '1fr' },
      { key: '__match', label: '대조', type: 'match', width: '1fr', align: 'center' },
      { key: 'gen', label: '기수', type: 'text', width: '0.5fr', align: 'center' },
      { key: 'department', label: '부서', type: 'select', width: '0.9fr', options: ['회장단', '학술부', '홍보부', '회계부', '인프라'] },
      { key: 'position', label: '직책', type: 'text', width: '0.8fr' },
      { key: 'term', label: '임기', type: 'text', width: '0.55fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '0.55fr', align: 'center', actions: ['delete'] },
    ],
  },
  contrib: {
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '기여자 추가',
    desc: '자람에 힘을 더해주신 분들입니다. 전 임원·멘토·외부 자문·후원자의 기여 내역을 기록합니다.',
    filters: [{ key: 'type', label: '구분', options: ['전체', '전 임원', '멘토', '외부 자문', '후원자'] }],
    cols: [
      { key: 'name', label: '이름', type: 'text', width: '0.9fr' },
      { key: 'gen', label: '기수', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'type', label: '구분', type: 'select', width: '0.9fr', options: ['전 임원', '멘토', '외부 자문', '후원자'] },
      { key: 'contribution', label: '기여 내용', type: 'text', width: '2fr' },
      { key: 'link', label: '링크', type: 'text', width: '1.1fr' },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
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
    eyebrow: 'SEMINAR', title: '세미나 관리', addLabel: '세미나 개설',
    desc: '세미나 일정·발표자·공개 대상·출석코드·상태를 관리합니다.',
    filters: [{ key: 'status', label: '상태', options: ['전체', ...labelsOf(SEMINAR_STATUS_LABELS)] }],
    cols: [
      { key: 'title', label: '세미나명', type: 'text', width: '1.3fr' },
      { key: 'speaker', label: '발표자', type: 'text', width: '0.7fr' },
      { key: 'topic', label: '주제', type: 'text', width: '0.7fr' },
      { key: 'startsAt', label: '일시', type: 'text', width: '1fr' },
      { key: 'place', label: '장소', type: 'text', width: '0.9fr' },
      { key: 'mode', label: '진행 방식', type: 'text', width: '0.7fr' },
      { key: 'description', label: '상세 설명', type: 'text', width: '1.4fr' },
      { key: 'materialUrl', label: '발표자료 링크', type: 'text', width: '1fr' },
      { key: 'target', label: '대상', type: 'multiselect', width: '1.6fr', options: labelsOf(TARGET_GRADE_LABELS) },
      { key: 'attendanceCode', label: '출석코드', type: 'text', width: '0.7fr', align: 'center' },
      { key: 'status', label: '상태', type: 'select', width: '0.8fr', options: labelsOf(SEMINAR_STATUS_LABELS) },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
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
};

export const TOAST = {
  saved: (n) => `변경분 ${n}건이 저장되었습니다.`,
  approved: '신청을 승인했습니다. 저장 시 회원으로 편입됩니다.',
  rejected: '신청을 반려했습니다.',
  seminarApproved: '세미나를 승인했습니다. 저장 시 정식 목록에 노출됩니다.',
  seminarRejected: '세미나를 반려했습니다.',
  exported: '현재 목록을 Google Drive 스프레드시트로 내보냈습니다.',
  settingsSaved: '설정이 저장되었습니다.',
};

export const EMPTY = {
  noData: { title: '아직 등록된 항목이 없어요', desc: '상단에서 새 항목을 추가해 시작하세요.' },
  noResult: { title: '검색 결과가 없어요', desc: '검색어나 필터를 바꿔 보세요.' },
};

/* ── 개발용 시드 (USE_MOCK=true) — 백엔드 연동 시 삭제 ────────────────── */
export const SEED = {
  member: [
    { id: 'm1', name: '김서준', studentId: '2024093117', gen: '41기', grade: '수습회원', status: '활동', phone: '010-2841-5573' },
    { id: 'm2', name: '이하은', studentId: '2024093208', gen: '41기', grade: '수습회원', status: '활동', phone: '010-7712-0094' },
    { id: 'm3', name: '박도윤', studentId: '2023091144', gen: '40기', grade: '준회원', status: '활동', phone: '010-3390-8821' },
    { id: 'm4', name: '정시우', studentId: '2023090021', gen: '40기', grade: '준회원', status: '휴학', phone: '010-5560-1187' },
    { id: 'm5', name: '최유나', studentId: '2022089910', gen: '39기', grade: '정회원', status: '활동', phone: '010-2201-7746' },
    { id: 'm6', name: '강준혁', studentId: '2022088804', gen: '39기', grade: '정회원', status: '활동', phone: '010-9983-2210' },
    { id: 'm7', name: '윤서아', studentId: '2021087700', gen: '38기', grade: '정회원', status: '활동', phone: '010-4417-6650' },
  ],
  exec: [
    { id: 'e1', name: '강준혁', studentId: '2022088804', gen: '39기', department: '회장단', position: '회장', term: '2026' },
    { id: 'e2', name: '윤서아', studentId: '2021087700', gen: '38기', department: '회장단', position: '부회장', term: '2026' },
    { id: 'e3', name: '최유나', studentId: '2022089910', gen: '39기', department: '학술부', position: '부장', term: '2026' },
    { id: 'e4', name: '박도윤', studentId: '2023091144', gen: '40기', department: '홍보부', position: '부장', term: '2026' },
    { id: 'e5', name: '정시우', studentId: '2023090021', gen: '40기', department: '회계부', position: '부장', term: '2026' },
    { id: 'e6', name: '이하은', studentId: '2024093208', gen: '41기', department: '인프라', position: '부원', term: '2026' },
  ],
  contrib: [
    { id: 'c1', name: '박나눔', gen: '38기', type: '전 임원', contribution: '전 회장 · 재학생 대상 백엔드·인프라 정기 멘토링', link: 'github.com/parknanum' },
    { id: 'c2', name: '김선배', gen: '37기', type: '전 임원', contribution: '전 학술부장 · 세미나 운영 노하우 문서화 및 인수인계', link: 'blog.jaram.dev/kim' },
    { id: 'c3', name: '이멘토', gen: '외부', type: '외부 자문', contribution: '실무 코드 리뷰·커리어 상담 (현 카카오 시니어 개발자)', link: 'github.com/leementor' },
    { id: 'c4', name: '정오픈', gen: '39기', type: '전 임원', contribution: '전 인프라 담당 · 자람 홈페이지 오픈소스 유지보수 기여', link: 'github.com/jeongopen' },
    { id: 'c5', name: '유강연', gen: '외부', type: '멘토', contribution: '외부 연사 · AI 트렌드 특별 세미나 2회 진행', link: 'blog.yukang.io' },
    { id: 'c6', name: '한동문', gen: '32기', type: '후원자', contribution: '동문 · 학회 서버 비용 및 정기 세미나 다과 후원', link: '—' },
  ],
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

/** 대시보드 시드 — DashboardStats 계약과 동일한 모양 (admin.api.js §fetchDashboardStats). */
export const DASHBOARD_SEED = {
  totalMembers: 142,
  alumniCount: 512,
  seminarAttendanceRate: 87,
  studyAttendanceRate: 79,
  deltas: { members: 12, seminarRate: 3, studyRate: -2 },
  gradeBreakdown: { probationary: 28, associate: 41, regular: 73 },
  genBreakdown: [
    { gen: 37, count: 6 },
    { gen: 38, count: 11 },
    { gen: 39, count: 22 },
    { gen: 40, count: 34 },
    { gen: 41, count: 69 },
  ],
  attendanceTrend: [
    { month: '3월', seminar: 82, study: 80 },
    { month: '4월', seminar: 90, study: 84 },
    { month: '5월', seminar: 93, study: 89 },
    { month: '6월', seminar: 92, study: 85 },
  ],
  pendingApplications: 4,
  pendingBreakdown: { freshman: 3, enrolled: 1 },
};

export const SETTINGS_SEED = {
  semester: '2026-2학기',
  currentGen: 41,
  autoPromote: true,
  driveConnected: true,
  driveFolder: '/자람/명단백업',
};
