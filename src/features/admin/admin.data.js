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
export const STATUS_LABEL = { ACTIVE: '활동', ON_LEAVE: '휴학', REREGISTER: '재등록', WITHDRAWN: '탈퇴' };
// 부서는 @/shared/member/enums 가 단일 소스 (BE MemberDepartment 미러). 여기서 다시 정의하지 않는다.
export const DEPARTMENT_LABEL = DEPARTMENT_LABELS;
export const APPLICATION_STATUS_LABEL = { PENDING: '대기', APPROVED: '승인', REJECTED: '반려' };
/** 승인 탭 한 줄의 구분. 재등록은 신청 여부까지 상태 칸에 드러난다. */
export const PENDING_KIND_LABEL = { SIGNUP: '가입', REREGISTER: '재등록' };
/**
 * 스터디 생애축(BE StudyStatus). 선언 순서가 곧 생애 순서입니다.
 * 옛 CLOSED('정원이 찼다')는 그 개념 자체가 없어져 버렸고, 개설 승인 축이
 * 접히면서 PENDING·REJECTED 가 여기로 들어왔습니다.
 */
export const STUDY_STATUS_LABEL = {
  PENDING: '승인 대기',
  REJECTED: '반려',
  RECRUITING: '모집',
  ONGOING: '진행',
  FINISHED: '종료',
};
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
      { key: 'status', label: '상태', options: ['전체', '활동', '휴학', '재등록', '탈퇴'] },
    ],
    cols: [
      { key: 'name', label: '이름', type: 'text', width: '1.1fr' },
      { key: 'studentId', label: '학번', type: 'text', width: '1fr' },
      { key: 'gen', label: '기수', type: 'text', width: '0.6fr', align: 'center' },
      { key: 'grade', label: '등급', type: 'select', width: '1fr', options: ['수습회원', '준회원', '정회원', '졸업생'] },
      // '재등록'은 학기 전환 스윕만 설정한다. 서버가 직접 지정을 거부하므로 옵션에 두지 않는다.
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
    // 졸업생은 회원 등급을 졸업생으로 바꿔 만들어진다(회원 탭). 여기서 빈 행을 만들 일이
    // 없어 추가 버튼을 두지 않고, 표는 읽기 전용으로 두어 편집은 상세 모달 한 곳에서만 한다.
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '',
    desc: '졸업생 명단입니다. 표에는 가장 최근 이력만 보이고, 졸업연도와 이력은 상세에서 고칩니다.',
    filters: [{ key: 'gen', label: '기수', options: ['전체', '36기', '35기', '34기', '33기', '32기', '31기'] }],
    cols: [
      { key: 'name', label: '이름', type: 'static', width: '1fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'gen', label: '기수', type: 'static', width: '0.6fr', align: 'center' },
      { key: 'gradYear', label: '졸업연도', type: 'static', width: '0.7fr', align: 'center' },
      { key: 'org', label: '현재 소속', type: 'static', width: '1fr' },
      { key: 'job', label: '직무', type: 'static', width: '1fr' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'delete'] },
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
    // 수기 개설(creates)은 두지 않는다 — 서버가 leaderId 를 요구하는데 표에는 사람을
    // 고를 자리가 없고, 개설은 회원이 스터디 페이지에서 신청하는 절차이기 때문이다.
    // 그 절차를 여닫는 손잡이가 제목 아래 '개설 신청' 토글이다.
    eyebrow: 'STUDY', title: '스터디 관리', addLabel: '',
    desc: '개설된 스터디 전체입니다. 표에서는 상태만 바꾸고, 나머지는 \'상세\'에서 고치세요.',
    filters: [{ key: 'status', label: '상태', options: ['전체', '승인 대기', '반려', '모집', '진행', '종료'] }],
    // 표에서 고칠 수 있는 것은 상태 하나다. 제목·정원도 서버 화이트리스트
    // (AdminBatchExecutor.updateStudy)에는 있지만 여기서 내주지 않는다 — 스터디
    // 정보는 여덟 칸이 한 벌이라, 표에서 두 칸만 고치면 나머지 여섯과 어긋난 채로
    // 저장된다. 여덟 칸과 커리큘럼·명단·출석은 '상세' 모달이 한자리에서 다룬다.
    // 상태만 남긴 것은 그것이 표에서 훑고 바꾸는 값이기 때문이다.
    cols: [
      { key: 'title', label: '스터디명', type: 'static', width: '1.6fr' },
      { key: 'fields', label: '분야', type: 'static', width: '1fr' },
      { key: 'leader', label: '스터디장', type: 'static', width: '0.9fr' },
      { key: 'capacity', label: '정원', type: 'static', width: '0.55fr', align: 'center' },
      { key: 'status', label: '상태', type: 'select', width: '0.9fr', options: ['승인 대기', '반려', '모집', '진행', '종료'] },
      { key: 'createdAt', label: '개설 신청일', type: 'static', width: '1fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'delete'] },
    ],
  },
  applications: {
    // 수기 등록(creates)은 대응 엔드포인트가 없어 추가 버튼을 두지 않는다 — 가입은 신청 절차로만.
    eyebrow: 'JOIN', title: '가입 신청 · 승인', addLabel: '',
    desc: '대기 중인 가입 신청과 재등록 대상을 검토하세요. 가입 승인 시 기수 기준으로 등급이 자동 부여됩니다.',
    filters: [{ key: 'kind', label: '구분', options: ['전체', '가입', '재등록'] }],
    cols: [
      { key: 'kind', label: '구분', type: 'tag', width: '0.7fr', align: 'center' },
      { key: 'name', label: '신청자', type: 'static', width: '1fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'appliedAt', label: '신청일', type: 'static', width: '1fr', align: 'center' },
      { key: 'status', label: '상태', type: 'tag', width: '0.8fr', align: 'center' },
      { key: '__act', label: '', type: 'actions', width: '1.2fr', align: 'center', actions: ['approve', 'reject'] },
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
  // 서버가 거부하는 전환이라 확인 대화상자(임기 종료 안내) 앞에서 걸러 낸다 —
  // 일어나지 않을 일로 확인을 받으면 헛경고가 된다. 최종 판정은 서버가 그대로 한다.
  newcomerCannotGraduate: '수습회원은 바로 졸업생으로 변경할 수 없습니다. 준회원 또는 정회원을 거쳐 주세요.',
  confirmGraduate: (n) => `졸업생으로 변경하는 회원 ${n}명의 진행 중인 임원 임기가 종료됩니다. 임기 이력은 남으며 임원진 명단에서는 빠집니다. 계속할까요?`,
  confirmRemoveReregistration: (n) => `재등록 대상 ${n}명을 삭제합니다. 가입 반려와 달리 되돌릴 수 없습니다 — 임기·기여 이력이 있으면 이름과 이력만 남고 개인정보가 지워지며, 없으면 계정이 사라집니다. 계속할까요?`,
  noAssignPermission: '임원을 지정할 권한이 없습니다. 회장·부회장 또는 각 부처의 부장에게 요청해 주세요.',
  handoverPresident: '회장 자리를 넘기면 본인의 회장 임기가 함께 종료되어 임원 권한을 잃습니다. 계속할까요?',
  noAssignable: '지정할 수 있는 회원이 없습니다. 이미 임기가 있거나 졸업생인 회원은 목록에 나오지 않습니다.',
  noContribCandidate: '등록할 수 있는 회원이 없습니다. 이미 기여자로 등록된 회원은 목록에 나오지 않습니다.',
  seminarSaveFail: '세미나 내용을 저장하지 못했습니다.',
  attendanceFail: '출석 처리 중 오류가 발생했습니다.',
  noAttendee: '아직 출석한 회원이 없습니다.',
  noAttendCandidate: '출석 처리할 수 있는 회원이 없습니다. 이미 출석한 회원은 목록에 나오지 않습니다.',
  codeNotIssued: '아직 발급하지 않았습니다. 코드를 만들면 회원이 입력해 출석할 수 있습니다.',
  codeInUse: '회원이 이 코드를 입력하면 출석으로 기록됩니다.',
  codeAfterClose: '마감되어 이 코드로는 더 이상 출석할 수 없습니다.',
  attendanceOpen: '출석을 받는 중입니다.',
  closeAttendanceWarn: '마감하면 출석 시간이 남아 있어도 더 받지 않습니다. 되돌릴 수 없습니다.',
  attendanceClosedNote: '마감했습니다. 새로운 출석은 받지 않습니다.',
  gradTermsReadonly: '자람에서의 임원 이력은 임원진 탭에서 관리되어 여기서는 고칠 수 없습니다.',
  noCareer: '아직 등록된 이력이 없습니다. 아래에서 한 줄씩 더해 주세요.',
};

export const TOAST = {
  saved: (n) => `변경분 ${n}건이 저장되었습니다.`,
  // 직책마다 조사가 갈려(회장'으로' / 서버 관리자'로') '직책으로' 로 묶는다.
  assigned: (name, title) => `${name} 님을 ${title} 직책으로 지정했습니다.`,
  contribAdded: (name) => `${name} 님을 기여자로 등록했습니다.`,
  gradSaved: (name) => `${name} 님의 졸업생 정보를 저장했습니다.`,
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
  // 스터디 임원 관리 — 문구는 스터디 페이지 관리 탭에서 쓰던 것을 그대로 옮겼습니다.
  studyPublished: (title) => `‘${title}’을(를) 공개했습니다.`,
  studyRejected: '스터디 개설을 반려했습니다.',
  recruitmentOpened: '스터디 개설 신청을 받기 시작했습니다.',
  recruitmentClosed: '스터디 개설 신청을 닫았습니다.',
};

export const EMPTY = {
  noData: { title: '아직 등록된 항목이 없어요', desc: '상단에서 새 항목을 추가해 시작하세요.' },
  noResult: { title: '검색 결과가 없어요', desc: '검색어나 필터를 바꿔 보세요.' },
};

/**
 * 스터디 관리 상단 탭 (URL ?tab= 으로 상태화).
 *
 * 목록은 기존 표(TableView)를 그대로 쓰고, 승인 대기는 즉시 반영되는 단건
 * 액션이라 배치저장 모델에 맞지 않아 카드형 커스텀 뷰로 둡니다.
 *
 * 참여 신청자를 모든 스터디에 걸쳐 늘어놓던 탭은 없앴습니다. 목록의 '상세'
 * 모달이 스터디 한 건의 신청자와 스터디원을 함께 보여 주므로, 같은 일을 두
 * 자리에서 하고 있었습니다.
 */
export const STUDY_TABS = [
  { key: 'list', label: '목록' },
  {
    key: 'pending',
    label: '승인 대기',
    // 여기서 승인하는 대상은 '스터디'입니다. 사람을 승인하는 자리는 목록의
    // '상세' 모달이라, 설명도 그 차이만 말합니다.
    desc: '회원이 새로 만들겠다고 올린 스터디입니다. 승인 대상은 스터디이고, 승인하면 목록에 공개되어 모집이 시작됩니다. 반려하면 사유가 개설자에게 전달됩니다. 참여 신청자는 목록에서 스터디의 \'상세\'를 열어 처리합니다.',
  },
];

export const STUDY_EMPTY = {
  pending: '승인 대기 중인 스터디가 없습니다.',
};

/** 개설 신청 창 — 회원이 스터디 페이지에서 새 스터디를 올릴 수 있는지 가릅니다. */
export const STUDY_RECRUITMENT = {
  title: '스터디 개설 신청',
  on: '회원이 새 스터디를 올릴 수 있습니다.',
  off: '지금은 개설 신청을 받지 않습니다. 회원이 올리려 하면 거절됩니다.',
};

// 개발용 시드(SEED)는 없다 — 모든 리소스가 실 서버를 본다.
