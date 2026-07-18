# 세미나 일정 자기등록 · 승인 플로우 (FE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 임원이 만든 "일정"에 학회원이 선착순으로 자기 슬롯을 등록하고, 임원이 잠근 뒤 각자
세미나 내용을 제출(PENDING) → 임원 승인(APPROVED)/반려(REJECTED, 본인 재제출)까지 이어지는
전체 라이프사이클을 만든다. 학회원 쪽은 세미나 페이지 "일정" 탭, 임원 쪽은 admin에 신규
화면 2개("일정 관리"·"세미나 승인")를 추가한다.

**Architecture:** 기존 `src/features/seminar`(회원용) · `src/features/admin`(임원용) 구조를
그대로 따른다. `Schedule`은 `Seminar`와 별개 리소스라 `schedule.api.js`/`schedule.queries.js`
를 새로 만들고, `Seminar`엔 `scheduleId`/`approvalStatus`/`rejectReason`만 얹는다. admin
"세미나 승인"은 기존 `applications` 큐 패턴(`TableView` + 스테이지드 승인/반려 → 배치 저장)을
그대로 재사용하고, "일정 관리"는 슬롯별 개별 액션이 필요해 `TableView`가 아니라 카드형
커스텀 뷰로 만든다.

**Tech Stack:** React 19, Vite 7, TanStack Query v5, Zustand, axios — **이 레포에 테스트
러너 없음**(vitest/jest 의존성 0개, 선례 확인됨). 검증은 `npm run lint` + `npm run typecheck`
+ `npm run build` + 수동 dev-server 확인.

**Source spec:** `docs/superpowers/specs/2026-07-18-seminar-slot-registration-design.md`

## Global Constraints

- **레포:** `home-jaram-fe`. 모든 명령은 레포 루트에서 실행.
- **UI 카피:** 한국어, 존댓말, 이모지 금지 (프로젝트 CLAUDE.md). 라틴 문자는 소문자 대문자
  아이라벨로만.
- **스타일:** `src/design-system` 컴포넌트와 `var(--token)` CSS 변수만. 새 색·폰트·여백 값
  발명 금지. 이 작업에서 쓰는 컴포넌트 API(확인 완료):
  - `Button`: `variant` = `primary|secondary|outline|ghost`, `size` = `sm|md|lg`, `disabled`,
    `onClick`, `style`. (`src/design-system/components/core/Button.jsx`)
  - `Tag`: `tone` = `neutral|brand|seal|outline`, `size` = `sm|md`, `style`.
  - `Input`: `label`, `placeholder`, `value`, `onChange`, `error`, `as="textarea"`
    (자동 `resize:vertical`, `minHeight:96px`).
  - 확인된 토큰: `--font-sans`, `--font-serif`, `--font-mono`, `--fs-xs`, `--fs-sm`,
    `--fs-body`, `--fs-lead`, `--fs-title-3`, `--w-semibold`, `--w-medium`, `--w-bold`,
    `--ls-label`, `--lh-normal`, `--text-strong`, `--text-body`, `--text-muted`,
    `--text-faint`, `--border`, `--border-soft`, `--border-strong`, `--surface-card`,
    `--surface-sunken`, `--radius-lg`, `--radius-md`, `--radius-pill`, `--shadow-sm`,
    `--brand`, `--brand-deep`, `--brand-tint`, `--red-100`, `--red-600`.
  - 에러 문구 색은 `Input`도 그렇듯 별도 danger 토큰 없이 `var(--brand)`를 쓴다(이
    디자인 시스템엔 semantic red 토큰이 없음 — 새로 만들지 않는다).
- **상태 라벨은 `@/shared/seminar/enums.js`에서만** 온다. 새 라벨 맵을 여기저기 만들지
  않는다. `Seminar.approvalStatus`(PENDING/APPROVED/REJECTED) 라벨은 admin이 이미 갖고
  있는 `APPLICATION_STATUS_LABEL`(대기/승인/반려)과 **값이 완전히 같은 enum**이라 그대로
  재사용한다 — 새 라벨 맵을 만들지 않는다.
- **카피는 각 기능의 `*.data.js`에 모은다.** 뷰에 한글 문자열 리터럴을 인라인하지 않는다.
- **커밋:** 사용자 글로벌 규칙에 따라 모든 커밋은 `committer` 서브에이전트(Agent tool,
  `subagent_type: "committer"`)에 위임한다. **직접 `git commit` 실행 금지, `Co-Authored-By`
  트레일러 붙이지 않음(사용자 고정 지시).** 아래 모든 "커밋" 스텝은 "해당 파일을 스테이징한
  뒤 committer 서브에이전트를 디스패치한다"는 뜻.
- **검증 baseline (이 플랜 착수 전 실행·확인):** `npm run lint` → 통과, `npm run typecheck`
  → 통과, `npm run build` → 성공(`Some chunks are larger than 500 kB` 경고만, 기존 상태).
  모든 체크포인트에서 이 경고 하나만 허용. 다른 에러·경고가 뜨면 회귀이므로 멈추고
  조사(superpowers:systematic-debugging).
- **`docs/api/openapi.yaml`은 이 작업에서 FE가 직접 편집한다** (Task 1) — 이번 기능은
  BE 계약이 크게 바뀌는 건이고, 이 레포가 계약 소유자다. BE 구현은 이 플랜과 별개로
  `home-jaram-be` 레포의 플랜이 이 스펙을 참조해 진행한다(이 플랜의 범위 아님).

## Scope Check

스펙은 하나의 연속된 상태머신(Schedule OPEN→LOCKED, Seminar 없음→PENDING→APPROVED/REJECTED)
이라 서브프로젝트로 쪼개지 않았다(브레인스토밍 단계에서 이미 결정됨: 단일 스펙+플랜).
다만 태스크 단위로는 "회원용 데이터 계층 → 회원용 화면 → 임원용 승인 → 임원용 일정 관리"
순으로 독립적으로 커밋 가능하게 나눴다 — 각 태스크가 끝나면 항상 lint/typecheck/build가
통과하는 상태를 유지한다.

## File Structure

```
docs/api/openapi.yaml                       # + Schedule/ScheduleSlot/ScheduleCreateRequest/
                                             #   ScheduleStatus/SlotMember 스키마+경로,
                                             #   Seminar+scheduleId/approvalStatus/
                                             #   rejectReason, GET /api/seminars/{id} 신규 (Task 1)
src/shared/seminar/enums.js                 # + SCHEDULE_STATUS_LABELS (Task 1)

src/features/seminar/
  schedule.data.js                # 신규 — 일정/슬롯 카피 (Task 2)
  schedule.api.js                 # 신규 — 회원용 schedule API (Task 2)
  schedule.queries.js             # 신규 — react-query 훅 (Task 3)
  seminar.data.js                 # + SEMINAR_APPROVAL_CHIP, EMPTY.schedules (Task 4)
  seminar.api.js                  # + getSeminar, resubmitSeminar (Task 4)
  seminar.queries.js              # + useSeminar, useResubmitSeminar (Task 4)
  useForm.js                      # 재생성 — SlotSeminarModal이 다시 필요로 함 (Task 6)
  views/
    ScheduleCard.jsx              # 신규 (Task 5)
    ClaimModal.jsx                # 신규 (Task 6)
    SlotSeminarModal.jsx          # 신규 (Task 6)
    ScheduleView.jsx              # 신규 (Task 7)
    index.js                      # + export 4개 (Task 5·6·7)
  SeminarPage.jsx                 # + 탭 상태·핸들러·모달 배선 (Task 8)

src/features/admin/
  admin.data.js                   # + SCHEMAS.seminarApprovals, RESOURCES.seminarApprovals,
                                   #   SEED.seminarApprovals, SEED.schedules (Task 9)
  admin.api.js                    # + approveSeminar/rejectSeminar/saveSeminarApprovalsQueue
                                   #   dispatch, fetchSchedules/createSchedule/lockSchedule/
                                   #   forceUnassignSlot (Task 10)
  admin.queries.js                # + useSchedulesAdmin/useCreateSchedule/useLockSchedule/
                                   #   useForceUnassignSlot (Task 11)
  AdminPage.jsx                   # + 라우트 2개 (Task 13)
  views/shell/AdminShell.jsx      # currentResource에 seminar-approvals 매핑 추가 (Task 13)
  views/shell/Sidebar.jsx         # + nav 항목 2개 (Task 13)
  views/schedules/
    ScheduleAdminView.jsx         # 신규 (Task 12)
    ScheduleAdminCard.jsx         # 신규 (Task 12)
    CreateScheduleModal.jsx       # 신규 (Task 12)
```

---

### Task 1: 계약 — `openapi.yaml` + 공유 enum

**Files:**
- Modify: `docs/api/openapi.yaml`
- Modify: `src/shared/seminar/enums.js`

**Interfaces:**
- Consumes: 없음.
- Produces: `SCHEDULE_STATUS_LABELS`, `scheduleStatusLabel(key)` — Task 5(`ScheduleCard`)가
  라벨 표시에 쓴다. 계약 스키마 `Schedule`/`ScheduleSlot`/`ScheduleCreateRequest`/
  `ScheduleStatus`/`SlotMember` — Task 2 이후 모든 태스크가 이 모양을 전제로 한다.

- [ ] **Step 1: 공유 enum에 `SCHEDULE_STATUS_LABELS` 추가**

`src/shared/seminar/enums.js` 맨 끝에 추가:

```js
export const SCHEDULE_STATUS_LABELS = { OPEN: '모집 중', LOCKED: '잠김' };
export const SCHEDULE_STATUSES = Object.keys(SCHEDULE_STATUS_LABELS);

/** Schedule status 키 → 한글 라벨. 모르는/빈 키는 null. */
export function scheduleStatusLabel(key) {
  return key ? SCHEDULE_STATUS_LABELS[key] ?? null : null;
}
```

- [ ] **Step 2: `openapi.yaml`에 `parameters`/`responses` 보강**

`docs/api/openapi.yaml`의 `parameters:` 블록(`SeminarId` 옆)에 두 개 추가. 현재:

```yaml
    MemberId:
      name: id
      in: path
      required: true
      schema: { type: string }
      description: 회원 ID
```

바로 뒤에 추가:

```yaml
    ScheduleId:
      name: id
      in: path
      required: true
      schema: { type: string }
      description: 일정 ID
    SlotIndex:
      name: index
      in: path
      required: true
      schema: { type: integer, minimum: 0 }
      description: 슬롯 번호(0-based)
```

`responses:` 블록(`Validation` 옆)에 `Conflict` 추가. 현재:

```yaml
    Validation:
      description: 입력 검증 실패 (fieldErrors 포함)
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorResponse' }
          example:
            code: VALIDATION
            message: 입력값을 확인해 주세요.
            fieldErrors: { email: 한양대 이메일(@hanyang.ac.kr)만 사용할 수 있습니다. }
```

바로 뒤에 추가:

```yaml
    Conflict:
      description: 상태 충돌 (예 정원 초과·이미 잠김·세미나 존재)
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorResponse' }
          example: { code: CONFLICT, message: 이미 처리된 요청입니다. }
```

- [ ] **Step 3: `Seminar`/`SeminarCreateRequest` 스키마에 필드 추가**

현재 (`docs/api/openapi.yaml`, `# ── seminar ──` 아래 `Seminar` 스키마):

```yaml
    Seminar:
      type: object
      required: [id, title, startsAt, status, attendanceClosesAt]
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
        description: { type: [string, 'null'], description: 세미나 상세 설명 }
        attendanceClosesAt: { type: string, format: date-time, description: '출석 인정 마감 시각 (startsAt + 출석창, 서버 파생)' }
        attendedAt: { type: [string, 'null'], description: '내 출석 시각 표시(예 19:02). 미출석/비로그인이면 null' }
```

`attendedAt` 줄 바로 뒤에 추가:

```yaml
        scheduleId: { type: [string, 'null'], description: 슬롯 경로로 생성됐으면 채워짐. 임원 직접생성은 null. }
        approvalStatus: { $ref: '#/components/schemas/ApprovalStatus' }
        rejectReason: { type: [string, 'null'], description: approvalStatus가 REJECTED일 때만 }
```

같은 파일의 `SeminarCreateRequest` 스키마는 슬롯 경로(`/schedules/{id}/slots/{index}/seminar`)와
직접생성 경로(`POST /api/seminars`) 둘 다 재사용한다 — `startsAt`이 필수인 이유는 직접생성
때문이고, 슬롯 경로는 URL이 이미 어느 일정인지 알아 `startsAt`을 무시한다(요청 바디에 있어도
서버가 Schedule 값으로 덮어씀). 스키마 자체는 변경 없음.

- [ ] **Step 4: `Schedule` 계열 스키마 신규 추가**

`# ── seminar ──` 섹션의 `SeminarCreateRequest` 스키마 바로 뒤(= `AttendRequest` 스키마
바로 앞)에 삽입:

```yaml
    ScheduleStatus:
      type: string
      enum: [OPEN, LOCKED]
      description: 임원 수동 토글로만 LOCKED. 역방향(재오픈) 없음.
    SlotMember:
      type: object
      required: [id, name]
      properties:
        id: { type: string }
        name: { type: string }
    ScheduleSlot:
      type: object
      required: [index, member, seminarId]
      properties:
        index: { type: integer, minimum: 0 }
        member: { oneOf: [{ $ref: '#/components/schemas/SlotMember' }, { type: 'null' }] }
        seminarId: { type: [string, 'null'] }
        seminarApprovalStatus:
          oneOf: [{ $ref: '#/components/schemas/ApprovalStatus' }, { type: 'null' }]
          description: seminarId가 없으면 null. 슬롯 카드가 세미나 상세를 따로 조회하지
            않도록 슬롯에 얹어 준다.
        seminarRejectReason: { type: [string, 'null'], description: REJECTED일 때만 }
    Schedule:
      type: object
      required: [id, startsAt, day, month, weekday, time, capacity, status, slots]
      properties:
        id: { type: string }
        startsAt: { type: string, format: date-time }
        day: { type: string, description: 파생 표시 (예 '27') }
        month: { type: string, description: 파생 표시 (예 '6월') }
        weekday: { type: string, description: 파생 표시 (예 '금') }
        time: { type: string, description: 파생 표시 (예 '19:00') }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        capacity: { type: integer, minimum: 1, default: 3 }
        status: { $ref: '#/components/schemas/ScheduleStatus' }
        slots:
          type: array
          items: { $ref: '#/components/schemas/ScheduleSlot' }
    ScheduleCreateRequest:
      type: object
      required: [startsAt]
      properties:
        startsAt: { type: string, format: date-time }
        place: { type: [string, 'null'] }
        mode: { type: [string, 'null'] }
        capacity: { type: integer, minimum: 1, default: 3 }
```

- [ ] **Step 5: 경로 추가 — 회원용**

`/api/seminars/{id}/attend` 경로 바로 앞(= `/api/seminars` 블록 바로 뒤)에 `GET
/api/seminars/{id}` 추가 (REJECTED 세미나 수정 폼을 채우려면 본인 소유 비공개 세미나도
조회할 수 있어야 함):

```yaml
  /api/seminars/{id}:
    get:
      tags: [seminar]
      summary: 세미나 단건 조회 (수정 폼 프리필용)
      description: APPROVED는 공개. PENDING/REJECTED는 본인 또는 임원만 조회 가능(그 외 404).
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/SeminarId'
      responses:
        '200':
          description: 세미나
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Seminar' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '404': { $ref: '#/components/responses/NotFound' }
        '5XX': { $ref: '#/components/responses/ServerError' }
    patch:
      tags: [seminar]
      summary: 반려된 세미나 재제출 (본인만)
      description: approvalStatus가 REJECTED인 본인 소유 세미나만 가능. 성공 시
        approvalStatus는 PENDING으로, rejectReason은 null로 돌아간다.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/SeminarId'
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SeminarCreateRequest' }
      responses:
        '200':
          description: 재제출됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Seminar' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '409': { $ref: '#/components/responses/Conflict' }
        '422': { $ref: '#/components/responses/Validation' }
        '5XX': { $ref: '#/components/responses/ServerError' }

```

`# ─────────────────────────── study ───────────────────────────` 구분선 바로 앞(=
`/api/seminars/{id}/attendees` 블록 바로 뒤)에 `schedules` 섹션 통째로 추가:

```yaml
  # ─────────────────────────── schedule ───────────────────────────
  /api/schedules:
    get:
      tags: [schedule]
      summary: 일정 목록 조회
      description: 슬롯 포함. public.
      responses:
        '200':
          description: 일정 목록
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/Schedule' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/schedules/{id}/slots/{index}/claim:
    post:
      tags: [schedule]
      summary: 슬롯 자기등록 (선착순)
      description: Schedule.status가 OPEN일 때만. 정원 초과·이미 참·잠김은 409.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/ScheduleId'
        - $ref: '#/components/parameters/SlotIndex'
      responses:
        '200':
          description: 등록됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Schedule' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '404': { $ref: '#/components/responses/NotFound' }
        '409': { $ref: '#/components/responses/Conflict' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/schedules/{id}/slots/{index}:
    delete:
      tags: [schedule]
      summary: 슬롯 자진취소 (본인)
      description: Schedule.status가 OPEN이고 본인 슬롯일 때만. LOCKED 이후엔 403.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/ScheduleId'
        - $ref: '#/components/parameters/SlotIndex'
      responses:
        '200':
          description: 취소됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Schedule' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/schedules/{id}/slots/{index}/seminar:
    post:
      tags: [schedule]
      summary: 슬롯에서 세미나 제출
      description: Schedule.status가 LOCKED이고 본인 슬롯이며 seminarId가 아직 없을 때만.
        생성된 Seminar는 approvalStatus=PENDING으로 시작. startsAt/place/mode는 Schedule
        값을 그대로 쓴다(요청 바디에 있어도 무시).
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/ScheduleId'
        - $ref: '#/components/parameters/SlotIndex'
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/SeminarCreateRequest' }
      responses:
        '201':
          description: 제출됨 (PENDING)
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Seminar' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '409': { $ref: '#/components/responses/Conflict' }
        '422': { $ref: '#/components/responses/Validation' }
        '5XX': { $ref: '#/components/responses/ServerError' }

```

- [ ] **Step 6: 경로 추가 — 임원용**

`# ─────────────────────────── admin ───────────────────────────` 유사 섹션이 있으면
그 안에, 없으면 `schedules` 섹션 바로 뒤에 추가:

```yaml
  /api/admin/schedules:
    post:
      tags: [schedule]
      summary: 일정 생성 (임원)
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/ScheduleCreateRequest' }
      responses:
        '201':
          description: 생성됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Schedule' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '422': { $ref: '#/components/responses/Validation' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/admin/schedules/{id}/lock:
    patch:
      tags: [schedule]
      summary: 일정 잠금 (임원)
      description: OPEN→LOCKED. 역방향 없음.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/ScheduleId'
      responses:
        '200':
          description: 잠김
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Schedule' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/admin/schedules/{id}/slots/{index}:
    delete:
      tags: [schedule]
      summary: 슬롯 강제 해제 (임원)
      description: seminarId가 있으면 409 — 먼저 그 세미나를 반려해야 한다.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/ScheduleId'
        - $ref: '#/components/parameters/SlotIndex'
      responses:
        '200':
          description: 해제됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Schedule' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '409': { $ref: '#/components/responses/Conflict' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/admin/seminars/{id}/approve:
    post:
      tags: [seminar]
      summary: 세미나 승인 (임원)
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/SeminarId'
      responses:
        '200':
          description: 승인됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Seminar' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '5XX': { $ref: '#/components/responses/ServerError' }

  /api/admin/seminars/{id}/reject:
    post:
      tags: [seminar]
      summary: 세미나 반려 (임원)
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/SeminarId'
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/RejectRequest' }
      responses:
        '200':
          description: 반려됨
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Seminar' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '422': { $ref: '#/components/responses/Validation' }
        '5XX': { $ref: '#/components/responses/ServerError' }

```

`GET /api/admin/seminars?approvalStatus=PENDING` 은 새 경로가 아니라 기존
`GET /api/admin/seminars`(admin 표 조회용, 이 문서에 이미 있다면 그대로) 에 쿼리 파라미터
`approvalStatus`만 얹어 쓴다 — 계약에 새 파라미터를 추가하지 않아도 이미 자유 쿼리를
받는 admin 목록 엔드포인트 관례를 따른다. 이 문서에 admin 세미나 목록 경로가 아직 없다면
이 스텝은 건너뛰고 Task 10에서 FE가 `GET /api/admin/seminars?approvalStatus=PENDING`를
호출하도록 구현하되, BE 플랜 쪽에서 파라미터를 받는지 명시가 필요하다는 점을 Task 10
주석에 남긴다.

- [ ] **Step 7: YAML 문법 검증**

Run: `python3 -c "import yaml; yaml.safe_load(open('docs/api/openapi.yaml')); print('valid yaml')"`
Expected: `valid yaml` 출력, 에러 없음.

- [ ] **Step 8: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과 (이 태스크는 `.js`/`.yaml`만 건드려 build 영향 없어야 함).

- [ ] **Step 9: 커밋**

`docs/api/openapi.yaml`, `src/shared/seminar/enums.js`를 스테이징하고 committer
서브에이전트 디스패치.

---

### Task 2: `schedule.data.js` + `schedule.api.js` (회원용)

**Files:**
- Create: `src/features/seminar/schedule.data.js`
- Create: `src/features/seminar/schedule.api.js`

**Interfaces:**
- Consumes: Task 1의 계약(`Schedule`/`ScheduleSlot`/`SeminarCreateRequest` 모양).
- Produces:
  - `SLOT_EMPTY`, `SCHEDULE_MESSAGES`, `SCHEDULE_TOAST`, `SLOT_ACTION_LABEL` — Task 5·7·8이 쓴다.
  - `listSchedules()`, `claimSlot({scheduleId, index})`, `cancelSlot({scheduleId, index})`,
    `submitSlotSeminar({scheduleId, index, form})` — Task 3이 그대로 감싼다.

- [ ] **Step 1: `schedule.data.js` 작성**

```js
/**
 * 일정("Schedule") 탭 카피 — 슬롯 자기등록/취소/세미나 제출 문구. (JSX 없음)
 */

// 빈 슬롯 표시. Phase 1 스펙에서 넘어온 상수 이름을 그대로 유지한다.
export const SLOT_EMPTY = '미정';

export const SCHEDULE_MESSAGES = {
  claimTaken: '방금 다른 분이 등록해서 자리가 찼습니다.',
  claimServer: '슬롯 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  cancelServer: '슬롯 취소 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  seminarTitleRequired: '제목을 입력해 주세요.',
  seminarServer: '세미나 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

export const SCHEDULE_TOAST = {
  claimed: '슬롯에 등록되었습니다.',
  canceled: '슬롯 등록을 취소했습니다.',
  seminarSubmitted: '세미나가 제출되었습니다. 임원 승인을 기다려 주세요.',
  seminarResubmitted: '세미나를 다시 제출했습니다. 임원 승인을 기다려 주세요.',
};

export const SLOT_ACTION_LABEL = {
  claim: '등록하기',
  cancel: '포기하기',
  createSeminar: '세미나 만들기',
  editSeminar: '수정하기',
  locked: '잠김',
};
```

- [ ] **Step 2: `schedule.api.js` 작성**

```js
/**
 * Schedule API for the seminar page — talks to the Spring backend via the shared
 * axios client. Seminar와 별개 리소스라 seminar.api.js와 나란히 둔다.
 *
 * Failure contract:
 *   - `claimSlot` rejects with `Object.assign(new Error(msg), { code:'SLOT_TAKEN' })`
 *     when the server returns 409 (정원 초과·이미 참·잠김); other 4xx/5xx are 'SERVER'.
 */
import { client } from '@/shared/api/client';

export async function listSchedules() {
  const { data } = await client.get('/api/schedules');
  return data;
}

export async function claimSlot({ scheduleId, index }) {
  try {
    const { data } = await client.post(`/api/schedules/${scheduleId}/slots/${index}/claim`);
    return data;
  } catch (error) {
    const status = error.response?.status;
    const code = status === 409 ? 'SLOT_TAKEN' : 'SERVER';
    throw Object.assign(new Error(error.response?.data?.message || 'claim failed'), { code });
  }
}

export async function cancelSlot({ scheduleId, index }) {
  const { data } = await client.delete(`/api/schedules/${scheduleId}/slots/${index}`);
  return data;
}

/**
 * 슬롯에서 세미나 제출. SeminarCreateRequest와 같은 필드를 쓰되 startsAt/place/mode는
 * Schedule 값으로 서버가 채우므로 보내지 않는다.
 */
export async function submitSlotSeminar({ scheduleId, index, form }) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    description: opt(form.description),
    attendanceCode: opt(form.attendanceCode),
    materialUrl: opt(form.materialUrl),
    target: form.target || [],
  };
  const { data } = await client.post(`/api/schedules/${scheduleId}/slots/${index}/seminar`, payload);
  return data;
}
```

- [ ] **Step 3: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과. 이 태스크는 아직 아무 데서도 import 안 되지만(신규 파일이라 lint의
`no-unused-vars`는 export엔 적용 안 됨), 빌드가 깨지지 않는지만 확인한다.

- [ ] **Step 4: 커밋**

`src/features/seminar/schedule.data.js`, `src/features/seminar/schedule.api.js`를
스테이징하고 committer 서브에이전트 디스패치.

---

### Task 3: `schedule.queries.js`

**Files:**
- Create: `src/features/seminar/schedule.queries.js`

**Interfaces:**
- Consumes: Task 2의 `schedule.api.js` 함수 시그니처 그대로.
- Produces: `scheduleKeys.all`, `useSchedules()`, `useClaimSlot(options)`,
  `useCancelSlot(options)`, `useSubmitSlotSeminar(options)` — Task 8(`SeminarPage`)과
  Task 13(admin 일정 관리는 admin.queries.js를 따로 쓰므로 미해당)이 쓴다.

- [ ] **Step 1: 작성**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './schedule.api';

/**
 * react-query 훅 모음 — 일정 탭. 목록은 useQuery, 등록/취소/세미나제출은 useMutation.
 * 셋 다 성공 시 일정 목록을 무효화한다(슬롯 상태가 바뀌므로).
 */

export const scheduleKeys = {
  all: ['schedules'],
};

export function useSchedules() {
  return useQuery({ queryKey: scheduleKeys.all, queryFn: api.listSchedules });
}

export function useClaimSlot(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.claimSlot,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCancelSlot(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelSlot,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSubmitSlotSeminar(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitSlotSeminar,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}
```

- [ ] **Step 2: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 3: 커밋**

`src/features/seminar/schedule.queries.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 4: `seminar.*` 확장 — 단건 조회·재제출·승인칩 카피

**Files:**
- Modify: `src/features/seminar/seminar.api.js`
- Modify: `src/features/seminar/seminar.queries.js`
- Modify: `src/features/seminar/seminar.data.js`

**Interfaces:**
- Consumes: Task 1 계약의 `GET /api/seminars/{id}`, `PATCH /api/seminars/{id}`.
- Produces:
  - `getSeminar(id)`, `resubmitSeminar(id, form)` — Task 6(`SlotSeminarModal`)이 쓴다.
  - `useSeminar(id, options)`, `useResubmitSeminar(options)` — Task 6·8이 쓴다.
  - `SEMINAR_APPROVAL_CHIP`(`{PENDING:{label,tone}, REJECTED:{label,tone}}`),
    `EMPTY.schedules` — Task 5·7이 쓴다.

- [ ] **Step 1: `seminar.api.js`에 두 함수 추가**

현재 (`src/features/seminar/seminar.api.js:15-18`):

```js
export async function listSeminars() {
  const { data } = await client.get('/api/seminars');
  return data;
}
```

바로 뒤에 추가:

```js
/** 단건 조회 — PENDING/REJECTED 재제출 폼 프리필용. 본인/임원 아니면 서버가 404. */
export async function getSeminar(id) {
  const { data } = await client.get(`/api/seminars/${id}`);
  return data;
}

/**
 * REJECTED 세미나를 본인이 수정해 재제출한다 — 같은 id, approvalStatus는 PENDING으로,
 * rejectReason은 null로 돌아간다.
 */
export async function resubmitSeminar(id, form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    description: opt(form.description),
    attendanceCode: opt(form.attendanceCode),
    materialUrl: opt(form.materialUrl),
    target: form.target || [],
  };
  const { data } = await client.patch(`/api/seminars/${id}`, payload);
  return data;
}
```

- [ ] **Step 2: `seminar.queries.js`에 훅 추가**

현재 (`src/features/seminar/seminar.queries.js` 맨 끝, `useAttend` 함수 뒤):

```js
export function useAttend(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.checkAttendance,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}
```

바로 뒤에 추가:

```js

/** 단건 조회 — 재제출 폼이 열릴 때만 조회한다(`options.enabled`). */
export function useSeminar(id, options) {
  return useQuery({
    queryKey: ['seminar', id],
    queryFn: () => api.getSeminar(id),
    enabled: !!id,
    ...options,
  });
}

export function useResubmitSeminar(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => api.resubmitSeminar(id, form),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      qc.invalidateQueries({ queryKey: ['schedules'] });
      options?.onSuccess?.(...args);
    },
  });
}
```

- [ ] **Step 3: `seminar.data.js`에 승인 칩 카피 + 빈 상태 문구 추가**

현재 (`src/features/seminar/seminar.data.js`, `ENDED_CHIP` 블록):

```js
export const ENDED_CHIP = {
  attended: { label: '출석', tone: 'seal' },
  absent: { label: '결석', tone: 'neutral' },
};
```

바로 뒤에 추가:

```js

// 슬롯 카드에서 본인 세미나 상태 칩. APPROVED는 이미 정식 목록에 뜨니 칩이 필요 없다.
export const SEMINAR_APPROVAL_CHIP = {
  PENDING: { label: '대기중', tone: 'outline' },
  REJECTED: { label: '반려됨', tone: 'neutral' },
};
```

`EMPTY` 상수(현재):

```js
export const EMPTY = {
  seminars: '예정된 세미나가 없습니다.',
  attendees: '아직 출석한 회원이 없습니다.',
};
```

교체:

```js
export const EMPTY = {
  seminars: '예정된 세미나가 없습니다.',
  attendees: '아직 출석한 회원이 없습니다.',
  schedules: '등록된 일정이 없습니다.',
};
```

- [ ] **Step 4: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 5: 커밋**

`src/features/seminar/seminar.api.js`, `src/features/seminar/seminar.queries.js`,
`src/features/seminar/seminar.data.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 5: `ScheduleCard.jsx`

**Files:**
- Create: `src/features/seminar/views/ScheduleCard.jsx`

**Interfaces:**
- Consumes: `SCHEDULE_STATUS_LABELS`(Task 1), `SLOT_EMPTY`/`SLOT_ACTION_LABEL`(Task 2),
  `SEMINAR_APPROVAL_CHIP`(Task 4), `Schedule`/`ScheduleSlot` 모양(Task 1).
- Produces: `ScheduleCard({ schedule, currentUserId, isLoggedIn, onClaim, onCancel,
  onCreateSeminar, onEditSeminar })` — Task 7(`ScheduleView`)이 렌더한다.
  - `onClaim(scheduleId, index)` — 빈 슬롯 "등록하기" 클릭.
  - `onCancel(scheduleId, index)` — 내 슬롯 "포기하기" 클릭(확인 모달 없이 바로 호출).
  - `onCreateSeminar(schedule, slot)` — 내 슬롯(LOCKED, 세미나 없음) "세미나 만들기" 클릭.
  - `onEditSeminar(schedule, slot)` — 내 슬롯(REJECTED) "수정하기" 클릭.

- [ ] **Step 1: 작성**

```jsx
import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';
import { SLOT_EMPTY, SLOT_ACTION_LABEL } from '../schedule.data';
import { SEMINAR_APPROVAL_CHIP } from '../seminar.data';

/**
 * 일정 카드 — 날짜 블록(SeminarCard와 같은 스타일) + 슬롯별 줄.
 *
 * 슬롯 액션은 소유권·잠금 상태로 갈린다:
 *   - 빈 슬롯 + OPEN + 로그인   → "등록하기"
 *   - 내 슬롯 + OPEN            → "포기하기"
 *   - 내 슬롯 + LOCKED + 세미나 없음 → "세미나 만들기"
 *   - 내 슬롯 + LOCKED + REJECTED    → 칩 + "수정하기"
 *   - 내 슬롯 + LOCKED + PENDING     → 칩만
 *   - 남의 슬롯                 → 이름만
 *   - 빈 슬롯 + LOCKED           → "잠김"
 */
export function ScheduleCard({ schedule, currentUserId, isLoggedIn, onClaim, onCancel, onCreateSeminar, onEditSeminar }) {
  const locked = schedule.status === 'LOCKED';

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'stretch',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px 26px',
        flexWrap: 'wrap',
      }}
    >
      {/* date block — SeminarCard와 동일 스타일 */}
      <div
        style={{
          flex: 'none',
          width: 96,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: 24,
          borderRight: '1px solid var(--border-soft)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 700, color: 'var(--brand-deep)', lineHeight: 1 }}>
          {schedule.day}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
          {schedule.month} · {schedule.weekday}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', marginTop: 6 }}>
          {schedule.time}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
          {schedule.place && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              {schedule.place}
            </span>
          )}
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {schedule.slots.map((slot) => {
            const isMine = isLoggedIn && slot.member?.id === currentUserId;
            const name = slot.member?.name ?? SLOT_EMPTY;
            const chip = isMine && slot.seminarApprovalStatus ? SEMINAR_APPROVAL_CHIP[slot.seminarApprovalStatus] : null;

            return (
              <div
                key={slot.index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
                  {name}
                  {chip && <Tag tone={chip.tone} size="sm">{chip.label}</Tag>}
                </span>

                {!slot.member && !locked && isLoggedIn && (
                  <Button variant="secondary" size="sm" onClick={() => onClaim(schedule.id, slot.index)}>
                    {SLOT_ACTION_LABEL.claim}
                  </Button>
                )}
                {!slot.member && locked && (
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
                    {SLOT_ACTION_LABEL.locked}
                  </span>
                )}
                {isMine && !locked && (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(schedule.id, slot.index)}>
                    {SLOT_ACTION_LABEL.cancel}
                  </Button>
                )}
                {isMine && locked && !slot.seminarId && (
                  <Button variant="secondary" size="sm" onClick={() => onCreateSeminar(schedule, slot)}>
                    {SLOT_ACTION_LABEL.createSeminar}
                  </Button>
                )}
                {isMine && locked && slot.seminarApprovalStatus === 'REJECTED' && (
                  <Button variant="secondary" size="sm" onClick={() => onEditSeminar(schedule, slot)}>
                    {SLOT_ACTION_LABEL.editSeminar}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 3: 커밋**

`src/features/seminar/views/ScheduleCard.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 6: `useForm.js` 재생성 + `ClaimModal.jsx` + `SlotSeminarModal.jsx`

**Files:**
- Create: `src/features/seminar/useForm.js`
- Create: `src/features/seminar/views/ClaimModal.jsx`
- Create: `src/features/seminar/views/SlotSeminarModal.jsx`

**Interfaces:**
- Consumes: `useSeminar`(Task 4, edit 프리필용), `TARGET_GRADES`/`TARGET_GRADE_LABELS`
  (`@/shared/seminar/enums`, 기존).
- Produces:
  - `useForm(initial)` — `{ values, setValues, errors, setErrors, field, reset }`
    (과거 삭제 전과 동일한 계약 — Task 8이 두 벌 만든다: 클레임엔 안 씀, 세미나 폼에만 씀).
  - `ClaimModal({ schedule, error, onClose, onConfirm, pending })`
  - `SlotSeminarModal({ schedule, slot, form, editing, seminarId, onClose, onSubmit, pending })`
    — `editing=true`면 내부에서 `useSeminar(seminarId)`로 기존 값을 불러와 `form.setValues`로
    채운다.

- [ ] **Step 1: `useForm.js` 재생성**

이전에 이 파일이 있었으나(세미나 개설 모달 전용) 그 기능이 admin으로 옮겨가며 삭제됐다.
이번 태스크가 다시 필요로 하므로 동일한 내용으로 되살린다.

```js
import { useState, useCallback } from 'react';

/**
 * Minimal controlled-form helper (shared shape with the login page).
 *
 *   const f = useForm({ title: '', recruit: '' });
 *   <Input value={f.values.title} onChange={f.field('title')} error={f.errors.title} />
 *
 * `field(name)` returns an onChange handler that updates the value and clears
 * that field's error. `setErrors` replaces the whole error map after validation.
 * `reset()` restores the initial values and clears errors.
 */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const field = useCallback(
    (name) => (e) => {
      const v = e && e.target ? e.target.value : e;
      setValues((s) => ({ ...s, [name]: v }));
      setErrors((s) => {
        if (!s[name]) return s;
        const next = { ...s };
        delete next[name];
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
  }, [initial]);

  return { values, setValues, errors, setErrors, field, reset };
}
```

- [ ] **Step 2: `ClaimModal.jsx` 작성**

```jsx
import React from 'react';
import { Button } from '@/design-system';
import { ModalShell } from './ModalShell';

/** 슬롯 자기등록 확인 — 본인 프로필로 슬롯을 채우는 것 외에 입력값이 없다. */
export function ClaimModal({ schedule, error, onClose, onConfirm, pending = false }) {
  return (
    <ModalShell
      title="슬롯 등록"
      lead={`${schedule.month} ${schedule.day}일 (${schedule.weekday}) ${schedule.time} 일정에 발표자로 등록하시겠어요?`}
      onClose={onClose}
      maxWidth={420}
    >
      {error && (
        <p style={{ margin: '18px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--brand)' }}>
          {error}
        </p>
      )}
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onConfirm} disabled={pending}>{pending ? '등록 중…' : '등록하기'}</Button>
      </div>
    </ModalShell>
  );
}
```

- [ ] **Step 3: `SlotSeminarModal.jsx` 작성**

```jsx
import React, { useEffect } from 'react';
import { Button, Input } from '@/design-system';
import { TARGET_GRADES, TARGET_GRADE_LABELS } from '@/shared/seminar/enums';
import { ModalShell } from './ModalShell';
import { useSeminar } from '../seminar.queries';

/**
 * 슬롯에서 세미나 내용을 채워 제출/재제출하는 폼. 일시·장소·진행방식은 Schedule 값으로
 * 고정되어 입력칸이 없다(CreateModal과 달리 발표 내용만 채운다).
 *
 * `editing`이면 `seminarId`로 기존 세미나를 조회해 값을 채운다 — 반려 사유도 함께 보여준다.
 */
export function SlotSeminarModal({ schedule, slot, form, editing, seminarId, onClose, onSubmit, pending = false }) {
  const { values, errors, field, setValues } = form;
  const existing = useSeminar(seminarId, { enabled: !!editing && !!seminarId });

  useEffect(() => {
    if (!existing.data) return;
    const s = existing.data;
    setValues({
      title: s.title || '',
      speaker: s.speaker || '',
      topic: s.topic || '',
      description: s.description || '',
      attendanceCode: '',
      materialUrl: s.materialUrl || '',
      target: s.target || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  const toggleTarget = (key) => {
    const cur = values.target || [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    setValues((s) => ({ ...s, target: next }));
  };

  const loadingEdit = editing && existing.isLoading;

  return (
    <ModalShell
      title={editing ? '세미나 수정 제출' : '세미나 만들기'}
      lead={`${schedule.month} ${schedule.day}일 (${schedule.weekday}) ${schedule.time}${schedule.place ? ` · ${schedule.place}` : ''}`}
      onClose={onClose}
      maxWidth={540}
      align="top"
    >
      {editing && existing.data?.rejectReason && (
        <p style={{ margin: '18px 0 0', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          반려 사유: {existing.data.rejectReason}
        </p>
      )}
      <div style={{ marginTop: 22, display: 'grid', gap: 16, opacity: loadingEdit ? 0.5 : 1 }}>
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
        <Input
          as="textarea"
          label="상세 설명"
          placeholder="세미나에서 다룰 내용을 자유롭게 적어 주세요."
          value={values.description}
          onChange={field('description')}
        />
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
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending || loadingEdit}>{pending ? '제출 중…' : '제출'}</Button>
      </div>
    </ModalShell>
  );
}
```

`slot`은 이 컴포넌트 본문에서 직접 쓰이진 않지만(호출부가 `onSubmit`에서 클로저로 씀)
prop으로는 받아 둔다 — 호출부(Task 8)가 어느 슬롯에 제출하는지 이 모달의 생명주기(열림
상태 자체)로 판단하기 때문에 시그니처에 포함해 둔다.

- [ ] **Step 4: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과. `react-hooks/exhaustive-deps`가 `SlotSeminarModal`의
`eslint-disable-next-line` 줄 때문에 조용해야 한다(의도적으로 `existing.data`만 의존성으로
둠 — `setValues`는 안정적인 참조라 넣을 필요 없음).

- [ ] **Step 5: 커밋**

`src/features/seminar/useForm.js`, `src/features/seminar/views/ClaimModal.jsx`,
`src/features/seminar/views/SlotSeminarModal.jsx`를 스테이징하고 committer 서브에이전트
디스패치.

---

### Task 7: `ScheduleView.jsx`

**Files:**
- Create: `src/features/seminar/views/ScheduleView.jsx`

**Interfaces:**
- Consumes: `ScheduleCard`(Task 5), `EmptyState`(`./parts`, 기존), `EMPTY.schedules`(Task 4).
- Produces: `ScheduleView({ schedules, currentUserId, isLoggedIn, onClaim, onCancel,
  onCreateSeminar, onEditSeminar })` — Task 8(`SeminarPage`)이 렌더한다.

- [ ] **Step 1: 작성**

```jsx
import React from 'react';
import { ScheduleCard } from './ScheduleCard';
import { EmptyState } from './parts';
import { EMPTY } from '../seminar.data';

/** 일정 대시보드 — 필터 없이 전체 일정을 startsAt 오름차순 카드로. */
export function ScheduleView({ schedules, currentUserId, isLoggedIn, onClaim, onCancel, onCreateSeminar, onEditSeminar }) {
  const sorted = [...schedules].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  return (
    <div className="jr-anim">
      {sorted.length > 0 ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {sorted.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              onClaim={onClaim}
              onCancel={onCancel}
              onCreateSeminar={onCreateSeminar}
              onEditSeminar={onEditSeminar}
            />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.schedules}</EmptyState>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 3: 커밋**

`src/features/seminar/views/ScheduleView.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 8: `SeminarPage.jsx` 배선 — 탭 + 슬롯 액션 + 모달

**Files:**
- Modify: `src/features/seminar/views/index.js`
- Modify: `src/features/seminar/SeminarPage.jsx`

**Interfaces:**
- Consumes: `useSchedules`/`useClaimSlot`/`useCancelSlot`/`useSubmitSlotSeminar`(Task 3),
  `useResubmitSeminar`(Task 4), `useForm`/`ClaimModal`/`SlotSeminarModal`(Task 6),
  `ScheduleView`(Task 7), `SCHEDULE_MESSAGES`/`SCHEDULE_TOAST`(Task 2).
- Produces: 없음(페이지 최상위).

- [ ] **Step 1: `views/index.js`에 export 4개 추가**

현재 (`src/features/seminar/views/index.js`):

```js
export { Header as AppHeader } from '@/shared/ui/Header';
export { Toast } from './Toast';
export { Eyebrow, TabButton } from './parts';
export { ListView } from './ListView';
export { SeminarCard } from './SeminarCard';
export { AttendModal } from './AttendModal';
export { DetailModal } from './DetailModal';
```

교체:

```js
export { Header as AppHeader } from '@/shared/ui/Header';
export { Toast } from './Toast';
export { Eyebrow, TabButton } from './parts';
export { ListView } from './ListView';
export { ScheduleView } from './ScheduleView';
export { SeminarCard } from './SeminarCard';
export { AttendModal } from './AttendModal';
export { DetailModal } from './DetailModal';
export { ClaimModal } from './ClaimModal';
export { SlotSeminarModal } from './SlotSeminarModal';
```

- [ ] **Step 2: import 블록 교체**

현재 (`src/features/seminar/SeminarPage.jsx:1-13`):

```jsx
import React, { useState, useRef, useCallback } from 'react';
import './seminar.css';
import { useAuthStore } from '@/shared/auth/auth.store';
import { MESSAGES, TOAST } from './seminar.data';
import { useSeminars, useAttend } from './seminar.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  ListView,
  AttendModal,
  DetailModal,
} from './views';
```

교체:

```jsx
import React, { useState, useRef, useCallback } from 'react';
import './seminar.css';
import { useAuthStore } from '@/shared/auth/auth.store';
import { MESSAGES, TOAST } from './seminar.data';
import { SCHEDULE_MESSAGES, SCHEDULE_TOAST } from './schedule.data';
import { useSeminars, useAttend, useResubmitSeminar } from './seminar.queries';
import { useSchedules, useClaimSlot, useCancelSlot, useSubmitSlotSeminar } from './schedule.queries';
import { useForm } from './useForm';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  ListView,
  ScheduleView,
  AttendModal,
  DetailModal,
  ClaimModal,
  SlotSeminarModal,
} from './views';

const TABS = [
  { key: 'list', label: '목록' },
  { key: 'schedule', label: '일정' },
];
```

- [ ] **Step 3: state 블록에 탭·슬롯 관련 state 추가**

현재 (`src/features/seminar/SeminarPage.jsx`, `export default function SeminarPage()` 본문
시작 부분):

```jsx
export default function SeminarPage() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);

  const [filter, setFilter] = useState('upcoming'); // upcoming | ended | absent | all
  const [attended, setAttended] = useState({}); // seminarId -> true

  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');
  const [detailSeminar, setDetailSeminar] = useState(null);

  const [toast, setToast] = useState(null);
```

교체:

```jsx
export default function SeminarPage() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [view, setView] = useState('list'); // list | schedule
  const [filter, setFilter] = useState('upcoming'); // upcoming | ended | absent | all
  const [attended, setAttended] = useState({}); // seminarId -> true

  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');
  const [detailSeminar, setDetailSeminar] = useState(null);

  const [claimTarget, setClaimTarget] = useState(null); // { schedule, index }
  const [claimErr, setClaimErr] = useState('');
  const [seminarSlot, setSeminarSlot] = useState(null); // { schedule, slot, editing }
  const seminarSlotForm = useForm({ title: '', speaker: '', topic: '', description: '', attendanceCode: '', materialUrl: '', target: [] });

  const [toast, setToast] = useState(null);
```

- [ ] **Step 4: server-state 블록에 schedule 쿼리·뮤테이션 추가**

현재 (`src/features/seminar/SeminarPage.jsx`, `// --- server state ---` 블록):

```jsx
  // --- server state ---
  const seminarsQ = useSeminars();
  const attendM = useAttend({
    onSuccess: () => {
      setAttended((map) => ({ ...map, [attendSeminar.id]: true }));
      setAttendSeminar(null);
      showToast(TOAST.attended);
    },
    onError: (err) => {
      setAttendErr(err.code === 'INVALID_CODE' ? MESSAGES.codeWrong : MESSAGES.codeServer);
    },
  });

  // --- attend ---
```

교체:

```jsx
  // --- server state ---
  const seminarsQ = useSeminars();
  const schedulesQ = useSchedules();
  const attendM = useAttend({
    onSuccess: () => {
      setAttended((map) => ({ ...map, [attendSeminar.id]: true }));
      setAttendSeminar(null);
      showToast(TOAST.attended);
    },
    onError: (err) => {
      setAttendErr(err.code === 'INVALID_CODE' ? MESSAGES.codeWrong : MESSAGES.codeServer);
    },
  });
  const claimM = useClaimSlot({
    onSuccess: () => {
      setClaimTarget(null);
      showToast(SCHEDULE_TOAST.claimed);
    },
    onError: (err) => {
      setClaimErr(err.code === 'SLOT_TAKEN' ? SCHEDULE_MESSAGES.claimTaken : SCHEDULE_MESSAGES.claimServer);
    },
  });
  const cancelM = useCancelSlot({
    onSuccess: () => showToast(SCHEDULE_TOAST.canceled),
    onError: () => showToast(SCHEDULE_MESSAGES.cancelServer),
  });
  const submitSeminarM = useSubmitSlotSeminar({
    onSuccess: () => {
      setSeminarSlot(null);
      showToast(SCHEDULE_TOAST.seminarSubmitted);
    },
    onError: () => showToast(SCHEDULE_MESSAGES.seminarServer),
  });
  const resubmitSeminarM = useResubmitSeminar({
    onSuccess: () => {
      setSeminarSlot(null);
      showToast(SCHEDULE_TOAST.seminarResubmitted);
    },
    onError: () => showToast(SCHEDULE_MESSAGES.seminarServer),
  });

  // --- attend ---
```

- [ ] **Step 5: `const seminars = ...` 줄 뒤에 슬롯 핸들러 추가**

현재 (`src/features/seminar/SeminarPage.jsx`, `submitAttend` 함수 뒤):

```jsx
    // 코드 검증은 서버가 담당한다 — 실패 시 onError에서 메시지를 띄운다.
    setAttendErr('');
    attendM.mutate({ seminarId: attendSeminar.id, code });
  }

  const seminars = seminarsQ.data ?? [];
```

교체:

```jsx
    // 코드 검증은 서버가 담당한다 — 실패 시 onError에서 메시지를 띄운다.
    setAttendErr('');
    attendM.mutate({ seminarId: attendSeminar.id, code });
  }

  // --- schedule slots ---
  function openClaim(scheduleId, index) {
    const schedule = (schedulesQ.data ?? []).find((s) => s.id === scheduleId);
    setClaimTarget({ schedule, index });
    setClaimErr('');
  }
  function confirmClaim() {
    claimM.mutate({ scheduleId: claimTarget.schedule.id, index: claimTarget.index });
  }
  function cancelSlot(scheduleId, index) {
    cancelM.mutate({ scheduleId, index });
  }
  function openCreateSeminar(schedule, slot) {
    seminarSlotForm.reset();
    setSeminarSlot({ schedule, slot, editing: false });
  }
  function openEditSeminar(schedule, slot) {
    seminarSlotForm.reset();
    setSeminarSlot({ schedule, slot, editing: true });
  }
  function submitSeminarSlot() {
    if (!seminarSlotForm.values.title.trim()) {
      seminarSlotForm.setErrors({ title: SCHEDULE_MESSAGES.seminarTitleRequired });
      return;
    }
    if (seminarSlot.editing) {
      resubmitSeminarM.mutate({ id: seminarSlot.slot.seminarId, form: seminarSlotForm.values });
    } else {
      submitSeminarM.mutate({ scheduleId: seminarSlot.schedule.id, index: seminarSlot.slot.index, form: seminarSlotForm.values });
    }
  }

  const seminars = seminarsQ.data ?? [];
  const schedules = schedulesQ.data ?? [];
```

- [ ] **Step 6: 탭 내비 추가 + 목록/일정 렌더 분기**

현재 (`src/features/seminar/SeminarPage.jsx`, 페이지 타이틀 섹션 뒤):

```jsx
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              자람에서 열리는 세미나를 확인하고 출석을 체크하세요.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {seminarsQ.isLoading ? (
          <Notice>불러오는 중…</Notice>
        ) : seminarsQ.isError ? (
          <Notice>세미나 목록을 불러오지 못했습니다.</Notice>
        ) : (
          <ListView
            seminars={seminars}
            filter={filter}
            onFilter={setFilter}
            attended={attended}
            isLoggedIn={isLoggedIn}
            onAttend={openAttend}
            onOpenDetail={setDetailSeminar}
          />
        )}
      </section>
```

교체:

```jsx
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              자람에서 열리는 세미나를 확인하고 출석을 체크하세요.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '18px var(--container-pad) 0' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => (
            <TabButton key={t.key} active={view === t.key} onClick={() => setView(t.key)}>
              {t.label}
            </TabButton>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {view === 'list' ? (
          seminarsQ.isLoading ? (
            <Notice>불러오는 중…</Notice>
          ) : seminarsQ.isError ? (
            <Notice>세미나 목록을 불러오지 못했습니다.</Notice>
          ) : (
            <ListView
              seminars={seminars}
              filter={filter}
              onFilter={setFilter}
              attended={attended}
              isLoggedIn={isLoggedIn}
              onAttend={openAttend}
              onOpenDetail={setDetailSeminar}
            />
          )
        ) : schedulesQ.isLoading ? (
          <Notice>불러오는 중…</Notice>
        ) : schedulesQ.isError ? (
          <Notice>일정을 불러오지 못했습니다.</Notice>
        ) : (
          <ScheduleView
            schedules={schedules}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            onClaim={openClaim}
            onCancel={cancelSlot}
            onCreateSeminar={openCreateSeminar}
            onEditSeminar={openEditSeminar}
          />
        )}
      </section>
```

- [ ] **Step 7: 새 모달 렌더 추가**

현재 (`src/features/seminar/SeminarPage.jsx`, `DetailModal` 렌더 블록 뒤):

```jsx
      {detailSeminar && (
        <DetailModal
          seminar={detailSeminar}
          isLoggedIn={isLoggedIn}
          onClose={() => setDetailSeminar(null)}
        />
      )}

      <Toast message={toast} />
```

교체:

```jsx
      {detailSeminar && (
        <DetailModal
          seminar={detailSeminar}
          isLoggedIn={isLoggedIn}
          onClose={() => setDetailSeminar(null)}
        />
      )}

      {claimTarget && (
        <ClaimModal
          schedule={claimTarget.schedule}
          error={claimErr}
          onClose={() => setClaimTarget(null)}
          onConfirm={confirmClaim}
          pending={claimM.isPending}
        />
      )}

      {seminarSlot && (
        <SlotSeminarModal
          schedule={seminarSlot.schedule}
          slot={seminarSlot.slot}
          form={seminarSlotForm}
          editing={seminarSlot.editing}
          seminarId={seminarSlot.slot.seminarId}
          onClose={() => setSeminarSlot(null)}
          onSubmit={submitSeminarSlot}
          pending={submitSeminarM.isPending || resubmitSeminarM.isPending}
        />
      )}

      <Toast message={toast} />
```

- [ ] **Step 8: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 9: dev 서버에서 눈으로 확인**

Run: `npm run dev` → `http://localhost:5173` 세미나 페이지

기대:
- 진입 시 기본 탭이 "목록"이고 기존 화면과 동일하게 보인다.
- "일정" 탭 클릭 → 일정이 날짜 오름차순 카드로 보인다(백엔드 미연동이면 빈 상태 문구).
- 백엔드 연동 후: 빈 슬롯 "등록하기" → 확인 모달 → 등록되면 슬롯에 내 이름. 잠긴 일정의
  내 슬롯에서 "세미나 만들기" → 폼 제출 → 슬롯에 "대기중" 칩.

- [ ] **Step 10: 커밋**

`src/features/seminar/views/index.js`, `src/features/seminar/SeminarPage.jsx`를
스테이징하고 committer 서브에이전트 디스패치.

---

### Task 9: admin — `SCHEMAS.seminarApprovals` + SEED + 툴바 add 버튼 가드

**Files:**
- Modify: `src/features/admin/admin.data.js`
- Modify: `src/features/admin/views/table/TableToolbar.jsx`

**Interfaces:**
- Consumes: `APPLICATION_STATUS_LABEL`(기존, 대기/승인/반려 — `Seminar.approvalStatus`와
  값이 같은 enum이라 그대로 재사용).
- Produces: `RESOURCES.seminarApprovals`, `SCHEMAS.seminarApprovals`,
  `SEED.seminarApprovals`, `SEED.schedules` — Task 10(`admin.api.js`)·Task 12(라우트)·
  Task 13(`ScheduleAdminView`)이 쓴다.

- [ ] **Step 1: `TableToolbar`가 `addLabel`이 없으면 추가 버튼을 숨기게**

현재 (`src/features/admin/views/table/TableToolbar.jsx:34-43`):

```jsx
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        <button type="button" onClick={onExport} disabled={exporting} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Drive로 내보내기
        </button>
        <button type="button" onClick={onAddRow} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', border: '1.5px solid transparent', borderRadius: 8, cursor: 'pointer', boxShadow: 'var(--shadow-brand)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {schema.addLabel}
        </button>
      </div>
```

교체 (승인 대기 큐처럼 수기 등록 개념이 없는 리소스는 `schema.addLabel`을 비워 두면
버튼 자체가 안 뜨게):

```jsx
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        <button type="button" onClick={onExport} disabled={exporting} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Drive로 내보내기
        </button>
        {schema.addLabel && (
          <button type="button" onClick={onAddRow} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', border: '1.5px solid transparent', borderRadius: 8, cursor: 'pointer', boxShadow: 'var(--shadow-brand)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {schema.addLabel}
          </button>
        )}
      </div>
```

- [ ] **Step 2: `RESOURCES`에 `seminarApprovals` 추가**

현재 (`src/features/admin/admin.data.js`):

```js
export const RESOURCES = {
  member: { path: 'members', unit: '명', tab: 'member' },
  exec: { path: 'members', unit: '명', tab: 'exec' },
  contrib: { path: 'members', unit: '명', tab: 'contrib' },
  graduate: { path: 'members', unit: '명', tab: 'graduate' },
  seminars: { path: 'seminars', unit: '건' },
  studies: { path: 'studies', unit: '건' },
  applications: { path: 'applications', unit: '건' },
};
```

교체:

```js
export const RESOURCES = {
  member: { path: 'members', unit: '명', tab: 'member' },
  exec: { path: 'members', unit: '명', tab: 'exec' },
  contrib: { path: 'members', unit: '명', tab: 'contrib' },
  graduate: { path: 'members', unit: '명', tab: 'graduate' },
  seminars: { path: 'seminars', unit: '건' },
  studies: { path: 'studies', unit: '건' },
  applications: { path: 'applications', unit: '건' },
  seminarApprovals: { path: 'seminars', unit: '건' },
};
```

- [ ] **Step 3: `SCHEMAS`에 `seminarApprovals` 추가**

`SCHEMAS.seminars` 정의 바로 뒤(= `SCHEMAS.studies` 바로 앞)에 삽입:

```js
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
```

- [ ] **Step 4: `SEED`에 `seminarApprovals`/`schedules` 추가**

`SEED.seminars` 배열 바로 뒤(= `SEED.studies` 바로 앞)에 삽입:

```js
  seminarApprovals: [
    { id: 'sa1', title: 'Redis 캐시 전략 실습', speaker: '이하은', topic: 'Backend', startsAt: '2026-07-25 19:00', status: '대기' },
    { id: 'sa2', title: 'TypeScript 제네릭 딥다이브', speaker: '박도윤', topic: 'Frontend', startsAt: '2026-08-01 19:00', status: '대기' },
  ],
  schedules: [
    {
      id: 'sc1', startsAt: '2026-07-25T19:00', day: '25', month: '7월', weekday: '토', time: '19:00',
      place: '제3공학관 401호', mode: '오프라인', capacity: 3, status: 'OPEN',
      slots: [
        { index: 0, member: { id: 'm2', name: '이하은' }, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null },
        { index: 1, member: null, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null },
        { index: 2, member: null, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null },
      ],
    },
    {
      id: 'sc2', startsAt: '2026-08-01T19:00', day: '01', month: '8월', weekday: '토', time: '19:00',
      place: '제3공학관 401호', mode: '오프라인', capacity: 3, status: 'LOCKED',
      slots: [
        { index: 0, member: { id: 'm3', name: '박도윤' }, seminarId: 'sa2', seminarApprovalStatus: 'PENDING', seminarRejectReason: null },
        { index: 1, member: null, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null },
        { index: 2, member: null, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null },
      ],
    },
  ],
```

이 두 SEED 블록은 `VITE_ADMIN_MOCK`이 기본값(`true`)일 때만 쓰인다(`admin.api.js` 헤더
참고) — 백엔드 연동 시 admin.data.js 파일 헤더 지시대로 통째로 삭제 대상.

- [ ] **Step 5: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과. 기존 4개 리소스(`member`/`seminars`/`studies`/`applications`)의
추가 버튼이 여전히 보이는지(=`addLabel` 있는 스키마는 그대로 렌더되는지) Step 1 변경이
회귀를 안 만드는지가 핵심 — lint/typecheck/build로는 못 잡으니 Task 12 이후 수동 확인
때 같이 본다.

- [ ] **Step 6: 커밋**

`src/features/admin/admin.data.js`, `src/features/admin/views/table/TableToolbar.jsx`를
스테이징하고 committer 서브에이전트 디스패치.

---

### Task 10: `admin.api.js` — 세미나 승인 큐 + 일정 관리 함수

**Files:**
- Modify: `src/features/admin/admin.api.js`

**Interfaces:**
- Consumes: Task 9의 `SCHEMAS.seminarApprovals`/`RESOURCES.seminarApprovals`/
  `SEED.schedules`, Task 1 계약(`POST /api/admin/seminars/{id}/approve|reject`,
  `GET /api/schedules`, `POST /api/admin/schedules`, `PATCH /api/admin/schedules/{id}/lock`,
  `DELETE /api/admin/schedules/{id}/slots/{index}`).
- Produces: `approveSeminar(id)`, `rejectSeminar(id, reason)` — `saveBatch`가 내부에서
  쓰고, Task 11도 감싸지 않고 그대로 노출(이 두 함수는 admin.queries.js 훅 없이
  saveBatch 경유로만 호출된다 — applications와 동일 패턴). `fetchSchedules()`,
  `createSchedule(payload)`, `lockSchedule(id)`, `forceUnassignSlot(scheduleId, index)` —
  Task 11이 훅으로 감싼다.

- [ ] **Step 1: `fetchList` 디스패치에 `seminarApprovals` 추가**

현재 (`src/features/admin/admin.api.js:100-111`):

```js
export async function fetchList(resource, params = {}) {
  if (USE_MOCK) {
    await delay(200);
    return mockList(resource, params);
  }
  if (resource === 'applications') return fetchPendingApplications(params);
  // GET /api/admin/{resource}?tab=&q=&grade=&gen=&status=&sort=&page=&size= (AdminListResponse)
  const { path } = RESOURCES[resource];
  const query = toListQuery(resource, params);
  const { data } = await client.get(`/api/admin/${path}`, { params: query });
  return { ...data, items: (data.items || []).map((r) => fromWire(resource, r)) };
}
```

교체:

```js
export async function fetchList(resource, params = {}) {
  if (USE_MOCK) {
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
```

- [ ] **Step 2: `fetchPendingApplications` 뒤에 `fetchPendingSeminarApprovals` 추가**

현재 (`src/features/admin/admin.api.js:113-129`, `fetchPendingApplications` 함수):

```js
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
```

바로 뒤에 추가:

```js

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
```

- [ ] **Step 3: `saveBatch` 디스패치에 `seminarApprovals` 추가**

현재 (`src/features/admin/admin.api.js:157-176`):

```js
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
  if (resource === 'applications') return saveApplicationsQueue(updates, deletes);
  // PATCH /api/admin/{resource}:batch (AdminBatchRequest → AdminBatchResponse, 부분 성공)
  const { path } = RESOURCES[resource];
  try {
    const { data } = await client.patch(`/api/admin/${path}:batch`, body);
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}
```

교체:

```js
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
```

- [ ] **Step 4: `saveApplicationsQueue` 뒤에 `saveSeminarApprovalsQueue` 추가**

현재 (`src/features/admin/admin.api.js:184-200`, `saveApplicationsQueue` 함수 전체) 바로
뒤에 추가:

```js

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
```

- [ ] **Step 5: `rejectApplication` 뒤에 승인/반려 단건 함수 + 일정 관리 함수 블록 추가**

현재 (`src/features/admin/admin.api.js:213-222`, `rejectApplication` 함수) 바로 뒤,
`/* ── 대시보드 · 설정 · 내보내기 ─────` 구분선 앞에 추가:

```js

export async function approveSeminar(id) {
  if (USE_MOCK) { await delay(400); return { ok: true, id }; }
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/approve`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
export async function rejectSeminar(id, reason) {
  if (USE_MOCK) { await delay(300); return { ok: true, id }; }
  try {
    const { data } = await client.post(`/api/admin/seminars/${id}/reject`, { reason });
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

/* ── 일정(Schedule) 관리 ────────────────────────────────────────────
 * 슬롯별 개별 액션(해제)이 필요해 TableView 배치저장 모델에 안 맞는다 — 즉시 반영되는
 * 단건 액션으로 구현한다. 목록 조회는 공개 GET과 같은 데이터를 admin 전용 화면에서
 * 다시 쓰는 것뿐이라 별도 admin 전용 조회 엔드포인트를 만들지 않는다.
 */
export async function fetchSchedules() {
  if (USE_MOCK) { await delay(200); return SEED.schedules; }
  const { data } = await client.get('/api/schedules');
  return data;
}

export async function createSchedule(payload) {
  if (USE_MOCK) {
    await delay(400);
    return {
      id: 'srv-' + Date.now(),
      ...payload,
      day: '—', month: '—', weekday: '—', time: '—',
      status: 'OPEN',
      slots: Array.from({ length: payload.capacity || 3 }, (_, index) => ({
        index, member: null, seminarId: null, seminarApprovalStatus: null, seminarRejectReason: null,
      })),
    };
  }
  try {
    const { data } = await client.post('/api/admin/schedules', payload);
    return data;
  } catch (error) {
    throwWireError(error, 'VALIDATION');
  }
}

export async function lockSchedule(id) {
  if (USE_MOCK) { await delay(300); return { ok: true, id }; }
  try {
    const { data } = await client.patch(`/api/admin/schedules/${id}/lock`);
    return data;
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}

export async function forceUnassignSlot(scheduleId, index) {
  if (USE_MOCK) { await delay(300); return { ok: true }; }
  try {
    const { data } = await client.delete(`/api/admin/schedules/${scheduleId}/slots/${index}`);
    return data;
  } catch (error) {
    throwWireError(error, 'CONFLICT');
  }
}
```

- [ ] **Step 6: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 7: 커밋**

`src/features/admin/admin.api.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 11: `admin.queries.js` — 일정 관리 훅

**Files:**
- Modify: `src/features/admin/admin.queries.js`

**Interfaces:**
- Consumes: Task 10의 `fetchSchedules`/`createSchedule`/`lockSchedule`/`forceUnassignSlot`.
- Produces: `useSchedulesAdmin(options)`, `useCreateSchedule(options)`,
  `useLockSchedule(options)`, `useForceUnassignSlot(options)` — Task 13
  (`ScheduleAdminView`)이 쓴다.

- [ ] **Step 1: `adminKeys`에 `schedules` 추가**

현재 (`src/features/admin/admin.queries.js:10-15`):

```js
export const adminKeys = {
  all: ['admin'],
  list: (resource, params) => ['admin', 'list', resource, params],
  dashboard: () => ['admin', 'dashboard'],
  settings: () => ['admin', 'settings'],
};
```

교체:

```js
export const adminKeys = {
  all: ['admin'],
  list: (resource, params) => ['admin', 'list', resource, params],
  dashboard: () => ['admin', 'dashboard'],
  settings: () => ['admin', 'settings'],
  schedules: () => ['admin', 'schedules'],
};
```

- [ ] **Step 2: `useRejectApplication` 뒤에 일정 관리 훅 4개 추가**

현재 (`src/features/admin/admin.queries.js:55-65`, `useRejectApplication` 함수) 바로
뒤에 추가:

```js

export function useSchedulesAdmin(options = {}) {
  return useQuery({ queryKey: adminKeys.schedules(), queryFn: api.fetchSchedules, ...options });
}

export function useCreateSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSchedule,
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useLockSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.lockSchedule(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useForceUnassignSlot(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, index }) => api.forceUnassignSlot(scheduleId, index),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}
```

- [ ] **Step 3: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 4: 커밋**

`src/features/admin/admin.queries.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 12: `ScheduleAdminCard.jsx` + `CreateScheduleModal.jsx` + `ScheduleAdminView.jsx`

**Files:**
- Create: `src/features/admin/views/schedules/ScheduleAdminCard.jsx`
- Create: `src/features/admin/views/schedules/CreateScheduleModal.jsx`
- Create: `src/features/admin/views/schedules/ScheduleAdminView.jsx`
- Modify: `src/features/admin/views/index.js`

**Interfaces:**
- Consumes: `useSchedulesAdmin`/`useCreateSchedule`/`useLockSchedule`/`useForceUnassignSlot`
  (Task 11), `useAdminStore`(기존, `showToast`), `SCHEDULE_STATUS_LABELS`(Task 1).
- Produces: `ScheduleAdminView()` — Task 13이 라우트에 매단다.

admin은 다른 feature 폴더를 import하지 않는 관례라(`seminar/schedule.data.js`의
`SLOT_EMPTY`를 가져오지 않고) 빈 슬롯 문구 `'비어있음'`을 `ScheduleAdminCard.jsx` 안에
직접 쓴다. 폼 상태는 `AddRowModal.jsx`가 이미 하는 대로(구조화된 폼 훅 없이 컴포넌트
로컬 `useState`) 관리한다 — admin의 `useForm.js`(`useZodForm`, react-hook-form+zod
래퍼)는 4개 텍스트 필드짜리 단순 폼엔 과함.

- [ ] **Step 1: `ScheduleAdminCard.jsx` 작성**

```jsx
import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';

/**
 * 일정 관리 카드 — 슬롯별 맡은 회원 + 해제 버튼, 잠금 토글.
 * 빈 슬롯 문구('비어있음')는 회원용 ScheduleCard의 SLOT_EMPTY('미정')와 다른 단어를
 * 쓴다 — admin 표에서는 이 리소스가 "비어있는 자리"라는 관리 관점 문구가 자연스럽다.
 */
export function ScheduleAdminCard({ schedule, onLock, onForceUnassign, locking, unassigningIndex }) {
  const locked = schedule.status === 'LOCKED';

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
            {schedule.month} {schedule.day}일 ({schedule.weekday}) {schedule.time}
          </div>
          <div style={{ marginTop: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            {schedule.place || '장소 미정'} · 정원 {schedule.capacity}명
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
          <Button variant="secondary" size="sm" disabled={locked || locking} onClick={() => onLock(schedule.id)}>
            {locking ? '잠그는 중…' : locked ? '잠김' : '잠금'}
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        {schedule.slots.map((slot) => (
          <div
            key={slot.index}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
              {slot.member?.name ?? '비어있음'}
            </span>
            {slot.member && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!!slot.seminarId || unassigningIndex === slot.index}
                onClick={() => onForceUnassign(schedule.id, slot.index)}
              >
                {slot.seminarId ? '세미나 있음' : unassigningIndex === slot.index ? '해제 중…' : '해제'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

`slot.seminarId`가 있는 슬롯은 해제 버튼이 비활성 — Task 1 계약대로 그 상태에서
`DELETE /api/admin/schedules/{id}/slots/{index}`는 409를 준다(먼저 반려부터). 버튼을
막아 두면 그 요청 자체가 안 나가 사용자가 헛눌러도 에러 토스트를 안 보게 된다.

- [ ] **Step 2: `CreateScheduleModal.jsx` 작성**

```jsx
import React from 'react';
import { Button, Input } from '@/design-system';

/** 일정 생성 모달 — 날짜·장소·모드·정원만 입력한다. 슬롯은 서버가 capacity만큼 빈 채로 만든다. */
export function CreateScheduleModal({ values, errors, onChange, onClose, onSubmit, pending = false }) {
  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-strong)' }}>일정 만들기</h3>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <Input label="일시" type="datetime-local" value={values.startsAt} onChange={onChange('startsAt')} error={errors.startsAt} />
          <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={onChange('place')} />
          <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={onChange('mode')} />
          <Input label="정원" type="number" min={1} value={values.capacity} onChange={onChange('capacity')} />
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
          <Button onClick={onSubmit} disabled={pending}>{pending ? '생성 중…' : '만들기'}</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `ScheduleAdminView.jsx` 작성**

```jsx
import React, { useState } from 'react';
import { Button } from '@/design-system';
import { useAdminStore } from '../../admin.store';
import { useSchedulesAdmin, useCreateSchedule, useLockSchedule, useForceUnassignSlot } from '../../admin.queries';
import { ScheduleAdminCard } from './ScheduleAdminCard';
import { CreateScheduleModal } from './CreateScheduleModal';

const CREATE_DEFAULTS = { startsAt: '', place: '', mode: '', capacity: 3 };

/**
 * 일정 관리 — 슬롯별 개별 액션(해제)이 필요해 TableView가 아니라 카드형 커스텀 뷰로
 * 만든다. 승인 대기(SCHEMAS.seminarApprovals)와 달리 배치저장 모델을 쓰지 않고, 각
 * 액션(생성/잠금/해제)이 즉시 서버에 반영된다.
 */
export function ScheduleAdminView() {
  const showToast = useAdminStore((s) => s.showToast);
  const schedulesQ = useSchedulesAdmin();

  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState(CREATE_DEFAULTS);
  const [createErrors, setCreateErrors] = useState({});
  const [unassignTarget, setUnassignTarget] = useState(null); // { scheduleId, index }

  const createM = useCreateSchedule({
    onSuccess: () => {
      setCreateOpen(false);
      setCreateValues(CREATE_DEFAULTS);
      showToast('일정이 생성되었습니다.');
    },
    onError: () => showToast('일정 생성 중 오류가 발생했습니다.'),
  });
  const lockM = useLockSchedule({
    onSuccess: () => showToast('일정을 잠갔습니다.'),
    onError: () => showToast('잠금 처리 중 오류가 발생했습니다.'),
  });
  const unassignM = useForceUnassignSlot({
    onSuccess: () => { setUnassignTarget(null); showToast('슬롯을 해제했습니다.'); },
    onError: (err) => {
      setUnassignTarget(null);
      showToast(err.code === 'CONFLICT' ? '세미나가 있는 슬롯은 먼저 반려해야 해제할 수 있습니다.' : '슬롯 해제 중 오류가 발생했습니다.');
    },
  });

  const openCreate = () => { setCreateValues(CREATE_DEFAULTS); setCreateErrors({}); setCreateOpen(true); };
  const setCreateField = (key) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setCreateValues((s) => ({ ...s, [key]: v }));
    setCreateErrors((s) => ({ ...s, [key]: undefined }));
  };
  const submitCreate = () => {
    if (!createValues.startsAt) { setCreateErrors({ startsAt: '일시를 선택해 주세요.' }); return; }
    createM.mutate({
      startsAt: new Date(createValues.startsAt).toISOString(),
      place: createValues.place || null,
      mode: createValues.mode || null,
      capacity: Number(createValues.capacity) || 3,
    });
  };

  const onForceUnassign = (scheduleId, index) => {
    setUnassignTarget({ scheduleId, index });
    unassignM.mutate({ scheduleId, index });
  };

  const schedules = schedulesQ.data ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>SEMINAR</p>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1.1, color: 'var(--text-strong)' }}>일정 관리</h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>일정을 만들고, 자기등록 마감 후 잠근 뒤 슬롯을 관리하세요.</p>
        </div>
        <Button onClick={openCreate}>일정 만들기</Button>
      </div>

      {schedulesQ.isLoading ? (
        <p style={{ marginTop: 40, color: 'var(--text-muted)' }}>불러오는 중…</p>
      ) : schedules.length === 0 ? (
        <p style={{ marginTop: 40, color: 'var(--text-muted)' }}>등록된 일정이 없습니다.</p>
      ) : (
        <div style={{ marginTop: 28, display: 'grid', gap: 16 }}>
          {schedules.map((s) => (
            <ScheduleAdminCard
              key={s.id}
              schedule={s}
              onLock={(id) => lockM.mutate(id)}
              onForceUnassign={onForceUnassign}
              locking={lockM.isPending && lockM.variables === s.id}
              unassigningIndex={unassignTarget?.scheduleId === s.id ? unassignTarget.index : null}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateScheduleModal
          values={createValues}
          errors={createErrors}
          onChange={setCreateField}
          onClose={() => setCreateOpen(false)}
          onSubmit={submitCreate}
          pending={createM.isPending}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: `views/index.js`에 export 추가**

현재 (`src/features/admin/views/index.js`, `SettingsView` export 줄 이후):

```js
export { SettingsView } from './settings/SettingsView';
export { AddRowModal } from './forms/AddRowModal';
export { ConfirmDialog } from './forms/ConfirmDialog';
export { Toast } from './Toast';
```

교체:

```js
export { SettingsView } from './settings/SettingsView';
export { AddRowModal } from './forms/AddRowModal';
export { ConfirmDialog } from './forms/ConfirmDialog';
export { Toast } from './Toast';

export { ScheduleAdminView } from './schedules/ScheduleAdminView';
export { ScheduleAdminCard } from './schedules/ScheduleAdminCard';
export { CreateScheduleModal } from './schedules/CreateScheduleModal';
```

- [ ] **Step 5: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 6: 커밋**

`src/features/admin/views/schedules/ScheduleAdminCard.jsx`,
`src/features/admin/views/schedules/CreateScheduleModal.jsx`,
`src/features/admin/views/schedules/ScheduleAdminView.jsx`,
`src/features/admin/views/index.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 13: 라우트 · 사이드바 배선

**Files:**
- Modify: `src/features/admin/AdminPage.jsx`
- Modify: `src/features/admin/views/shell/AdminShell.jsx`
- Modify: `src/features/admin/views/shell/Sidebar.jsx`

**Interfaces:**
- Consumes: `ScheduleAdminView`(Task 12), `TableView`(기존, `resource="seminarApprovals"`로
  재사용).
- Produces: 없음(라우팅 최상위).

- [ ] **Step 1: `AdminPage.jsx`에 라우트 2개 추가**

현재 (`src/features/admin/AdminPage.jsx:1-37`):

```jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './admin.css';
import { AdminShell } from './views';
import { DashboardView } from './views';
import { TableView } from './views';
import { SettingsView } from './views';

/**
 * /admin 기능 엔트리. App.tsx 에는 스플랫 라우트 한 줄만 추가합니다 (DEVELOPMENT.md §3).
 *
 *   <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
 *
 * 하위 화면은 여기 중첩 라우트로 나눠 URL 로 상태화합니다 (새로고침·공유·뒤로가기 보존).
 *   /admin/dashboard  /admin/members(?tab=member|exec|contrib|graduate)
 *   /admin/seminars   /admin/studies   /admin/applications   /admin/settings
 * 표의 검색·필터·정렬·페이지도 searchParams(?q=&sort=&page=…)로 직렬화됩니다 (TableView).
 *
 * AdminShell 은 <Outlet/> 을 감싸는 레이아웃 라우트라, 화면 전환 시 사이드바·헤더는
 * 리렌더되지 않고 main 만 교체됩니다.
 */
export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="members" element={<TableView />} />
        <Route path="seminars" element={<TableView resource="seminars" />} />
        <Route path="studies" element={<TableView resource="studies" />} />
        <Route path="applications" element={<TableView resource="applications" />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
```

교체:

```jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './admin.css';
import { AdminShell } from './views';
import { DashboardView } from './views';
import { TableView } from './views';
import { SettingsView } from './views';
import { ScheduleAdminView } from './views';

/**
 * /admin 기능 엔트리. App.tsx 에는 스플랫 라우트 한 줄만 추가합니다 (DEVELOPMENT.md §3).
 *
 *   <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
 *
 * 하위 화면은 여기 중첩 라우트로 나눠 URL 로 상태화합니다 (새로고침·공유·뒤로가기 보존).
 *   /admin/dashboard  /admin/members(?tab=member|exec|contrib|graduate)
 *   /admin/seminars   /admin/studies   /admin/applications   /admin/settings
 *   /admin/schedules(일정 관리)   /admin/seminar-approvals(세미나 승인)
 * 표의 검색·필터·정렬·페이지도 searchParams(?q=&sort=&page=…)로 직렬화됩니다 (TableView).
 * `schedules`만 예외 — 슬롯별 개별 액션 때문에 TableView가 아니라 커스텀 뷰다.
 *
 * AdminShell 은 <Outlet/> 을 감싸는 레이아웃 라우트라, 화면 전환 시 사이드바·헤더는
 * 리렌더되지 않고 main 만 교체됩니다.
 */
export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="members" element={<TableView />} />
        <Route path="seminars" element={<TableView resource="seminars" />} />
        <Route path="studies" element={<TableView resource="studies" />} />
        <Route path="applications" element={<TableView resource="applications" />} />
        <Route path="schedules" element={<ScheduleAdminView />} />
        <Route path="seminar-approvals" element={<TableView resource="seminarApprovals" />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 2: `AdminShell.jsx`의 `currentResource`에 매핑 추가**

현재 (`src/features/admin/views/shell/AdminShell.jsx:11-16`):

```js
/** /admin/<seg> (+ ?tab=) → 현재 리소스 키. 이탈 가드·라벨에 사용. */
function currentResource(pathname, tab) {
  const seg = pathname.split('/').filter(Boolean)[1] || 'dashboard'; // ['admin', <seg>]
  if (seg === 'members') return tab || 'member';
  return seg; // dashboard | seminars | studies | applications | settings
}
```

교체 (URL은 kebab-case `seminar-approvals`, `admin.data.js`의 리소스 키는 camelCase
`seminarApprovals` — `TableView`가 그 키로 `byResource`/`SCHEMAS`를 찾으므로 여기서
맞춰 준다. `schedules`는 이름이 이미 같아 매핑이 필요 없다 — 다만 이 페이지는 배치저장
모델을 안 써서 `byResource.schedules`가 항상 비어 있고, 그래서 이탈 가드 대상이
아니라는 점만 알아 두면 된다):

```js
/** /admin/<seg> (+ ?tab=) → 현재 리소스 키. 이탈 가드·라벨에 사용. */
function currentResource(pathname, tab) {
  const seg = pathname.split('/').filter(Boolean)[1] || 'dashboard'; // ['admin', <seg>]
  if (seg === 'members') return tab || 'member';
  if (seg === 'seminar-approvals') return 'seminarApprovals';
  return seg; // dashboard | seminars | studies | applications | schedules | seminarApprovals | settings
}
```

- [ ] **Step 3: `Sidebar.jsx`에 nav 항목 2개 추가**

현재 (`src/features/admin/views/shell/Sidebar.jsx:12-19`):

```js
const NAV = [
  { to: 'dashboard', label: '대시보드', icon: I(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>) },
  { to: 'members', label: '인원 관리', icon: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>) },
  { to: 'seminars', label: '세미나 관리', icon: I(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>) },
  { to: 'studies', label: '스터디 관리', icon: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>) },
  { to: 'applications', label: '가입 신청·승인', badgeKey: 'pendingApplications', icon: I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>) },
  { to: 'settings', label: '설정', icon: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>) },
];
```

교체:

```js
const NAV = [
  { to: 'dashboard', label: '대시보드', icon: I(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>) },
  { to: 'members', label: '인원 관리', icon: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>) },
  { to: 'seminars', label: '세미나 관리', icon: I(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>) },
  { to: 'schedules', label: '일정 관리', icon: I(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>) },
  { to: 'seminar-approvals', label: '세미나 승인', icon: I(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>) },
  { to: 'studies', label: '스터디 관리', icon: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>) },
  { to: 'applications', label: '가입 신청·승인', badgeKey: 'pendingApplications', icon: I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>) },
  { to: 'settings', label: '설정', icon: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>) },
];
```

`seminar-approvals`엔 `applications`처럼 `badgeKey`(대기 건수 배지)를 안 붙인다 —
`DashboardStats` 계약에 `pendingSeminarApprovals` 같은 필드가 없고, 이번 스코프에서
대시보드 계약을 건드리지 않기로 했다(YAGNI, 필요해지면 별도 태스크).

- [ ] **Step 4: 검증**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과.

- [ ] **Step 5: dev 서버에서 눈으로 확인**

Run: `npm run dev` → `http://localhost:5173/admin` (임원 계정)

기대:
- 사이드바에 "일정 관리"/"세미나 승인"이 "세미나 관리" 바로 아래 보인다.
- "일정 관리" 클릭 → mock 일정 카드 2개(잠금 전/후 각 1개)가 보이고, "일정 만들기"로
  새 일정을 만들 수 있다. 잠긴 카드의 세미나 있는 슬롯은 "해제" 버튼이 비활성이다.
- "세미나 승인" 클릭 → mock 대기 세미나 2건이 표로 보이고, 승인/반려 버튼을 누르면
  상태가 스테이지(dirty 표시)되고 하단 저장바가 뜬다. 저장하면 토스트가 뜬다.
- 기존 "세미나 관리"/"스터디 관리"/"가입 신청·승인" 표의 "+추가" 버튼이 여전히 보인다
  (Task 9 Step 1의 조건부 렌더 회귀 확인).

- [ ] **Step 6: 커밋**

`src/features/admin/AdminPage.jsx`, `src/features/admin/views/shell/AdminShell.jsx`,
`src/features/admin/views/shell/Sidebar.jsx`를 스테이징하고 committer 서브에이전트
디스패치.

---

### Task 14: 최종 검증 (수동 시나리오)

이 레포엔 테스트 러너가 없다(Tech Stack 참조). 스펙 §사용자 흐름 전체를 아래 수동
체크리스트로 검증한다. BE(`home-jaram-be`)가 이 스펙을 참조한 플랜으로 아직 구현
중일 수 있으므로, 회원용 일정 탭 시나리오는 BE 준비 후 재확인이 필요할 수 있다 —
admin 쪽은 mock(`VITE_ADMIN_MOCK` 기본 `true`)으로 BE 없이 바로 확인 가능하다.

**Files:** 없음 (검증 전용 태스크).

**Interfaces:** 없음.

- [ ] **Step 1: 정적 게이트**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 셋 다 통과. build의 `Some chunks are larger than 500 kB` 경고 **하나만**
허용(baseline과 동일). 다른 출력이 있으면 회귀다.

- [ ] **Step 2: openapi 문법 재확인**

Run: `python3 -c "import yaml; yaml.safe_load(open('docs/api/openapi.yaml')); print('valid yaml')"`
Expected: `valid yaml`.

- [ ] **Step 3: admin 쪽 수동 시나리오 (mock, BE 불필요)**

Run: `npm run dev` → `http://localhost:5173/admin` (임원 계정)

- [ ] "일정 관리"에서 "일정 만들기"로 일시·장소·정원을 채워 생성 → 목록에 새 카드가
  보인다(정원만큼 빈 슬롯).
- [ ] "잠금" 버튼 → 카드 상태 배지가 "모집 중"→"잠김"으로 바뀌고 버튼이 비활성된다.
- [ ] "세미나 승인"에서 "승인"/"반려" 버튼 클릭 → 행이 dirty 표시되고 하단 저장바가
  뜬다. "저장" → 토스트가 뜨고 dirty 표시가 사라진다.

- [ ] **Step 4: 회원 쪽 수동 시나리오 (BE 연동 후)**

Run: `npm run dev` → `http://localhost:5173` 세미나 페이지, 학회원 계정으로 로그인

- [ ] 진입 시 기본 탭이 "목록"이고 기존 화면과 동일하다.
- [ ] "일정" 탭 → 일정이 날짜 오름차순 카드로 보인다.
- [ ] OPEN 일정의 빈 슬롯 "등록하기" → 확인 모달 → 확인 → 슬롯에 내 이름, 토스트.
- [ ] 같은 슬롯에 "포기하기" → 슬롯이 다시 비고 토스트.
- [ ] (임원 계정으로 그 일정을 잠근 뒤) 내 슬롯에 "세미나 만들기" → 폼 제출 → 슬롯에
  "대기중" 칩, 토스트. 세미나 목록/일정 탭 어디에도 이 세미나가 정식으로는 안 보인다
  (PENDING 비공개, 스펙 §엣지케이스).
- [ ] (임원 계정으로 "세미나 승인"에서 반려) 다시 학회원 계정으로 보면 슬롯 칩이
  "반려됨"으로 바뀌고 "수정하기" 버튼이 보인다. 클릭 → 폼에 기존 값이 채워지고 반려
  사유가 보인다. 수정 후 제출 → 칩이 다시 "대기중"으로.
- [ ] (임원 계정으로 승인) 다시 학회원 계정으로 새로고침 → 그 세미나가 "목록"/"일정"
  탭 정식 목록에 나타난다.
- [ ] 두 브라우저 탭으로 같은 빈 슬롯에 거의 동시에 "등록하기" → 하나만 성공하고
  나머지는 "방금 다른 분이 등록해서 자리가 찼습니다" 토스트(스펙 §엣지케이스 —
  409 동시성).

- [ ] **Step 5: 회귀 확인**

- [ ] "목록" 탭 — 필터 칩 순서·카드 클릭 상세 모달·출석 체크·ENDED 칩 3분기가 이번
  변경 전과 동일하게 동작한다(이번 플랜은 `ListView`/`SeminarCard`/`DetailModal`을
  건드리지 않았으니 회귀 없어야 정상).
- [ ] admin "세미나 관리"/"스터디 관리"/"가입 신청·승인" 표가 이번 변경 전과 동일하게
  동작한다(Task 9의 `TableToolbar` 가드, Task 12/13에서 건드린 `views/index.js`·
  `AdminPage.jsx`·`AdminShell.jsx`·`Sidebar.jsx`가 기존 라우트를 안 건드렸는지 확인).

- [ ] **Step 6: 최종 커밋**

코드 변경이 없으면 커밋하지 않는다. Step 3~5에서 고칠 게 나왔다면 수정 후 committer
서브에이전트로 커밋한다.

---

## Self-Review

**1. 스펙 커버리지** (스펙 §데이터 모델·§상태 머신·§사용자 흐름·§API 계약·§엣지케이스):

| 스펙 항목 | 태스크 |
|---|---|
| `Schedule`/`ScheduleSlot`/`Seminar` 필드 확장 (계약) | Task 1 |
| Schedule 상태머신 OPEN→LOCKED (수동 토글만) | Task 1(계약)·Task 10(`lockSchedule`)·Task 12(`ScheduleAdminCard` 잠금 버튼) |
| 슬롯 자기등록(선착순) | Task 2·3(`claimSlot`)·Task 5(`ScheduleCard`)·Task 6(`ClaimModal`)·Task 8(배선) |
| 세미나 생성은 LOCKED 이후에만(순서 제약) | Task 5(`ScheduleCard`가 `locked` 상태로만 "세미나 만들기" 노출)·Task 1(계약 설명에 명시) |
| PENDING→APPROVED/REJECTED, 재제출 | Task 4(`resubmitSeminar`)·Task 6(`SlotSeminarModal` editing)·Task 8(배선)·Task 9~11(admin 승인 큐) |
| PENDING/REJECTED 비공개 | Task 1(계약 설명 — 공개 GET은 APPROVED만), FE는 별도 필터링 코드가 필요 없다(서버가 이미 걸러 줌) |
| 자진취소(OPEN에서만) | Task 2·3(`cancelSlot`)·Task 5(`ScheduleCard`, `!locked`일 때만 "포기하기") |
| 임원 강제해제(세미나 있으면 409) | Task 10(`forceUnassignSlot`)·Task 12(`ScheduleAdminCard`, `slot.seminarId` 있으면 버튼 비활성) |
| 동시 등록 경쟁(409) | Task 2(`claimSlot`의 `SLOT_TAKEN` 코드)·Task 8(`claimM.onError`) |
| 중복 등록 제한 없음 | 별도 구현 불필요 — 서버가 막지 않으므로 FE도 막지 않는다(구현 안 함이 곧 이 요구사항 충족) |
| 임원 직접생성 세미나와 슬롯 세미나 공존 | 기존 `/admin/seminars` 테이블 그대로 유지, 이번 플랜은 안 건드림(스펙 §범위 밖 확인 항목) |
| Phase 1 스펙 대체(`ScheduleCard` 실데이터화) | Task 5·7이 Phase 1의 placeholder `SLOT_EMPTY` 상수 이름은 유지하되 렌더 로직은 완전히 새로 만듦 |

**2. 플레이스홀더 스캔:** TBD/TODO 없음. 모든 코드 스텝에 실제 코드가 들어 있다. Task 14는
코드가 아니라 검증 태스크라 체크리스트가 본문이다.

**3. 타입/시그니처 일관성:**
- `Schedule.slots[].member`가 `null`이면 빈 슬롯 — Task 5(`ScheduleCard`)·Task
  12(`ScheduleAdminCard`) 둘 다 `slot.member?.name`으로 동일하게 읽는다.
- `slot.seminarApprovalStatus`/`slot.seminarRejectReason`은 Task 1 계약에서 슬롯에
  얹은 파생 필드 — Task 5가 칩 렌더에, Task 12가 해제 버튼 비활성 조건에 쓴다. 두
  군데 다 `slot.seminarId`(존재 여부)와 `slot.seminarApprovalStatus`(값)를 같은
  의미로 쓴다.
- `useClaimSlot`/`useCancelSlot`/`useSubmitSlotSeminar`(Task 3)와
  `openClaim`/`cancelSlot`/`submitSeminarSlot`(Task 8)의 인자 모양이 정확히
  일치한다: `{ scheduleId, index }`, `{ scheduleId, index, form }`.
- `SEMINAR_APPROVAL_CHIP`(Task 4, `seminar.data.js`)의 키는 `PENDING`/`REJECTED`뿐 —
  `APPROVED`는 슬롯 칩에 안 쓰므로(정식 목록에 이미 노출) Task 5의
  `SEMINAR_APPROVAL_CHIP[slot.seminarApprovalStatus]`가 `APPROVED`일 때 `undefined`를
  반환해 칩이 안 뜨는 게 의도된 동작이다.
- admin `RESOURCES.seminarApprovals`/`SCHEMAS.seminarApprovals`(Task 9)의 리소스 키
  `seminarApprovals`(camelCase)와 URL 세그먼트 `seminar-approvals`(kebab-case)는
  Task 13의 `currentResource` 매핑에서만 만난다 — `TableView`엔 항상
  `resource="seminarApprovals"`를 라우트에서 직접 넘기므로(Task 13 Step 1) URL
  파싱에 의존하지 않는다.

**4. 스코프 확인:** 14개 태스크 모두 `home-jaram-fe` 레포 안에서 끝난다. BE 구현은
범위 밖(Global Constraints 참고) — `home-jaram-be`가 이 스펙을 참조하는 별도 플랜을
가져야 한다.

## 이 플랜이 다루지 않는 것

- BE 구현(`home-jaram-be` 레포) — 별도 플랜.
- Schedule 재오픈(LOCKED→OPEN), 슬롯 정원 사후 변경, 미제출 자동 마감/알림(스펙 §범위
  밖과 동일).
- `seminar-approvals` 사이드바 배지(대기 건수) — `DashboardStats` 계약 확장이 필요해
  별도 태스크감.
- 테스트 인프라(vitest/RTL) 도입 — 기존 선례(lint/typecheck/build/manual) 유지.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-18-seminar-slot-registration.md`.
Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review
between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch
execution with checkpoints

**Which approach?**
