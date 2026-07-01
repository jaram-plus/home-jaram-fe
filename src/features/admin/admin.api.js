/**
 * admin API — 순수 HTTP 계층. (DEVELOPMENT.md §5 · 기획.md §6)
 *
 * 지금은 USE_MOCK=true 라 SEED 를 돌려주어 백엔드 없이도 화면이 동작합니다.
 * 백엔드(Swagger) 확정 후:
 *   1) USE_MOCK=false 로 바꾸거나 VITE_ADMIN_MOCK 환경변수로 제어하고,
 *   2) 아래 client.* 호출의 경로·필드를 실제 스펙과 대조해 맞춥니다.
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
  SEMINAR_STATUS_LABEL, STUDY_STATUS_LABEL,
} from './admin.data';

// 백엔드가 준비되면 false 로. (Vite 환경변수로 제어하려면 아래 한 줄로 교체)
// const USE_MOCK = import.meta.env.VITE_ADMIN_MOCK !== 'false';
const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── enum 라벨 ↔ 와이어 키 매핑 ───────────────────────────────────────
 * 화면/스토어는 한글 라벨을 다루고, 서버는 enum 키를 주고받습니다.
 * 리소스별 어떤 필드가 어떤 맵을 쓰는지 선언합니다.
 */
const ENUM_FIELDS = {
  member: { grade: GRADE_LABEL, status: STATUS_LABEL },
  exec: { department: DEPARTMENT_LABEL },
  seminars: { status: SEMINAR_STATUS_LABEL },
  studies: { status: STUDY_STATUS_LABEL },
  applications: { status: APPLICATION_STATUS_LABEL },
};
const flip = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

/** 서버 → 화면: enum 키를 한글 라벨로. */
export function fromWire(resource, row) {
  const fields = ENUM_FIELDS[resource];
  if (!fields || !row) return row;
  const out = { ...row };
  for (const [field, map] of Object.entries(fields)) {
    if (out[field] != null && map[out[field]]) out[field] = map[out[field]];
  }
  return out;
}

/** 화면 → 서버: 한글 라벨을 enum 키로 + 빈 문자열→null. */
export function toWire(resource, fields) {
  const maps = ENUM_FIELDS[resource] || {};
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    let val = v;
    if (maps[k]) val = flip(maps[k])[v] ?? v;
    if (val === '') val = null;
    out[k] = val;
  }
  return out;
}

/* ── 목록 조회 (검색·필터·정렬·페이지) ───────────────────────────────── */
export async function fetchList(resource, params = {}) {
  if (USE_MOCK) {
    await delay(200);
    return mockList(resource, params);
  }
  const { path } = RESOURCES[resource];
  const query = toListQuery(resource, params);
  // GET /api/admin/members?tab=&q=&grade=&cohort=&status=&sort=&page=&size=
  // 주의: applications 는 큐 모델 — 실제 목록은 GET /api/admin/members/pending (PendingMember[]).
  const { data } = await client.get(`/api/admin/${path}`, { params: query });
  return { ...data, items: (data.items || []).map((r) => fromWire(resource, r)) };
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
  if (USE_MOCK) {
    await delay(600);
    return mockBatch(resource, body);
  }
  const { path } = RESOURCES[resource];
  const { data } = await client.patch(`/api/admin/${path}:batch`, body);
  return data;
}

/* ── 단건 · 액션 ─────────────────────────────────────────────────────── */
export async function approveApplication(id) {
  if (USE_MOCK) { await delay(400); return { ok: true, id }; }
  // 승인 시 서버가 gen 파생(gen==현재년도-1984→NEWCOMER, 그 외 ASSOCIATE)으로 등급 부여 후 status=ACTIVE.
  const { data } = await client.post(`/api/admin/members/${id}/approve`);
  return data;
}
export async function rejectApplication(id, reason) {
  if (USE_MOCK) { await delay(300); return { ok: true, id }; }
  // RejectRequest.reason 필수 (openapi).
  const { data } = await client.post(`/api/admin/members/${id}/reject`, { reason });
  return data;
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
  const { data } = await client.patch('/api/admin/settings', payload);
  return data;
}

/** 현재 필터/정렬을 반영한 스프레드시트 생성 → { fileUrl, fileId }. */
export async function exportToDrive(resource, { filters, columns } = {}) {
  if (USE_MOCK) { await delay(500); return { fileUrl: '#', fileId: 'mock-file' }; }
  const { data } = await client.post('/api/admin/export/google-drive', { resource: RESOURCES[resource].path, filters, columns });
  return data;
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
