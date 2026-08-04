/**
 * admin API — 순수 HTTP 계층. (DEVELOPMENT.md §5 · 기획.md §6)
 *
 * 별도 Spring 백엔드의 admin 엔드포인트 준비 여부가 아직 확정되지 않아, 기본값은
 * mock(SEED) 유지입니다. `.env`에 `VITE_ADMIN_MOCK=false` 를 설정하면 실 서버로
 * 전환됩니다(opt-in). 실 연동 시 아래 client.* 호출은 docs/api/openapi.yaml 과
 * 대조해 두었으니, 스펙이 바뀌면 함께 맞춰주세요.
 *
 * 책임
 *   - 요청 payload 정제: 빈 문자열→null, datetime-local→ISO-8601, 라벨→enum 키(toWire)
 *   - 응답 정제: enum 키→라벨(fromWire) 로 화면이 라벨만 다루게 함
 *   - 실패 계약: code 를 붙인 Error 로 던져 UI 가 필드/서버 에러를 구분 (기획.md §6)
 */
import { client } from '@/shared/api/client';
import { titleKey, titleLabel } from '@/shared/member/enums';
import {
  SEED, SETTINGS_SEED, RESOURCES,
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  APPLICATION_STATUS_LABEL,
  SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS, STUDY_STATUS_LABEL,
} from './admin.data';

// 기본값은 mock 유지(백엔드 확정 전). 실 서버로 붙이려면 .env 에 VITE_ADMIN_MOCK=false.
const USE_MOCK = import.meta.env.VITE_ADMIN_MOCK !== 'false';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// 백엔드 연동이 끝난 리소스 — USE_MOCK 여부와 무관하게 항상 실 서버를 쓴다.
const LIVE_RESOURCES = new Set(['member', 'exec', 'contrib', 'seminars', 'seminarApprovals', 'applications']);
const mocked = (resource) => USE_MOCK && !LIVE_RESOURCES.has(resource);

/**
 * 서버 에러 → code 를 붙인 Error (seminar.api.js checkAttendance 와 동일 규약).
 * 4xx 는 서버가 보낸 ErrorResponse.code(예: VALIDATION·NOT_FOUND)를 우선하고,
 * 없으면 호출부가 넘긴 fallback 코드를 쓴다. 5xx/네트워크 오류는 'SERVER'.
 */
function throwWireError(error, fallbackCode) {
  const status = error.response?.status;
  const data = error.response?.data;
  const code = status >= 400 && status < 500 ? data?.code || fallbackCode : 'SERVER';
  throw Object.assign(new Error(data?.message || '요청을 처리하지 못했습니다.'), {
    code,
    fieldErrors: data?.fieldErrors,
  });
}

/* ── enum 라벨 ↔ 와이어 키 매핑 ───────────────────────────────────────
 * 화면/스토어는 한글 라벨을 다루고, 서버는 enum 키를 주고받습니다.
 * 리소스별 어떤 필드가 어떤 맵을 쓰는지 선언합니다.
 */
const ENUM_FIELDS = {
  member: { grade: GRADE_LABEL, status: STATUS_LABEL },
  exec: { department: DEPARTMENT_LABEL },
  contrib: { grade: GRADE_LABEL },
  seminars: { status: SEMINAR_STATUS_LABELS, target: TARGET_GRADE_LABELS },
  studies: { status: STUDY_STATUS_LABEL },
  applications: { status: APPLICATION_STATUS_LABEL },
};
const flip = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

/* ── gen(기수) 라벨 ↔ 와이어 정수 ───────────────────────────────────
 * 백엔드 행 필드명은 gen (계약상 정수, 예 41). 화면은 '41기' 라벨을 다룹니다.
 * '41기'|'41' → 41. 비숫자('외부' 등)는 그대로 통과(계약 미정의 자유값).
 */
const GEN_RESOURCES = new Set(['member', 'exec', 'contrib', 'grad']);
const genToWire = (v) => {
  if (typeof v !== 'string') return v;
  const m = v.match(/^(\d{1,2})기?$/);
  return m ? Number(m[1]) : v;
};
const genFromWire = (v) => (typeof v === 'number' ? `${v}기` : v);

/** 서버 → 화면: enum 키를 한글 라벨로(배열 필드는 항목별로) + gen 정수→'N기'. */
export function fromWire(resource, row) {
  const fields = ENUM_FIELDS[resource];
  const hasGen = GEN_RESOURCES.has(resource);
  if ((!fields && !hasGen) || !row) return row;
  const out = { ...row };
  // 직책 라벨은 부서와 조합해 파생하므로(ACADEMIC+LEAD→'학술부장') 단순 맵이 아니다.
  // 부서가 아직 와이어 키인 지금 계산한다.
  if (resource === 'exec') out.title = titleLabel(out.title, out.department) ?? '';
  for (const [field, map] of Object.entries(fields || {})) {
    if (out[field] == null) continue;
    out[field] = Array.isArray(out[field])
      ? out[field].map((v) => map[v] ?? v)
      : (map[out[field]] ?? out[field]);
  }
  if (hasGen && out.gen != null) out.gen = genFromWire(out.gen);
  return out;
}

/** 화면 → 서버: 한글 라벨을 enum 키로(배열 필드는 항목별로) + gen 'N기'→정수 + 빈 문자열→null. */
export function toWire(resource, fields) {
  const maps = ENUM_FIELDS[resource] || {};
  const hasGen = GEN_RESOURCES.has(resource);
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    let val = v;
    if (resource === 'exec' && k === 'title') {
      val = titleKey(v); // 라벨 역인덱스. 비우면 null → 서버가 현직 임기를 종료한다.
    } else if (maps[k]) {
      const flipped = flip(maps[k]);
      val = Array.isArray(v) ? v.map((x) => flipped[x] ?? x) : (flipped[v] ?? v);
    } else if (hasGen && k === 'gen') val = genToWire(v);
    if (val === '') val = null;
    out[k] = val;
  }
  return out;
}

/* ── 목록 조회 (검색·필터·정렬·페이지) ─────────────────────────────── */
export async function fetchList(resource, params = {}) {
  if (mocked(resource)) {
    await delay(200);
    return mockList(resource, params);
  }
  if (resource === 'member') return fetchMembers(params);
  if (resource === 'exec') return fetchExecs(params);
  if (resource === 'contrib') return fetchContribs(params);
  if (resource === 'applications') return fetchPendingApplications(params);
  if (resource === 'seminarApprovals') return fetchPendingSeminarApprovals(params);
  if (resource === 'seminars') return fetchSeminars(params);
  // GET /api/admin/{resource}?tab=&q=&grade=&gen=&status=&sort=&page=&size= (AdminListResponse)
  const { path } = RESOURCES[resource];
  const query = toListQuery(resource, params);
  const { data } = await client.get(`/api/admin/${path}`, { params: query });
  return { ...data, items: (data.items || []).map((r) => fromWire(resource, r)) };
}

/**
 * 세미나 목록. 서버가 상태 필터를 보지 않으므로(AdminResourceService.list) 전체를 받아
 * 이 계층에서 검색·필터·정렬·페이지를 처리한다 — 다른 목록들과 같은 이유다.
 * 표의 '일시' 칸은 서버가 파생해 준 표시값(month/day/weekday/time)을 이어 붙이고,
 * 원본 ISO 는 startsAtIso 로 남겨 둔다(상세 모달이 쓴다).
 */
async function fetchSeminars(params = {}) {
  const { data } = await client.get('/api/admin/seminars', {
    params: { page: 1, size: ALL_ROWS_SIZE },
  });
  const rows = (data.items || []).map((s) => ({
    ...fromWire('seminars', s),
    startsAtIso: s.startsAt,
    startsAt: s.startsAt ? `${s.month} ${s.day}일 (${s.weekday}) ${s.time}` : '',
  }));
  // '일시'로 정렬할 때는 표시값('6월 30일…')이 아니라 ISO 로 비교해야 달이 넘어가도 맞는다.
  if (params.sort?.startsWith('startsAt,')) {
    const dir = params.sort.endsWith(',desc') ? -1 : 1;
    const { sort: _sort, ...rest } = params;
    return queryLocally(
      [...rows].sort((a, b) => dir * String(a.startsAtIso).localeCompare(String(b.startsAtIso))),
      rest,
    );
  }
  return queryLocally(rows, params);
}

/** 서버가 페이지를 나눠주지 않는 목록을 한 번에 받을 때 쓰는 넉넉한 size. */
const ALL_ROWS_SIZE = 1000;

/**
 * 회원 명단(member 탭). 서버 목록은 tab·q·sort·page 만 처리하고 등급·기수·상태
 * 필터는 무시하므로(BE AdminResourceService.list), 필터가 조용히 먹통이 되지 않도록
 * 전체를 받아 검색·필터·정렬·페이지를 이 계층에서 처리한다. 회원 규모(수백)에서 안전하다.
 * 승인 대기·반려 회원은 '가입 신청·승인' 화면이 다루므로 명단에서 뺀다.
 */
async function fetchMembers(params = {}) {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'member', page: 1, size: ALL_ROWS_SIZE },
  });
  const rows = (data.items || [])
    .filter((m) => m.approval === 'APPROVED')
    .map((m) => fromWire('member', m));
  return queryLocally(rows, params);
}

/**
 * 임원진 명단(exec 탭) — 현직 임기가 있는 회원. member 탭과 같은 이유로 서버가
 * 부서 필터를 보지 않으므로 전체를 받아 이 계층에서 검색·필터·정렬·페이지를 처리한다.
 * '임기' 칸은 서버의 termStartGen(현직 임기 시작 기수)에서 파생한 표시 전용 값이다.
 */
async function fetchExecs(params = {}) {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'exec', page: 1, size: ALL_ROWS_SIZE },
  });
  const rows = (data.items || []).map((m) => ({
    ...fromWire('exec', m),
    term: m.termStartGen == null ? '' : `${m.termStartGen}기~`,
  }));
  return queryLocally(rows, params);
}

/**
 * 기여자 명단(contrib 탭) — 임원 이력이 있거나 직접 등록된 회원. member·exec 탭과
 * 같은 이유로 서버가 등급 필터를 보지 않으므로 전체를 받아 이 계층에서 검색·필터·
 * 정렬·페이지를 처리한다. '직책 이력' 칸은 서버가 내려주는 마지막 임기에서 파생한
 * 표시 전용 값이다 — 끝난 임기면 '전 ' 을 붙이고, 임기가 없으면(직접 등록) '—'.
 */
async function fetchContribs(params = {}) {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'contrib', page: 1, size: ALL_ROWS_SIZE },
  });
  const rows = (data.items || []).map((m) => ({
    ...fromWire('contrib', m),
    role: roleLabel(m),
  }));
  return queryLocally(rows, params);
}

/** 마지막 임기(현직 우선) → '학술부장' | '전 학술부장' | '—'. */
function roleLabel(m) {
  const label = titleLabel(m.termTitle, m.termDepartment);
  if (!label) return '—';
  return m.termEndGen == null ? label : `전 ${label}`;
}

/**
 * 임원으로 지정할 수 있는 회원 — 현직 임기가 없고 졸업생(OB)도 아닌 승인 회원.
 * 지정 모달의 목록이라 페이지를 나누지 않고 한 번에 받는다.
 */
export async function fetchAssignableMembers() {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'member', page: 1, size: ALL_ROWS_SIZE },
  });
  return (data.items || [])
    .filter((m) => m.approval === 'APPROVED' && m.grade !== 'OB' && !m.title)
    .map((m) => ({
      id: m.id,
      name: m.name,
      studentId: m.studentId,
      gen: genFromWire(m.gen),
      faculty: m.faculty || '',
      version: m.version,
    }));
}

/**
 * 기여자로 등록할 수 있는 회원 — 아직 기여자가 아닌 승인 회원.
 * 임원 지정 후보와 달리 졸업생(OB)을 빼지 않는다 — 졸업한 선배야말로 기여자로
 * 등록할 대상이다. 등록 모달의 목록이라 페이지를 나누지 않고 한 번에 받는다.
 */
export async function fetchContribCandidates() {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'member', page: 1, size: ALL_ROWS_SIZE },
  });
  return (data.items || [])
    .filter((m) => m.approval === 'APPROVED' && !m.contributor)
    .map((m) => ({
      id: m.id,
      name: m.name,
      studentId: m.studentId,
      gen: genFromWire(m.gen),
      faculty: m.faculty || '',
      version: m.version,
    }));
}

/**
 * 회원 상세 (GET /api/admin/members/{id}). 조회 전용 — 수정은 표의 일괄 저장이 유일한 경로다.
 * grade·status·gen 은 fromWire 로 화면 라벨이 되지만, department·title·terms[] 는
 * 항목마다 부서가 달라 라벨이 (부서, 직책) 조합으로 파생되므로 렌더 시점에 titleLabel 로 처리한다.
 */
export async function fetchMemberDetail(id) {
  try {
    const { data } = await client.get(`/api/admin/members/${id}`);
    return fromWire('member', data);
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

/**
 * applications 는 AdminResource(members/seminars/studies)에 없는 큐 모델이라
 * 전용 엔드포인트를 쓴다: GET /api/admin/members/pending → PendingMember[]
 * (페이지네이션 없음). 화면 스키마(admin.data SCHEMAS.applications)에 맞춰 정제하고,
 * 검색·정렬·페이지는 이 계층에서 처리한다.
 */
async function fetchPendingApplications(params = {}) {
  const { data } = await client.get('/api/admin/members/pending');
  const rows = (data || []).map((m) => ({
    id: m.id,
    name: m.name,
    studentId: m.studentId,
    appliedAt: (m.createdAt || '').slice(0, 10),
    status: APPLICATION_STATUS_LABEL.PENDING,
  }));
  return queryLocally(rows, params);
}

/**
 * seminarApprovals도 applications와 같은 이유로 전용 엔드포인트를 쓴다:
 * GET /api/admin/seminars/pending → Seminar[] (officer 전용 조회). /api/admin/seminars 는
 * {resource} 일반 목록에 걸려 승인상태로 걸러지지 않으므로 쓰면 안 된다.
 * 화면 스키마(admin.data SCHEMAS.seminarApprovals)에 맞춰 정제하고, 검색·정렬·페이지는
 * 이 계층에서 처리한다.
 */
async function fetchPendingSeminarApprovals(params = {}) {
  const { data } = await client.get('/api/admin/seminars/pending');
  const rows = (data || []).map((s) => ({
    id: s.id,
    title: s.title,
    speaker: s.speaker,
    topic: s.topic,
    startsAt: `${s.month} ${s.day}일 ${s.time}`,
    status: APPLICATION_STATUS_LABEL.PENDING,
  }));
  return queryLocally(rows, params);
}

/**
 * 서버가 검색·필터·정렬·페이지를 지원하지 않는 목록에 그것들을 얹는다.
 * 행은 이미 화면 표현(한글 라벨)이므로 filters 값도 라벨 그대로 비교한다.
 */
function queryLocally(rows, { q = '', filters = {}, sort, page = 1, size = 8 } = {}) {
  const needle = String(q).trim().toLowerCase();
  let out = needle
    ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(needle)))
    : rows.slice();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== '전체') out = out.filter((r) => String(r[k]) === v);
  });
  if (sort) {
    const [key, dir] = sort.split(',');
    out.sort((a, b) => {
      const av = a[key], bv = b[key];
      const an = parseFloat(String(av).replace(/[^0-9.-]/g, ''));
      const bn = parseFloat(String(bv).replace(/[^0-9.-]/g, ''));
      const numeric = !isNaN(an) && !isNaN(bn) && /[0-9]/.test(String(av)) && /[0-9]/.test(String(bv));
      const cmp = numeric ? an - bn : String(av).localeCompare(String(bv), 'ko');
      return dir === 'desc' ? -cmp : cmp;
    });
  }
  const total = out.length;
  const start = (page - 1) * size;
  return { items: out.slice(start, start + size), page, size, total };
}

/** searchParams → 서버 쿼리. tab 은 members 계열에서 리소스 구분에 사용. */
function toListQuery(resource, p) {
  const q = { q: p.q || undefined, page: p.page || 1, size: p.size || 8 };
  if (p.sort) q.sort = p.sort; // 'name,asc'
  if (RESOURCES[resource].tab) q.tab = RESOURCES[resource].tab;
  (p.filters ? Object.entries(p.filters) : []).forEach(([k, v]) => {
    if (v && v !== '전체') q[k] = toWire(resource, { [k]: v })[k];
  });
  return q;
}

/* ── 일괄 저장 (핵심 — 변경분 모아 저장) ─────────────────────────────
 * body { updates:[{id,fields,version}], creates:[{tempId,fields}], deletes:[id] }
 * → { updated, created:[{tempId,id}], deleted, conflicts?, errors? }  (부분 성공)
 */
export async function saveBatch(resource, { updates = [], creates = [], deletes = [] }) {
  const body = {
    updates: updates.map((u) => ({ id: u.id, version: u.version, fields: toWire(resource, u.fields) })),
    creates: creates.map((c) => ({ tempId: c.tempId, fields: toWire(resource, c.fields) })),
    deletes,
  };
  if (mocked(resource)) {
    await delay(600);
    return mockBatch(resource, body);
  }
  if (resource === 'applications') return saveApplicationsQueue(updates, deletes);
  if (resource === 'seminarApprovals') return saveSeminarApprovalsQueue(updates, deletes);
  // PATCH /api/admin/{resource}:batch (AdminBatchRequest → AdminBatchResponse, 부분 성공)
  const { path } = RESOURCES[resource];
  try {
    const { data } = await client.patch(`/api/admin/${path}:batch`, body);
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/**
 * applications 는 AdminResource(members/seminars/studies)에 없어 batch 대상이
 * 아니다. 화면에서 스테이지된 승인/반려(status 필드 변경)를 단건 승인/반려
 * 엔드포인트 호출로 변환해 순차 처리한다. 수기 등록(creates)·삭제(deletes)는 대응하는
 * 엔드포인트가 없어 지원하지 않는다 — 화면에서도 추가 버튼을 두지 않는다(SCHEMAS.applications).
 */
async function saveApplicationsQueue(updates, deletes) {
  const updated = [];
  const errors = [];
  for (const u of updates) {
    const status = u.fields?.status;
    try {
      if (status === APPLICATION_STATUS_LABEL.APPROVED) await approveApplication(u.id);
      else if (status === APPLICATION_STATUS_LABEL.REJECTED) await rejectApplication(u.id, u.fields?.reason || '관리자 반려');
      else continue;
      updated.push({ id: u.id });
    } catch (error) {
      errors.push({ id: u.id, fieldErrors: { status: error.message } });
    }
  }
  deletes.forEach((id) => errors.push({ id, fieldErrors: { _: '가입 신청은 삭제를 지원하지 않습니다.' } }));
  return { updated, created: [], deleted: [], conflicts: [], errors };
}

/**
 * seminarApprovals도 applications와 같은 이유로 batch 대상이 아니다(큐 모델이라
 * AdminResource 배치 엔드포인트가 없음). 화면에서 스테이지된 승인/반려(status 필드
 * 변경)를 단건 승인/반려 엔드포인트 호출로 변환해 순차 처리한다.
 */
async function saveSeminarApprovalsQueue(updates, deletes) {
  const updated = [];
  const errors = [];
  for (const u of updates) {
    const status = u.fields?.status;
    try {
      if (status === APPLICATION_STATUS_LABEL.APPROVED) await approveSeminar(u.id);
      else if (status === APPLICATION_STATUS_LABEL.REJECTED) await rejectSeminar(u.id, u.fields?.reason || '관리자 반려');
      else continue;
      updated.push({ id: u.id });
    } catch (error) {
      errors.push({ id: u.id, fieldErrors: { status: error.message } });
    }
  }
  deletes.forEach((id) => errors.push({ id, fieldErrors: { _: '세미나 승인 대기열은 삭제를 지원하지 않습니다.' } }));
  return { updated, created: [], deleted: [], conflicts: [], errors };
}

/**
 * 임원 지정 — 회원 한 명에게 (부서, 직책) 임기를 준다. 표의 모아 저장과 달리 즉시 커밋한다.
 * department·title 은 이미 와이어 키라 라벨을 받는 saveBatch/toWire 를 거치지 않고 직접 조립한다.
 * handoverFrom 이 있으면(회장 인계) 그 사람의 임기를 같은 요청에서 함께 끝낸다.
 *
 * 배치는 행이 실패해도 200 + errors[] 로 돌아오므로 여기서 열어보고 실패면 던진다.
 */
export async function assignExec({ member, department, title, handoverFrom }) {
  const updates = [{ id: member.id, version: member.version, fields: { department, title } }];
  if (handoverFrom) updates.push({ id: handoverFrom, version: null, fields: { department: null, title: null } });
  let data;
  try {
    ({ data } = await client.patch('/api/admin/members:batch', { updates, creates: [], deletes: [] }));
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
  const failed = [...(data.conflicts || []), ...(data.errors || [])];
  if (failed.length) {
    const first = failed[0];
    const message = first.message || Object.values(first.fieldErrors || {})[0] || '임원으로 지정하지 못했습니다.';
    throw Object.assign(new Error(message), { code: first.message ? 'CONFLICT' : 'VALIDATION' });
  }
  return data;
}

/**
 * 기여자 등록 — 회원 한 명의 기여자 플래그를 켠다. 표의 모아 저장과 달리 즉시 커밋한다.
 * 해제는 반대로 표에서 스테이지했다가 일괄 저장으로 커밋한다(TableView 의 uncontrib).
 *
 * 배치는 행이 실패해도 200 + errors[] 로 돌아오므로 여기서 열어보고 실패면 던진다.
 */
export async function addContributor({ member }) {
  const updates = [{ id: member.id, version: member.version, fields: { contributor: true } }];
  let data;
  try {
    ({ data } = await client.patch('/api/admin/members:batch', { updates, creates: [], deletes: [] }));
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
  const failed = [...(data.conflicts || []), ...(data.errors || [])];
  if (failed.length) {
    const first = failed[0];
    const message = first.message || Object.values(first.fieldErrors || {})[0] || '기여자로 등록하지 못했습니다.';
    throw Object.assign(new Error(message), { code: first.message ? 'CONFLICT' : 'VALIDATION' });
  }
  return data;
}

/* ── 단건 · 액션 ─────────────────────────────────────────────────────── */
export async function approveApplication(id) {
  try {
    // 등급은 가입 신청 때 이미 정해져 있다(신입생→NEWCOMER, 재학생→ASSOCIATE). 승인은 승인축만 바꾼다.
    const { data } = await client.post(`/api/admin/members/${id}/approve`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
export async function rejectApplication(id, reason) {
  try {
    // RejectRequest.reason 필수 (openapi).
    const { data } = await client.post(`/api/admin/members/${id}/reject`, { reason });
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/* ── 세미나 상세 · 출석 관리 ────────────────────────────────────────────
 * 표의 모아 저장과 달리 모두 즉시 커밋한다. 출석 코드·마감·수기 출석은 그 자리에서
 * 효력이 생겨야 하는 일이라 저장을 기다릴 성질이 아니다.
 */

/**
 * 세미나 개설 — 일정(Schedule)에 매이지 않은 세미나를 임원이 직접 연다.
 * 배치 생성(POST …:batch)이 아니라 POST /api/seminars 를 쓴다 — 배치로 만든 세미나는
 * 승인 대기로 남고 설명·자료 링크도 받지 않지만, 이 경로는 서버가 개설과 동시에
 * 승인해 바로 공개 목록에 올린다. 출석 코드는 보내지 않는다(상세 모달에서 발급).
 */
export async function createSeminar(form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    startsAt: new Date(form.startsAt).toISOString(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    place: opt(form.place),
    mode: opt(form.mode),
    description: opt(form.description),
    materialUrl: opt(form.materialUrl),
  };
  try {
    const { data } = await client.post('/api/seminars', payload);
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/**
 * 상세 모달의 내용 저장 — 행 하나짜리 배치. 배치는 행이 실패해도 200 + errors[] 로
 * 돌아오므로 여기서 열어보고 실패면 던진다(assignExec 과 같은 규약).
 */
export async function saveSeminarDetail({ id, version, fields }) {
  let data;
  try {
    ({ data } = await client.patch('/api/admin/seminars:batch', {
      updates: [{ id, version, fields: toWire('seminars', fields) }],
      creates: [],
      deletes: [],
    }));
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
  const failed = [...(data.conflicts || []), ...(data.errors || [])];
  if (failed.length) {
    const first = failed[0];
    const message = first.message || Object.values(first.fieldErrors || {})[0] || '저장하지 못했습니다.';
    throw Object.assign(new Error(message), { code: first.message ? 'CONFLICT' : 'VALIDATION' });
  }
  return data;
}

/** 출석 코드 발급 — 누르는 즉시 서버에 저장된다. 다시 부르면 이전 코드는 못 쓴다. */
export async function generateAttendanceCode(id) {
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/attendance-code`);
    return data; // { attendanceCode }
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

/** 출석 마감 — 출석창이 남아 있어도 지금부터 받지 않는다. */
export async function closeSeminarAttendance(id) {
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/close-attendance`);
    return data; // Seminar
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

export async function fetchSeminarAttendees(id) {
  const { data } = await client.get(`/api/admin/seminars/${id}/attendees`);
  return data; // { title, cap, list: [{ memberId, name, sid, at }] }
}

/** 수기 출석 처리 — 코드를 놓친 회원을 임원이 직접 명단에 넣는다. */
export async function addSeminarAttendee({ id, memberId }) {
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/attendees`, { memberId });
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

export async function removeSeminarAttendee({ id, memberId }) {
  try {
    const { data } = await client.delete(`/api/admin/seminars/${id}/attendees/${memberId}`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

/**
 * 수기 출석 처리 후보 — 승인된 회원 전체. 임원 지정 후보와 달리 임기·등급으로 거르지
 * 않는다(졸업생도 세미나를 들으러 올 수 있다). 이미 출석한 회원은 호출부가 뺀다.
 */
export async function fetchAttendanceCandidates() {
  const { data } = await client.get('/api/admin/members', {
    params: { tab: 'member', page: 1, size: ALL_ROWS_SIZE },
  });
  return (data.items || [])
    .filter((m) => m.approval === 'APPROVED')
    .map((m) => ({
      id: m.id,
      name: m.name,
      studentId: m.studentId,
      gen: genFromWire(m.gen),
      faculty: m.faculty || '',
    }));
}

export async function approveSeminar(id) {
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/approve`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
export async function rejectSeminar(id, reason) {
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/reject`, { reason });
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/* ── 일정(Schedule) 관리 ────────────────────────────────────────────────────────────────────
 * 슬롯별 개별 액션(해제)이 필요해 TableView 배치저장 모델에 안 맞는다 — 즉시 반영되는
 * 단건 액션으로 구현한다. 목록 조회는 공개 GET과 같은 데이터를 admin 전용 화면에서
 * 다시 쓰는 것뿐이라 별도 admin 전용 조회 엔드포인트를 만들지 않는다.
 * 백엔드 연동 완료로 USE_MOCK 여부와 무관하게 항상 실 서버를 쓴다.
 */
export async function fetchSchedules() {
  const { data } = await client.get('/api/schedules');
  return data;
}

export async function createSchedule(payload) {
  try {
    const { data } = await client.post('/api/admin/schedules', payload);
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

export async function lockSchedule(id) {
  try {
    const { data } = await client.patch(`/api/admin/schedules/${id}/lock`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

export async function unlockSchedule(id) {
  try {
    const { data } = await client.patch(`/api/admin/schedules/${id}/unlock`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

/** 일정 삭제 — 슬롯이 모두 비어 있을 때만. 남아 있으면 서버가 409(CONFLICT). */
export async function deleteSchedule(id) {
  try {
    const { data } = await client.delete(`/api/admin/schedules/${id}`);
    return data;
  } catch (error) {
    throwWireError(error, 'CONFLICT');
  }
}

export async function forceUnassignSlot(scheduleId, index) {
  try {
    const { data } = await client.delete(`/api/admin/schedules/${scheduleId}/slots/${index}`);
    return data;
  } catch (error) {
    throwWireError(error, 'CONFLICT');
  }
}

/* ── 대시보드 · 설정 · 내보내기 ─────────────────────────────────────── */
// 백엔드 연동 완료(AdminDashboardController) — USE_MOCK 여부와 무관하게 항상 실 서버.
export async function fetchDashboardStats() {
  const { data } = await client.get('/api/admin/dashboard/stats');
  return data; // DashboardStats
}

export async function fetchSettings() {
  if (USE_MOCK) { await delay(200); return SETTINGS_SEED; }
  const { data } = await client.get('/api/admin/settings');
  return data;
}
export async function saveSettings(payload) {
  if (USE_MOCK) { await delay(400); return { ...SETTINGS_SEED, ...payload }; }
  // AdminSettingsUpdate 계약은 semester·currentGen·autoPromote 만 받는다
  // (driveConnected 는 서버가 Drive 연동 여부로 관리 — 이 엔드포인트로 보내지 않는다).
  const { semester, currentGen, autoPromote } = payload;
  try {
    const { data } = await client.patch('/api/admin/settings', { semester, currentGen, autoPromote });
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/** 현재 필터/정렬을 반영한 스프레드시트 생성 → { fileUrl, fileId }. */
export async function exportToDrive(resource, { filters, columns } = {}) {
  if (USE_MOCK) { await delay(500); return { fileUrl: '#', fileId: 'mock-file' }; }
  try {
    const { data } = await client.post('/api/admin/export/google-drive', { resource: RESOURCES[resource].path, filters, columns });
    return data;
  } catch (error) {
    throwWireError(error, 'FORBIDDEN');
  }
}

/* ── 개발용 mock 구현 (USE_MOCK 전용 — 백엔드 연동 시 통째로 삭제) ───── */
function mockList(resource, params) {
  return queryLocally(SEED[resource] || [], params);
}

function mockBatch(resource, body) {
  // 실제 서버는 여기서 검증·충돌·부분성공을 판정합니다. mock 은 전부 성공 처리.
  return {
    updated: body.updates.map((u) => ({ id: u.id })),
    created: body.creates.map((c, i) => ({ tempId: c.tempId, id: 'srv-' + Date.now() + '-' + i })),
    deleted: body.deletes,
    conflicts: [],
    errors: [],
  };
}
