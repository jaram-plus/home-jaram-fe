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
import {
  SEED, DASHBOARD_SEED, SETTINGS_SEED, RESOURCES,
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  APPLICATION_STATUS_LABEL,
  SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS, STUDY_STATUS_LABEL,
} from './admin.data';

// 기본값은 mock 유지(백엔드 확정 전). 실 서버로 붙이려면 .env 에 VITE_ADMIN_MOCK=false.
const USE_MOCK = import.meta.env.VITE_ADMIN_MOCK !== 'false';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
  seminars: { status: SEMINAR_STATUS_LABELS, target: TARGET_GRADE_LABELS },
  studies: { status: STUDY_STATUS_LABEL },
  applications: { status: APPLICATION_STATUS_LABEL },
};
const flip = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

/* ── gen(기수) 라벨 ↔ 와이어 정수 ───────────────────────────────────
 * 백엔드 행 필드명은 gen (계약상 정수, 예 41). 화면은 '41기' 라벨을 다룹니다.
 * '41기'|'41' → 41. 비숫자('외부' 등)는 그대로 통과(계약 미정의 자유값).
 */
const GEN_RESOURCES = new Set(['member', 'exec', 'contrib', 'graduate']);
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
    if (maps[k]) {
      const flipped = flip(maps[k]);
      val = Array.isArray(v) ? v.map((x) => flipped[x] ?? x) : (flipped[v] ?? v);
    } else if (hasGen && k === 'gen') val = genToWire(v);
    if (val === '') val = null;
    out[k] = val;
  }
  return out;
}

/* ── 목록 조회 (검색·필터·정렬·페이지) ─────────────────────────────────
 * seminars·seminarApprovals는 백엔드 연동 완료로 USE_MOCK 여부와 무관하게 항상 실 서버를 쓴다.
 */
export async function fetchList(resource, params = {}) {
  if (USE_MOCK && resource !== 'seminars' && resource !== 'seminarApprovals') {
    await delay(200);
    return mockList(resource, params);
  }
  if (resource === 'applications') return fetchPendingApplications(params);
  if (resource === 'seminarApprovals') return fetchPendingSeminarApprovals(params);
  // GET /api/admin/{resource}?tab=&q=&grade=&gen=&status=&sort=&page=&size= (AdminListResponse)
  const { path } = RESOURCES[resource];
  const query = toListQuery(resource, params);
  const { data } = await client.get(`/api/admin/${path}`, { params: query });
  return { ...data, items: (data.items || []).map((r) => fromWire(resource, r)) };
}

/**
 * applications 는 AdminResource(members/seminars/studies)에 없는 큐 모델이라
 * 전용 엔드포인트를 쓴다: GET /api/admin/members/pending → PendingMember[]
 * (페이지네이션 없음). 화면 스키마(admin.data SCHEMAS.applications)에 맞춰 정제하고,
 * 검색·페이지는 이 계층에서 처리한다.
 */
async function fetchPendingApplications({ q = '', page = 1, size = 8 } = {}) {
  const { data } = await client.get('/api/admin/members/pending');
  const rows = (data || []).map((m) => ({
    id: m.id,
    name: m.name,
    studentId: m.studentId,
    appliedAt: (m.createdAt || '').slice(0, 10),
    status: APPLICATION_STATUS_LABEL.PENDING,
  }));
  return paginate(rows, { q, page, size });
}

/**
 * seminarApprovals도 applications와 같은 이유로 전용 엔드포인트를 쓴다:
 * GET /api/admin/seminars?approvalStatus=PENDING → Seminar[] (officer 전용 조회).
 * 화면 스키마(admin.data SCHEMAS.seminarApprovals)에 맞춰 정제하고, 검색·페이지는
 * 이 계층에서 처리한다.
 */
async function fetchPendingSeminarApprovals({ q = '', page = 1, size = 8 } = {}) {
  const { data } = await client.get('/api/admin/seminars', { params: { approvalStatus: 'PENDING' } });
  const rows = (data || []).map((s) => ({
    id: s.id,
    title: s.title,
    speaker: s.speaker,
    topic: s.topic,
    startsAt: `${s.month} ${s.day}일 ${s.time}`,
    status: APPLICATION_STATUS_LABEL.PENDING,
  }));
  return paginate(rows, { q, page, size });
}

/** 서버가 페이지네이션을 지원하지 않는 목록에 검색·페이지를 얹는다. */
function paginate(rows, { q = '', page = 1, size = 8 }) {
  const needle = String(q).trim().toLowerCase();
  const filtered = needle
    ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(needle)))
    : rows;
  const total = filtered.length;
  const start = (page - 1) * size;
  return { items: filtered.slice(start, start + size), page, size, total };
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
  if (USE_MOCK && resource !== 'seminars' && resource !== 'seminarApprovals') {
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
 * 엔드포인트 호출로 변환해 순차 처리한다. 수기 등록(creates)·삭제(deletes)는
 * 대응하는 엔드포인트가 없어 아직 지원하지 않는다(스펙 확정 시 반영).
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

/* ── 단건 · 액션 ─────────────────────────────────────────────────────── */
export async function approveApplication(id) {
  if (USE_MOCK) { await delay(400); return { ok: true, id }; }
  try {
    // 승인 시 서버가 gen 파생(gen==현재년도-1984→NEWCOMER, 그 외 ASSOCIATE)으로 등급 부여 후 status=ACTIVE.
    const { data } = await client.post(`/api/admin/members/${id}/approve`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
export async function rejectApplication(id, reason) {
  if (USE_MOCK) { await delay(300); return { ok: true, id }; }
  try {
    // RejectRequest.reason 필수 (openapi).
    const { data } = await client.post(`/api/admin/members/${id}/reject`, { reason });
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
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

export async function forceUnassignSlot(scheduleId, index) {
  try {
    const { data } = await client.delete(`/api/admin/schedules/${scheduleId}/slots/${index}`);
    return data;
  } catch (error) {
    throwWireError(error, 'CONFLICT');
  }
}

/* ── 대시보드 · 설정 · 내보내기 ─────────────────────────────────────── */
export async function fetchDashboardStats() {
  if (USE_MOCK) { await delay(250); return DASHBOARD_SEED; }
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
function mockList(resource, { q = '', filters = {}, sort, page = 1, size = 8 }) {
  let rows = (SEED[resource] || []).slice();
  const needle = String(q).trim().toLowerCase();
  if (needle) {
    rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(needle)));
  }
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== '전체') rows = rows.filter((r) => String(r[k]) === v);
  });
  if (sort) {
    const [key, dir] = sort.split(',');
    rows.sort((a, b) => {
      const av = a[key], bv = b[key];
      const an = parseFloat(String(av).replace(/[^0-9.-]/g, ''));
      const bn = parseFloat(String(bv).replace(/[^0-9.-]/g, ''));
      const numeric = !isNaN(an) && !isNaN(bn) && /[0-9]/.test(String(av)) && /[0-9]/.test(String(bv));
      const cmp = numeric ? an - bn : String(av).localeCompare(String(bv), 'ko');
      return dir === 'desc' ? -cmp : cmp;
    });
  }
  const total = rows.length;
  const start = (page - 1) * size;
  return { items: rows.slice(start, start + size), page, size, total };
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
