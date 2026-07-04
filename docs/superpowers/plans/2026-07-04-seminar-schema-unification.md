# 세미나 스키마 통일 (admin ↔ seminar) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `src/features/admin`'s seminar tab and `src/features/seminar`'s member-facing seminar page share one canonical field set, status labels, and target-grade enum, backed by an extended `docs/api/openapi.yaml` contract.

**Architecture:** New `src/shared/seminar/enums.js` module (status labels + target-grade labels, same pattern as `src/shared/member/enums.js`) becomes the single source both features import. `admin.data.js`/`admin.api.js`/`admin.validation.js` are rewritten to match the real `Seminar`/`SeminarCreateRequest` openapi shape instead of their old mock-era fields. A new `multiselect` column type is added to the generic admin table so `target` (array of grade keys) can be edited inline.

**Tech Stack:** React 19, Vite, TanStack Query v5, Zustand, Zod, axios — no test framework in this repo (confirmed: no vitest/jest dependency, zero `*.test.*`/`*.spec.*` files). Verification uses `npm run lint`, `npm run typecheck`, `npm run build`, plus manual dev-server checks.

## Global Constraints

- UI copy: 한국어, 존댓말, 이모지 금지 (project CLAUDE.md).
- Styling: only `src/design-system` components and `var(--token)` CSS variables — never invent new colors/spacing/font-size values. Verified available tokens for this work: `--fs-sm` (0.875rem), `--fs-xs` (0.75rem), `--text-strong`, `--text-body`, `--text-muted`, `--brand-tint`, `--red-100`, `--red-600`, `--border`, `--border-strong`.
- Wire convention (`DEVELOPMENT.md §5`): screen/store deal in Korean labels; `toWire`/`fromWire` in `admin.api.js` are the only place label↔key conversion happens.
- **`target` empty array `[]` means "공개 대상 전체"** — never introduce an explicit `ALL` enum value.
- **All commits go through the `committer` subagent** (Agent tool, `subagent_type: "committer"`) — never run `git commit` directly, per the user's global CLAUDE.md rule. Every "Commit" step below means: dispatch the committer subagent with the listed files staged.
- `capacity` is being removed from the `Seminar`/`SeminarCreateRequest` openapi schemas in this work. Do **not** touch the unrelated `Study`/`StudyCreateRequest` `capacity` fields (openapi.yaml, separate schema block) — out of scope.
- No unit tests exist for this feature area and none should be invented; verification is lint + typecheck + build + manual dev-server check.

---

### Task 1: Extend `docs/api/openapi.yaml` contract

**Files:**
- Modify: `docs/api/openapi.yaml:738-741` (add `TargetGrade` enum after `SeminarStatus`)
- Modify: `docs/api/openapi.yaml:861-878` (`Seminar` schema — remove `capacity`, add `target`)
- Modify: `docs/api/openapi.yaml:879-891` (`SeminarCreateRequest` schema — remove `capacity`, add `target`)
- Modify: `docs/api/openapi.yaml:1025-1037` (`AdminListResponse.items` description — note `attendanceCode` visibility)

**Interfaces:**
- Produces: `TargetGrade` enum (`NEWCOMER`/`ASSOCIATE`/`REGULAR`/`OB`) — Task 2's `src/shared/seminar/enums.js` mirrors these exact keys.
- Produces: `Seminar.target` / `SeminarCreateRequest.target` as `TargetGrade[]` — Task 8's `createSeminar()` payload relies on this field name.

- [ ] **Step 1: Insert `TargetGrade` enum after `SeminarStatus`**

Current (`docs/api/openapi.yaml:738-745`):

```yaml
    SeminarStatus:
      type: string
      enum: [UPCOMING, ONGOING, ENDED]
      description: startsAt + 출석창으로 서버 파생
    StudyStatus:
      type: string
      enum: [RECRUITING, ONGOING, CLOSED]
      description: CLOSED = 모집 마감·종료 (3상태)
```

Replace with:

```yaml
    SeminarStatus:
      type: string
      enum: [UPCOMING, ONGOING, ENDED]
      description: startsAt + 출석창으로 서버 파생
    TargetGrade:
      type: string
      enum: [NEWCOMER, ASSOCIATE, REGULAR, OB]
      description: 세미나 공개 대상 등급
    StudyStatus:
      type: string
      enum: [RECRUITING, ONGOING, CLOSED]
      description: CLOSED = 모집 마감·종료 (3상태)
```

- [ ] **Step 2: Remove `capacity` from `Seminar`, add `target`**

Current (`docs/api/openapi.yaml:861-878`):

```yaml
    Seminar:
      type: object
      required: [id, title, startsAt, status]
      properties:
        id: { type: string }
        title: { type: string }
        speaker: { type: [string, 'null'] }
        topic: { type: [string, 'null'] }
        startsAt: { type: string, format: date-time, description: 정규 시작 시각 (ISO-8601) }
        day: { type: string, description: 파생 표시 (예 '27') }
        month: { type: string, description: 파생 표시 (예 '6월') }
        weekday: { type: string, description: 파생 표시 (예 '금') }
        time: { type: string, description: 파생 표시 (예 '19:00') }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        status: { $ref: '#/components/schemas/SeminarStatus' }
        materialUrl: { type: [string, 'null'], format: uri }
        capacity: { type: [integer, 'null'] }
```

Replace with:

```yaml
    Seminar:
      type: object
      required: [id, title, startsAt, status]
      properties:
        id: { type: string }
        title: { type: string }
        speaker: { type: [string, 'null'] }
        topic: { type: [string, 'null'] }
        startsAt: { type: string, format: date-time, description: 정규 시작 시각 (ISO-8601) }
        day: { type: string, description: 파생 표시 (예 '27') }
        month: { type: string, description: 파생 표시 (예 '6월') }
        weekday: { type: string, description: 파생 표시 (예 '금') }
        time: { type: string, description: 파생 표시 (예 '19:00') }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        status: { $ref: '#/components/schemas/SeminarStatus' }
        materialUrl: { type: [string, 'null'], format: uri }
        target:
          type: array
          items: { $ref: '#/components/schemas/TargetGrade' }
          description: 공개 대상 등급. 빈 배열은 전체 공개.
```

- [ ] **Step 3: Remove `capacity` from `SeminarCreateRequest`, add `target`**

Current (`docs/api/openapi.yaml:879-891`):

```yaml
    SeminarCreateRequest:
      type: object
      required: [title, startsAt]
      properties:
        title: { type: string }
        speaker: { type: [string, 'null'] }
        topic: { type: [string, 'null'] }
        startsAt: { type: string, format: date-time }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        attendanceCode: { type: [string, 'null'], description: 출석 코드 (응답엔 미노출) }
        materialUrl: { type: [string, 'null'], format: uri }
        capacity: { type: [integer, 'null'] }
```

Replace with:

```yaml
    SeminarCreateRequest:
      type: object
      required: [title, startsAt]
      properties:
        title: { type: string }
        speaker: { type: [string, 'null'] }
        topic: { type: [string, 'null'] }
        startsAt: { type: string, format: date-time }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        attendanceCode: { type: [string, 'null'], description: 출석 코드 (응답엔 미노출) }
        materialUrl: { type: [string, 'null'], format: uri }
        target:
          type: array
          items: { $ref: '#/components/schemas/TargetGrade' }
          description: 공개 대상 등급. 빈 배열은 전체 공개.
```

- [ ] **Step 4: Note admin-only `attendanceCode` visibility on `AdminListResponse.items`**

Current (`docs/api/openapi.yaml:1025-1037`):

```yaml
    AdminListResponse:
      type: object
      required: [items, page, size, total]
      properties:
        items:
          type: array
          items:
            type: object
            additionalProperties: true
            description: 리소스별 행. 필드는 FE 화면 스키마(admin.data SCHEMAS)를 따르며 enum 필드는 와이어 키(UPPER_SNAKE).
        page: { type: integer }
        size: { type: integer }
        total: { type: integer }
```

Replace the `items[].description` line with:

```yaml
    AdminListResponse:
      type: object
      required: [items, page, size, total]
      properties:
        items:
          type: array
          items:
            type: object
            additionalProperties: true
            description: 리소스별 행. 필드는 FE 화면 스키마(admin.data SCHEMAS)를 따르며 enum 필드는 와이어 키(UPPER_SNAKE). seminars 리소스 행에는 attendanceCode 포함(공개 Seminar 응답과 달리 임원 전용 조회이므로 노출).
        page: { type: integer }
        size: { type: integer }
        total: { type: integer }
```

- [ ] **Step 5: Verify no other `capacity` references were touched**

Run: `grep -n "capacity" docs/api/openapi.yaml`
Expected: Only `Study`/`StudyCreateRequest` occurrences remain (the two `Seminar*` ones from Steps 2–3 are gone).

- [ ] **Step 6: Commit**

Delegate to the `committer` subagent (Agent tool, `subagent_type: "committer"`) with `docs/api/openapi.yaml` staged.

---

### Task 2: Create `src/shared/seminar/enums.js`

**Files:**
- Create: `src/shared/seminar/enums.js`

**Interfaces:**
- Consumes: nothing (leaf module).
- Produces: `SEMINAR_STATUS_LABELS`, `TARGET_GRADE_LABELS`, `SEMINAR_STATUSES`, `TARGET_GRADES`, `seminarStatusLabel(key)`, `targetGradeLabels(keys)` — consumed by Tasks 3, 4, 5, 7, 8.

- [ ] **Step 1: Write the module**

```js
/**
 * Seminar status / target-grade enum — 백엔드 SeminarStatus / TargetGrade 와
 * 1:1 미러. 와이어에는 enum 키가 오고, 화면 표시는 여기 한글 라벨로 매핑한다.
 * admin(관리)과 seminar(회원용) 양쪽이 이 모듈 하나만 import해 라벨이 다시
 * 갈라지지 않도록 한다.
 */

export const SEMINAR_STATUS_LABELS = { UPCOMING: '예정', ONGOING: '진행 중', ENDED: '종료' };
export const TARGET_GRADE_LABELS = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };

export const SEMINAR_STATUSES = Object.keys(SEMINAR_STATUS_LABELS);
export const TARGET_GRADES = Object.keys(TARGET_GRADE_LABELS);

/** status 키 → 한글 라벨. 모르는/빈 키는 null. */
export function seminarStatusLabel(key) {
  return key ? SEMINAR_STATUS_LABELS[key] ?? null : null;
}

/** 등급 키 배열 → 한글 라벨 문자열. 빈 배열/undefined → '전체'. */
export function targetGradeLabels(keys) {
  if (!keys || keys.length === 0) return '전체';
  return keys.map((k) => TARGET_GRADE_LABELS[k]).join('·');
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run lint && npm run typecheck`
Expected: no errors (new file is unused by anything yet, so no import-graph errors).

- [ ] **Step 3: Commit**

Delegate to the `committer` subagent with `src/shared/seminar/enums.js` staged.

---

### Task 3: Rewrite `src/features/admin/admin.data.js` seminar schema/seed

**Files:**
- Modify: `src/features/admin/admin.data.js:1-20` (imports + enum block)
- Modify: `src/features/admin/admin.data.js:109-122` (`SCHEMAS.seminars`)
- Modify: `src/features/admin/admin.data.js:209-216` (`SEED.seminars`)

**Interfaces:**
- Consumes: `SEMINAR_STATUS_LABELS`, `TARGET_GRADE_LABELS` from Task 2's `@/shared/seminar/enums`.
- Produces: re-exported `SEMINAR_STATUS_LABELS`, `TARGET_GRADE_LABELS` from `./admin.data` (Tasks 4 and 5 import these from `./admin.data`, not directly from shared, to minimize import churn). `SCHEMAS.seminars.cols` with keys `title, speaker, topic, startsAt, place, mode, target (multiselect), attendanceCode, status` — Task 6 (`EditableCell`) and Task 4 (`toWire`/`fromWire`) rely on the `target` column being `type: 'multiselect'` with `options` = grade labels.

- [ ] **Step 1: Add the shared-enum import and re-export**

Current (`src/features/admin/admin.data.js:1-20`):

```js
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

/* ── enum 키 ↔ 한글 라벨 ─────────────────────────────────────────────── */
export const GRADE_LABEL = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };
export const STATUS_LABEL = { ACTIVE: '활동', ON_LEAVE: '휴학', WITHDRAWN: '탈퇴' };
export const DEPARTMENT_LABEL = { LEADERSHIP: '회장단', ACADEMIC: '학술부', PR: '홍보부', FINANCE: '회계부', INFRA: '인프라' };
export const APPLICATION_STATUS_LABEL = { PENDING: '대기', APPROVED: '승인', REJECTED: '반려' };
export const SEMINAR_STATUS_LABEL = { UPCOMING: '예정', ONGOING: '진행', ENDED: '완료' };
export const STUDY_STATUS_LABEL = { RECRUITING: '모집', ONGOING: '진행', CLOSED: '종료' };
```

Replace with:

```js
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

/* ── enum 키 ↔ 한글 라벨 ─────────────────────────────────────────────── */
export const GRADE_LABEL = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };
export const STATUS_LABEL = { ACTIVE: '활동', ON_LEAVE: '휴학', WITHDRAWN: '탈퇴' };
export const DEPARTMENT_LABEL = { LEADERSHIP: '회장단', ACADEMIC: '학술부', PR: '홍보부', FINANCE: '회계부', INFRA: '인프라' };
export const APPLICATION_STATUS_LABEL = { PENDING: '대기', APPROVED: '승인', REJECTED: '반려' };
export const STUDY_STATUS_LABEL = { RECRUITING: '모집', ONGOING: '진행', CLOSED: '종료' };
// admin.api.js / admin.validation.js 는 여기서 재수출된 걸 import한다(수입 경로 최소 변경).
export { SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS };
```

- [ ] **Step 2: Rewrite `SCHEMAS.seminars`**

Current (`src/features/admin/admin.data.js:109-122`):

```js
  seminars: {
    eyebrow: 'SEMINAR', title: '세미나 관리', addLabel: '세미나 개설',
    desc: '세미나 일정·출석코드·자료·상태를 관리합니다.',
    filters: [{ key: 'status', label: '상태', options: ['전체', '예정', '진행', '완료'] }],
    cols: [
      { key: 'title', label: '세미나명', type: 'text', width: '1.5fr' },
      { key: 'target', label: '대상', type: 'text', width: '0.7fr', align: 'center' },
      { key: 'speaker', label: '발표자', type: 'text', width: '0.8fr' },
      { key: 'date', label: '일시', type: 'text', width: '1.1fr' },
      { key: 'code', label: '출석코드', type: 'text', width: '0.7fr', align: 'center' },
      { key: 'status', label: '상태', type: 'select', width: '0.8fr', options: ['예정', '진행', '완료'] },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
    ],
  },
```

Replace with:

```js
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
      { key: 'target', label: '대상', type: 'multiselect', width: '1.6fr', options: labelsOf(TARGET_GRADE_LABELS) },
      { key: 'attendanceCode', label: '출석코드', type: 'text', width: '0.7fr', align: 'center' },
      { key: 'status', label: '상태', type: 'select', width: '0.8fr', options: labelsOf(SEMINAR_STATUS_LABELS) },
      { key: '__act', label: '', type: 'actions', width: '0.6fr', align: 'center', actions: ['delete'] },
    ],
  },
```

Note: `labelsOf` is already defined above `RESOURCES` in this same file (`export const labelsOf = (map) => Object.values(map);`) — no new import needed.

- [ ] **Step 3: Rewrite `SEED.seminars`**

Current (`src/features/admin/admin.data.js:209-216`):

```js
  seminars: [
    { id: 's1', title: 'Git 협업 워크플로우', target: '전체', speaker: '강준혁', date: '2026-03-07 19:00', code: 'GIT7', status: '완료' },
    { id: 's2', title: 'React 상태관리 심화', target: '41기', speaker: '최유나', date: '2026-03-14 19:00', code: 'RCT2', status: '완료' },
    { id: 's3', title: '네트워크 기초', target: '수습', speaker: '박도윤', date: '2026-03-21 19:00', code: 'NET9', status: '진행' },
    { id: 's4', title: '자료구조 스터디 OT', target: '전체', speaker: '윤서아', date: '2026-03-28 19:00', code: 'DS55', status: '예정' },
    { id: 's5', title: '알고리즘 문제풀이', target: '재학생', speaker: '정시우', date: '2026-04-04 19:00', code: 'ALG1', status: '예정' },
    { id: 's6', title: 'DB 인덱스 원리', target: '41기', speaker: '이하은', date: '2026-04-11 19:00', code: 'DBIX', status: '예정' },
  ],
```

Replace with (mock rows are served directly by `mockList` without going through `fromWire` — see `admin.api.js`'s `fetchList` — so these must already be in screen-label form, matching the old file's convention):

```js
  seminars: [
    { id: 's1', title: 'Git 협업 워크플로우', speaker: '강준혁', topic: 'Git', startsAt: '2026-03-07T19:00', place: '제3공학관 401호', mode: '오프라인', target: [], attendanceCode: 'GIT7', status: '종료' },
    { id: 's2', title: 'React 상태관리 심화', speaker: '최유나', topic: 'Frontend', startsAt: '2026-03-14T19:00', place: '제3공학관 401호', mode: '오프라인', target: ['수습회원'], attendanceCode: 'RCT2', status: '종료' },
    { id: 's3', title: '네트워크 기초', speaker: '박도윤', topic: 'Network', startsAt: '2026-03-21T19:00', place: '온라인', mode: '온라인', target: ['수습회원'], attendanceCode: 'NET9', status: '진행 중' },
    { id: 's4', title: '자료구조 스터디 OT', speaker: '윤서아', topic: 'CS', startsAt: '2026-03-28T19:00', place: '제3공학관 401호', mode: '오프라인', target: [], attendanceCode: 'DS55', status: '예정' },
    { id: 's5', title: '알고리즘 문제풀이', speaker: '정시우', topic: 'Algorithm', startsAt: '2026-04-04T19:00', place: '제3공학관 502호', mode: '오프라인', target: ['준회원', '정회원'], attendanceCode: 'ALG1', status: '예정' },
    { id: 's6', title: 'DB 인덱스 원리', speaker: '이하은', topic: 'Backend', startsAt: '2026-04-11T19:00', place: '온라인', mode: '온라인', target: ['수습회원'], attendanceCode: 'DBIX', status: '예정' },
  ],
```

- [ ] **Step 4: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: fails at this point if `admin.api.js`/`admin.validation.js` still import `SEMINAR_STATUS_LABEL` (singular, now removed) — that's expected until Tasks 4–5 land. If running this task in isolation, temporarily confirm only via `node --check` style read (no build) or proceed straight to Tasks 4–5 before verifying; do not treat the singular-name import error as a regression introduced by this task.

- [ ] **Step 5: Commit**

Delegate to the `committer` subagent with `src/features/admin/admin.data.js` staged. (If Task 4/5 aren't done yet, mention in the commit that follow-up commits land the consumer-side rename.)

---

### Task 4: Array-aware `toWire`/`fromWire` in `src/features/admin/admin.api.js`

**Files:**
- Modify: `src/features/admin/admin.api.js:14-20` (import)
- Modify: `src/features/admin/admin.api.js:45-51` (`ENUM_FIELDS`)
- Modify: `src/features/admin/admin.api.js:66-77` (`fromWire`)
- Modify: `src/features/admin/admin.api.js:79-92` (`toWire`)

**Interfaces:**
- Consumes: `SEMINAR_STATUS_LABELS`, `TARGET_GRADE_LABELS` from `./admin.data` (Task 3's re-export).
- Produces: `fromWire(resource, row)` / `toWire(resource, fields)` now handle both scalar and array-valued enum fields transparently — no other file calls these with different signatures, so no downstream change needed.

- [ ] **Step 1: Rename the import**

Current (`src/features/admin/admin.api.js:14-20`):

```js
import { client } from '@/shared/api/client';
import {
  SEED, DASHBOARD_SEED, SETTINGS_SEED, RESOURCES,
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  APPLICATION_STATUS_LABEL,
  SEMINAR_STATUS_LABEL, STUDY_STATUS_LABEL,
} from './admin.data';
```

Replace with:

```js
import { client } from '@/shared/api/client';
import {
  SEED, DASHBOARD_SEED, SETTINGS_SEED, RESOURCES,
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  APPLICATION_STATUS_LABEL,
  SEMINAR_STATUS_LABELS, TARGET_GRADE_LABELS, STUDY_STATUS_LABEL,
} from './admin.data';
```

- [ ] **Step 2: Add `target` to `ENUM_FIELDS.seminars`**

Current (`src/features/admin/admin.api.js:45-51`):

```js
const ENUM_FIELDS = {
  member: { grade: GRADE_LABEL, status: STATUS_LABEL },
  exec: { department: DEPARTMENT_LABEL },
  seminars: { status: SEMINAR_STATUS_LABEL },
  studies: { status: STUDY_STATUS_LABEL },
  applications: { status: APPLICATION_STATUS_LABEL },
};
```

Replace with:

```js
const ENUM_FIELDS = {
  member: { grade: GRADE_LABEL, status: STATUS_LABEL },
  exec: { department: DEPARTMENT_LABEL },
  seminars: { status: SEMINAR_STATUS_LABELS, target: TARGET_GRADE_LABELS },
  studies: { status: STUDY_STATUS_LABEL },
  applications: { status: APPLICATION_STATUS_LABEL },
};
```

- [ ] **Step 3: Make `fromWire` array-aware**

Current (`src/features/admin/admin.api.js:66-77`):

```js
/** 서버 → 화면: enum 키를 한글 라벨로 + gen 정수→'N기'. */
export function fromWire(resource, row) {
  const fields = ENUM_FIELDS[resource];
  const hasGen = GEN_RESOURCES.has(resource);
  if ((!fields && !hasGen) || !row) return row;
  const out = { ...row };
  for (const [field, map] of Object.entries(fields || {})) {
    if (out[field] != null && map[out[field]]) out[field] = map[out[field]];
  }
  if (hasGen && out.gen != null) out.gen = genFromWire(out.gen);
  return out;
}
```

Replace with:

```js
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
```

- [ ] **Step 4: Make `toWire` array-aware**

Current (`src/features/admin/admin.api.js:79-92`):

```js
/** 화면 → 서버: 한글 라벨을 enum 키로 + gen 'N기'→정수 + 빈 문자열→null. */
export function toWire(resource, fields) {
  const maps = ENUM_FIELDS[resource] || {};
  const hasGen = GEN_RESOURCES.has(resource);
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    let val = v;
    if (maps[k]) val = flip(maps[k])[v] ?? v;
    else if (hasGen && k === 'gen') val = genToWire(v);
    if (val === '') val = null;
    out[k] = val;
  }
  return out;
}
```

Replace with:

```js
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
```

- [ ] **Step 5: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors (this task plus Task 3 together resolve the singular/plural rename).

- [ ] **Step 6: Manual mock-mode check**

Run: `npm run dev`, open `/admin?tab=seminars`-equivalent seminar-management route (whatever `RESOURCES.seminars`'s route resolves to in the app), confirm the table renders `target` as a multiselect once Task 6 lands — if Task 6 isn't done yet, it's fine for `target` to render blank/unstyled for now; just confirm no console errors from `toWire`/`fromWire`.

- [ ] **Step 7: Commit**

Delegate to the `committer` subagent with `src/features/admin/admin.api.js` staged.

---

### Task 5: Rewrite `seminarSchema` in `src/features/admin/admin.validation.js`

**Files:**
- Modify: `src/features/admin/admin.validation.js:9-12` (import)
- Modify: `src/features/admin/admin.validation.js:56-63` (`seminarSchema`)

**Interfaces:**
- Consumes: `SEMINAR_STATUS_LABELS` from `./admin.data` (Task 3's re-export).
- Produces: `seminarSchema` validating `{ title, speaker?, topic?, startsAt, place?, mode?, target?, attendanceCode?, status }` — no other file imports `seminarSchema` directly by name other than via `SCHEMA_BY_RESOURCE.seminars`, which is unchanged.

- [ ] **Step 1: Rename the import**

Current (`src/features/admin/admin.validation.js:9-12`):

```js
import {
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  SEMINAR_STATUS_LABEL, STUDY_STATUS_LABEL,
} from './admin.data';
```

Replace with:

```js
import {
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  SEMINAR_STATUS_LABELS, STUDY_STATUS_LABEL,
} from './admin.data';
```

- [ ] **Step 2: Rewrite `seminarSchema`**

Current (`src/features/admin/admin.validation.js:56-63`):

```js
export const seminarSchema = z.object({
  title: z.string().min(1, '세미나명을 입력하세요.'),
  target: z.string().optional(),
  speaker: z.string().min(1, '발표자를 입력하세요.'),
  date: z.string().min(1, '일시를 입력하세요.'),
  code: z.string().min(2, '출석코드를 입력하세요.'), // 유일성은 서버가 판정
  status: labelEnum(SEMINAR_STATUS_LABEL),
});
```

Replace with:

```js
export const seminarSchema = z.object({
  title: z.string().min(1, '세미나명을 입력하세요.'),
  speaker: z.string().optional(),
  topic: z.string().optional(),
  startsAt: z.string().min(1, '일시를 입력하세요.'),
  place: z.string().optional(),
  mode: z.string().optional(),
  target: z.array(z.string()).optional(),
  attendanceCode: z.string().optional(),
  status: labelEnum(SEMINAR_STATUS_LABELS),
});
```

- [ ] **Step 3: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

Delegate to the `committer` subagent with `src/features/admin/admin.validation.js` staged.

---

### Task 6: Add `multiselect` column type (`EditableCell.jsx` + `TableView.jsx`)

**Files:**
- Modify: `src/features/admin/views/table/EditableCell.jsx:24-30` (add branch after `select`)
- Modify: `src/features/admin/views/table/TableView.jsx:104-113` (`onAddRow` default value)

**Interfaces:**
- Consumes: `col.type === 'multiselect'`, `col.options` (array of label strings) from Task 3's `SCHEMAS.seminars.cols`.
- Produces: `onChange(nextArray)` called with the full updated array of selected labels — same `onChange` contract every other column type already uses (`TableView`'s `onCellChange`), so no caller change needed beyond `onAddRow`'s default.

- [ ] **Step 1: Add the `multiselect` branch to `EditableCell`**

Current (`src/features/admin/views/table/EditableCell.jsx:24-30`):

```js
  if (col.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, cursor: 'pointer', ...dirtyStyle }}>
        {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
```

Replace with:

```js
  if (col.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, cursor: 'pointer', ...dirtyStyle }}>
        {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (col.type === 'multiselect') {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt];
      onChange(next);
    };
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', padding: '4px 2px' }}>
        {col.options.map((o) => (
          <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: dirty ? 'var(--red-600)' : 'var(--text-strong)', fontWeight: dirty ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={arr.includes(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    );
  }
```

- [ ] **Step 2: Default `multiselect` fields to `[]` in `onAddRow`**

Current (`src/features/admin/views/table/TableView.jsx:104-113`):

```js
  const onAddRow = () => {
    const fields = {};
    schema.cols.forEach((c) => {
      if (c.type === 'actions' || c.type === 'match') return;
      if (c.type === 'select') fields[c.key] = c.options[0];
      else if (c.type === 'tag') fields[c.key] = '대기';
      else fields[c.key] = '';
    });
    addRow(resource, fields);
  };
```

Replace with:

```js
  const onAddRow = () => {
    const fields = {};
    schema.cols.forEach((c) => {
      if (c.type === 'actions' || c.type === 'match') return;
      if (c.type === 'select') fields[c.key] = c.options[0];
      else if (c.type === 'tag') fields[c.key] = '대기';
      else if (c.type === 'multiselect') fields[c.key] = [];
      else fields[c.key] = '';
    });
    addRow(resource, fields);
  };
```

- [ ] **Step 3: Note on existing dirty-check (no code change)**

`admin.store.js`'s `setEdit` dirty-checks via `String(value) === String(original ?? '')`. For array values this is order-sensitive (`['a','b']` vs `['b','a']` both stringify differently even though set-equal) — this is an accepted, pre-existing simplification (same pattern already used for every other field type), not something to "fix" here. Do not touch `admin.store.js` in this task.

- [ ] **Step 4: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Manual check**

Run: `npm run dev`, open the admin seminar table, click into the `대상` (target) cell for a row, confirm 4 checkboxes (수습회원/준회원/정회원/졸업생) render and toggling one marks the row dirty (red highlight) and adds/removes it from the array without affecting other rows. Click "세미나 개설" (add row) and confirm the new row's `대상` cell starts with all checkboxes unchecked.

- [ ] **Step 6: Commit**

Delegate to the `committer` subagent with `src/features/admin/views/table/EditableCell.jsx` and `src/features/admin/views/table/TableView.jsx` staged.

---

### Task 7: `src/features/seminar/seminar.data.js` — `STATUS_BADGE` from shared labels

**Files:**
- Modify: `src/features/seminar/seminar.data.js:1-16` (add import)
- Modify: `src/features/seminar/seminar.data.js:51-56` (`STATUS_BADGE`)

**Interfaces:**
- Consumes: `SEMINAR_STATUS_LABELS` from `@/shared/seminar/enums` (Task 2).
- Produces: `STATUS_BADGE` keeps its exact external shape `{ UPCOMING: { label, tone }, ONGOING: {...}, ENDED: {...} }` — `SeminarCard.jsx` does `STATUS_BADGE[seminar.status]` and must keep working unmodified.

- [ ] **Step 1: Add the import**

Current (`src/features/seminar/seminar.data.js:1-16`, header comment ends at line 15, first export at line 17):

```js
/**
 * Seminar page copy + seed data — pure data, no JSX.
 *
 * `SEMINARS`/`ROSTERS` mirror the original mock schedule/roster shape; the
 * page now fetches both from the backend via seminar.api.js, so these two
 * exports are currently unused. Keep only the static copy (badge maps, attend
 * labels, messages, empty/toast strings) here.
 *
 * `status` drives the badge AND the attend CTA (wire enum SeminarStatus, UPPER_SNAKE):
 *   UPCOMING  출석 시간 전 (CTA disabled)
 *   ONGOING   출석 가능 (CTA enabled)
 *   ENDED     출석 마감 (CTA disabled)
 * `code` was checked client-side in the original mock; the real check happens
 * server-side (see seminar.api.js checkAttendance).
 */

export const SEMINARS = [
```

Replace with:

```js
/**
 * Seminar page copy + seed data — pure data, no JSX.
 *
 * `SEMINARS`/`ROSTERS` mirror the original mock schedule/roster shape; the
 * page now fetches both from the backend via seminar.api.js, so these two
 * exports are currently unused. Keep only the static copy (badge maps, attend
 * labels, messages, empty/toast strings) here.
 *
 * `status` drives the badge AND the attend CTA (wire enum SeminarStatus, UPPER_SNAKE):
 *   UPCOMING  출석 시간 전 (CTA disabled)
 *   ONGOING   출석 가능 (CTA enabled)
 *   ENDED     출석 마감 (CTA disabled)
 * `code` was checked client-side in the original mock; the real check happens
 * server-side (see seminar.api.js checkAttendance).
 */
import { SEMINAR_STATUS_LABELS } from '@/shared/seminar/enums';

export const SEMINARS = [
```

- [ ] **Step 2: Compose `STATUS_BADGE` from the shared label map**

Current (`src/features/seminar/seminar.data.js:51-56`):

```js
// status → Tag content. tone maps to the design-system Tag `tone` prop.
export const STATUS_BADGE = {
  UPCOMING: { label: '예정', tone: 'brand' },
  ONGOING: { label: '진행 중', tone: 'seal' },
  ENDED: { label: '종료', tone: 'neutral' },
};
```

Replace with:

```js
// status → tone (design-system Tag `tone` prop). label comes from the shared
// enum module so admin/seminar never drift apart again.
const STATUS_TONE = { UPCOMING: 'brand', ONGOING: 'seal', ENDED: 'neutral' };
export const STATUS_BADGE = Object.fromEntries(
  Object.keys(SEMINAR_STATUS_LABELS).map((k) => [k, { label: SEMINAR_STATUS_LABELS[k], tone: STATUS_TONE[k] }]),
);
```

- [ ] **Step 3: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open the member seminar page, confirm seminar cards still show 예정/진행 중/종료 badges with the same colors as before (visual no-op — this task only changes where the label string comes from).

- [ ] **Step 5: Commit**

Delegate to the `committer` subagent with `src/features/seminar/seminar.data.js` staged.

---

### Task 8: Seminar create flow — `target` field end-to-end

**Files:**
- Modify: `src/features/seminar/seminar.api.js:42-56` (`createSeminar` payload)
- Modify: `src/features/seminar/SeminarPage.jsx:58` (`createForm` initial values)
- Modify: `src/features/seminar/views/CreateModal.jsx` (add target multiselect UI)

**Interfaces:**
- Consumes: `TARGET_GRADES`, `TARGET_GRADE_LABELS` from `@/shared/seminar/enums` (Task 2). `useForm`'s `setValues` (already exported, `src/features/seminar/useForm.js:36`).
- Produces: `createForm.values.target` (array of grade keys, default `[]`) flows unchanged through `SeminarPage.jsx`'s existing `createM.mutate(createForm.values)` into `createSeminar(form)`'s payload.

- [ ] **Step 1: Add `target` to the `createSeminar` payload**

Current (`src/features/seminar/seminar.api.js:42-56`):

```js
export async function createSeminar(form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    startsAt: new Date(form.startsAt).toISOString(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    place: opt(form.place),
    mode: opt(form.mode),
    attendanceCode: opt(form.attendanceCode),
    materialUrl: opt(form.materialUrl),
  };
  const { data } = await client.post('/api/seminars', payload);
  return data;
}
```

Replace with:

```js
export async function createSeminar(form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    startsAt: new Date(form.startsAt).toISOString(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    place: opt(form.place),
    mode: opt(form.mode),
    attendanceCode: opt(form.attendanceCode),
    materialUrl: opt(form.materialUrl),
    target: form.target || [],
  };
  const { data } = await client.post('/api/seminars', payload);
  return data;
}
```

- [ ] **Step 2: Add `target: []` to `SeminarPage.jsx`'s create form**

Current (`src/features/seminar/SeminarPage.jsx:58`):

```js
  const createForm = useForm({ title: '', speaker: '', topic: '', startsAt: '', place: '', mode: '', attendanceCode: '', materialUrl: '' });
```

Replace with:

```js
  const createForm = useForm({ title: '', speaker: '', topic: '', startsAt: '', place: '', mode: '', attendanceCode: '', materialUrl: '', target: [] });
```

- [ ] **Step 3: Add the target multiselect UI to `CreateModal.jsx`**

Current (`src/features/seminar/views/CreateModal.jsx`, full file):

```jsx
import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';

/**
 * Seminar-creation modal. SeminarPage requires title and start time; the
 * other fields are optional but all are bound to `form` so the create
 * payload (seminar.api.js createSeminar) carries whatever the officer fills in.
 */
export function CreateModal({ form, onClose, onSubmit, pending = false }) {
  const { values, errors, field } = form;
  return (
    <ModalShell title="세미나 개설" onClose={onClose} maxWidth={540} align="top">
      <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
        <Input
          label="제목"
          placeholder="예: 클린 아키텍처로 배우는 백엔드 설계"
          value={values.title}
          onChange={field('title')}
          error={errors.title}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="발표자" placeholder="홍길동" value={values.speaker} onChange={field('speaker')} />
          <Input label="주제" placeholder="Backend" value={values.topic} onChange={field('topic')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="일시" type="datetime-local" className="jr-datetime" value={values.startsAt} onChange={field('startsAt')} error={errors.startsAt} />
          <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={field('place')} />
        </div>
        <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={field('mode')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="출석 코드" placeholder="참석자에게 공지할 코드를 설정하세요" value={values.attendanceCode} onChange={field('attendanceCode')} />
          <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} />
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending}>{pending ? '등록 중…' : '등록'}</Button>
      </div>
    </ModalShell>
  );
}
```

Replace with:

```jsx
import React from 'react';
import { Button, Input } from '@/design-system';
import { TARGET_GRADES, TARGET_GRADE_LABELS } from '@/shared/seminar/enums';
import { ModalShell } from './ModalShell';

/**
 * Seminar-creation modal. SeminarPage requires title and start time; the
 * other fields are optional but all are bound to `form` so the create
 * payload (seminar.api.js createSeminar) carries whatever the officer fills in.
 */
export function CreateModal({ form, onClose, onSubmit, pending = false }) {
  const { values, errors, field, setValues } = form;

  const toggleTarget = (key) => {
    const cur = values.target || [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    setValues((s) => ({ ...s, target: next }));
  };

  return (
    <ModalShell title="세미나 개설" onClose={onClose} maxWidth={540} align="top">
      <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
        <Input
          label="제목"
          placeholder="예: 클린 아키텍처로 배우는 백엔드 설계"
          value={values.title}
          onChange={field('title')}
          error={errors.title}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="발표자" placeholder="홍길동" value={values.speaker} onChange={field('speaker')} />
          <Input label="주제" placeholder="Backend" value={values.topic} onChange={field('topic')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="일시" type="datetime-local" className="jr-datetime" value={values.startsAt} onChange={field('startsAt')} error={errors.startsAt} />
          <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={field('place')} />
        </div>
        <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={field('mode')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="출석 코드" placeholder="참석자에게 공지할 코드를 설정하세요" value={values.attendanceCode} onChange={field('attendanceCode')} />
          <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} />
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>공개 대상</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {TARGET_GRADES.map((k) => (
              <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)', cursor: 'pointer' }}>
                <input type="checkbox" checked={(values.target || []).includes(k)} onChange={() => toggleTarget(k)} />
                {TARGET_GRADE_LABELS[k]}
              </label>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            아무것도 선택하지 않으면 전체 공개로 등록됩니다.
          </p>
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending}>{pending ? '등록 중…' : '등록'}</Button>
      </div>
    </ModalShell>
  );
}
```

- [ ] **Step 4: Lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Manual check**

Run: `npm run dev`, log in as an officer/admin account, click "＋ 세미나 개설하기", check 2 grade checkboxes, fill in 제목/일시, submit, and confirm (via browser devtools Network tab) the `POST /api/seminars` request body includes `"target":["...","..."]` with the wire keys (`NEWCOMER`/`ASSOCIATE`/`REGULAR`/`OB`). Also submit once with no grades checked and confirm `"target":[]` is sent.

- [ ] **Step 6: Commit**

Delegate to the `committer` subagent with `src/features/seminar/seminar.api.js`, `src/features/seminar/SeminarPage.jsx`, and `src/features/seminar/views/CreateModal.jsx` staged.

---

### Task 9: Final end-to-end verification

**Files:** none (verification only, no code changes).

- [ ] **Step 1: Full lint/typecheck/build pass**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all three succeed with no errors.

- [ ] **Step 2: Cross-feature status label consistency**

Run: `npm run dev`. Open the admin seminar table and the member seminar page side by side. Pick any seminar visible in both (mock data is shared via `SEED.seminars` in `admin.data.js` vs `SEMINARS` in `seminar.data.js` — these are separate mock arrays, so match by title if present in both, otherwise just visually confirm the label set is identical). Confirm both screens only ever show 예정 / 진행 중 / 종료 (never 진행 or 완료 — the old admin-only labels).

- [ ] **Step 3: Admin target multiselect → wire round-trip**

In the admin seminar table (mock mode, `USE_MOCK` default true), select 2+ grades in a row's `대상` cell, save, and confirm the save-bar's dirty count clears and no console error appears (in mock mode `saveBatch`'s `mockBatch` accepts anything, so this mainly confirms `toWire` doesn't throw on an array field).

- [ ] **Step 4: Seminar create → target payload**

Repeat Task 8 Step 5's manual check if not already fresh in mind: confirm `POST /api/seminars` payload's `target` field is always an array (never a bare string), both populated and empty.

- [ ] **Step 5: No stray `capacity` or old field names**

Run: `grep -rn "capacity" docs/api/openapi.yaml src/features/seminar src/features/admin`
Expected: matches only inside the unrelated Study schemas/fields — none inside `Seminar`/`SeminarCreateRequest` or any seminar feature file.

Run: `grep -rn "SEMINAR_STATUS_LABEL\b" src/` (note: word-boundary, so this must NOT match `SEMINAR_STATUS_LABELS`)
Expected: no matches (the singular old name is fully gone).

No commit for this task — it's verification only, not a code change.

---

## Self-Review

**1. Spec coverage** — every numbered decision and "변경 대상" section in the spec maps to a task:
- 결정1 (status labels) → Task 2, 7, 3 (filter options), 9 (verification).
- 결정2/3/4 (target field, grade enum, multi-select, empty-array-is-all) → Task 1 (contract), 2 (labels), 3 (schema/seed), 6 (multiselect UI), 8 (create flow).
- 결정5 (capacity removal) → Task 1 Steps 2–3, Task 9 Step 5.
- 결정6 (attendanceCode admin visibility) → Task 1 Step 4.
- 결정7 (shared enum module) → Task 2, consumed by 3/4/5/7/8.
- Spec's "변경 대상" 1–8 → Tasks 1, 2, 3, 4, 5+6, 6, 7, 8 respectively (5 and 6 both come from spec item 5, split because validation and the UI column type are independently reviewable).
- Spec's 검증 계획 → Task 9.

**2. Placeholder scan** — no "TBD"/"similar to Task N"/unshown code; every step has complete before/after code blocks or exact grep/run commands.

**3. Type consistency** — `target` is `array of TargetGrade` (openapi) → `TargetGrade[]` grade-key array end-to-end; `TARGET_GRADE_LABELS`/`TARGET_GRADES` (Task 2) are the only names used in Tasks 3/4/8; `SEMINAR_STATUS_LABELS` (plural) used consistently from Task 2 onward, replacing the old singular `SEMINAR_STATUS_LABEL` everywhere it appeared (Tasks 3, 4, 5). `EditableCell`'s `multiselect` branch and `TableView`'s `onAddRow` both key off `col.type === 'multiselect'` — no mismatched string. `CreateModal`'s `toggleTarget` and `EditableCell`'s `toggle` both do the same array include/exclude logic independently (different call sites — form values vs. admin store — so duplication here is intentional, not a DRY violation to fix).
