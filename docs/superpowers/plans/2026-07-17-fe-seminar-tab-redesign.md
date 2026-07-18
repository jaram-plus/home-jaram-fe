# 세미나 탭 개선 (FE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세미나 목록 화면에 탭 순서 재배열(예정→종료→전체), 카드 클릭 상세 모달, ONGOING 출석 카운트다운, ENDED 카드의 출석/결석 칩을 붙인다 — 서버가 새로 주는 `attendedAt`·`attendanceClosesAt`·`description`과 신규 참석자 미리보기 엔드포인트를 소비한다.

**Architecture:** 기존 `src/features/seminar` 구조(Page → views → queries.js → api.js → axios client)를 그대로 유지한다. 새 파일은 3개뿐: 카운트다운 훅 `useAttendanceCountdown.js`, 상세 모달 `views/DetailModal.jsx`, 그리고 `seminar.data.js`에 추가되는 카피 상수. "출석함" 판정의 진실원이 로컬 `useState({})`에서 서버 `attendedAt` 필드로 옮겨가고, 로컬 state는 refetch 전까지의 낙관적 오버레이로만 남는다.

**Tech Stack:** React 19, Vite 7, TanStack Query v5, Zustand, axios — **이 레포에 테스트 러너 없음**(vitest/jest 의존성 0개, `*.test.*`/`*.spec.*` 파일 0개, 2026-07-04 플랜에서 확인·명문화된 선례). 검증은 `npm run lint` + `npm run typecheck` + `npm run build` + 수동 dev-server 확인.

**Source spec:** `../home-jaram-be/docs/superpowers/specs/2026-07-17-seminar-tab-redesign-design.md` (§Frontend). 이 스펙은 두 저장소에 걸쳐 있고, 이 플랜은 **FE만** 다룬다.

## Global Constraints

- **레포:** 이 레포(`home-jaram-fe`). 모든 명령은 레포 루트에서 실행.
- **`docs/api/openapi.yaml`은 이 작업에서 건드리지 않는다.** 계약 소유는 FE지만, 이 기능의 계약 편집은 **BE 플랜**(`../home-jaram-be/docs/superpowers/plans/2026-07-17-be-seminar-tab-redesign.md` Task 1·2)이 심링크를 통해 담당하기로 이미 정해져 있다. 중복 편집하면 충돌한다. **2026-07-17 현재 확인된 계약 상태:**
  - 이미 반영됨 — `Seminar.description` / `Seminar.attendanceClosesAt` / `Seminar.attendedAt` (`docs/api/openapi.yaml:886-888`), `SeminarCreateRequest.description` (`:905`). `attendanceClosesAt`는 `required` 목록에도 들어감(`:867`).
  - **아직 없음** — `AttendeePreviewEntry` / `AttendeePreviewResponse` 스키마와 `/api/seminars/{id}/attendees` 경로. BE 플랜 Task 2가 추가한다. Task 4는 스펙에 적힌 이 계약을 **선행 기준**으로 구현한다(사용자 결정: BE와 동시 개발 중, FE는 계약 기준으로 선행).
- **UI 카피:** 한국어, 존댓말, 이모지 금지 (프로젝트 CLAUDE.md). 라틴 문자는 소문자 대문자 아이라벨로만.
- **스타일:** `src/design-system` 컴포넌트와 `var(--token)` CSS 변수만. 새 색·폰트·여백 값 발명 금지. **이 작업에서 쓸 토큰(존재 확인 완료):** `--font-sans`, `--font-serif`, `--font-mono`, `--fs-xs`, `--fs-sm`, `--fs-body`, `--fs-lead`, `--fs-title-3`, `--w-semibold`, `--w-medium`, `--w-bold`, `--ls-label`, `--lh-normal`, `--text-strong`, `--text-body`, `--text-muted`, `--text-faint`, `--border`, `--border-soft`, `--surface-card`, `--surface-sunken`, `--radius-lg`.
- **디자인 시스템 API(확인 완료):** `Tag` tone은 `neutral | brand | seal | outline`. `Input`은 `as="textarea"` 지원(`resize: vertical`, `minHeight: 96px` 자동). `Button`은 `onClick`을 DOM 노드에 그대로 전달 → `e.stopPropagation()` 동작함.
- **카피는 `seminar.data.js`에 모은다.** 뷰에 한글 문자열 리터럴을 인라인하지 않는다 (기존 `MESSAGES`/`TOAST`/`EMPTY`/`ATTEND_LABEL` 패턴).
- **상태 라벨은 `@/shared/seminar/enums.js`에서만** 온다 (`SEMINAR_STATUS_LABELS`). 새 라벨 맵 만들지 않는다.
- **검증 baseline (2026-07-17, 이 플랜 착수 전 실행·확인):** `npm run lint` → 통과(출력 없음), `npm run typecheck` → 통과, `npm run build` → 성공. 단 build는 `Some chunks are larger than 500 kB` **경고를 원래 뱉는다 — 기존 상태이며 실패 아님**. 모든 체크포인트에서 이 경고 하나만 허용된다. 다른 에러·경고가 뜨면 회귀이므로 멈추고 조사한다(superpowers:systematic-debugging).
- **커밋:** 사용자 글로벌 규칙에 따라 모든 커밋은 `committer` 서브에이전트(Agent tool, `subagent_type: "committer"`)에 위임한다. **직접 `git commit` 실행 금지.** 아래 모든 "커밋" 스텝은 "해당 파일을 스테이징한 뒤 committer 서브에이전트를 디스패치한다"는 뜻이다.

## 범위 밖 (스펙 §범위 밖 + 이번에 발견한 것)

- `Seminar.capacity` → `target: TargetGrade[]` 계약 드리프트 (BE 미구현, 별개 갭).
- 서버 사이드 탭 필터링/페이지네이션 — 클라이언트 필터링 유지.
- 실시간 ONGOING→ENDED 전환 push/polling — react-query 기본 refetch에 의존.
- 최초 선택 탭 변경 — `SeminarPage.jsx:49`의 `useState('all')` 그대로. **표시 순서만 바뀐다.**
- **`SeminarCard.jsx:67`의 `seminar.material` 버그** — 계약상 필드명은 `materialUrl`이라 이 조건은 항상 falsy이고 카드의 발표자료 링크는 렌더된 적이 없다(`href="#"` 플레이스홀더도 마찬가지). 스펙이 "카드의 `href="#"` 플레이스홀더는 기존 이슈, 이번 스코프 아님"이라고 명시했으므로 **카드는 손대지 않는다.** 단 Task 4의 DetailModal은 `materialUrl`을 올바르게 쓴다(스펙: "모달에는 있는 값이니 그대로 노출은 함").
- **카드 클릭의 키보드 접근성** — 스펙이 "카드 루트 `div`에 `onClick` 추가"만 요구하고, 이 레포엔 jsx-a11y 린트가 없다. `role="button"`을 붙이면 내부 `<Button>`이 중첩 인터랙티브가 되어 오히려 무효 마크업이 된다. 후속 과제로 남긴다.

## File Structure

```
src/features/seminar/
  seminar.data.js               # + ENDED_CHIP, COUNTDOWN_LABEL, DETAIL 카피 (Task 2·3·4)
  seminar.api.js                # + getAttendeePreview, createSeminar에 description (Task 4·5)
  seminar.queries.js            # + useAttendeePreview, useAttend가 목록 무효화 (Task 2·4)
  useAttendanceCountdown.js     # 신규 — 남은 분 계산 훅 (Task 3)
  SeminarPage.jsx               # + detailSeminar state·핸들러·<DetailModal>, 폼에 description (Task 4·5)
  views/
    ListView.jsx                # FILTERS 순서, onOpenDetail 통과 (Task 1·4)
    SeminarCard.jsx             # 칩 3분기·카운트다운·카드 클릭 (Task 2·3·4)
    DetailModal.jsx             # 신규 — 상세 모달 (Task 4)
    CreateModal.jsx             # + description textarea (Task 5)
    index.js                    # + DetailModal export (Task 4)
```

---

### Task 1: 탭 순서를 예정 → 종료 → 전체로

**Files:**
- Modify: `src/features/seminar/views/ListView.jsx:6-10`

**Interfaces:**
- Consumes: 없음.
- Produces: 없음 (`pass()` 로직은 키 기반이라 순서와 무관하고, 필터 키 `all`/`upcoming`/`ended`는 그대로다).

- [x] **Step 1: `FILTERS` 배열 재배열**

현재 (`src/features/seminar/views/ListView.jsx:6-10`):

```js
const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
];
```

다음으로 교체:

```js
// 표시 순서: 예정 → 종료 → 전체. 최초 선택 탭은 SeminarPage의 useState('all') 그대로다.
const FILTERS = [
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
  { key: 'all', label: '전체' },
];
```

- [x] **Step 2: 검증**

실행: `npm run lint && npm run build`
기대: lint 출력 없음, build 성공(`Some chunks are larger than 500 kB` 경고만).

- [x] **Step 3: dev 서버에서 눈으로 확인** (source/build 레벨로 대체 — 브라우저 자동화 도구 없어 육안 확인은 사용자 몫으로 남김)

실행: `npm run dev` → `http://localhost:5173` 세미나 페이지
기대: 필터 칩이 왼쪽부터 `예정` `종료` `전체` 순. 최초에는 `전체`가 활성(브랜드 색)이다.

- [x] **Step 4: 커밋**

`src/features/seminar/views/ListView.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 2: 출석 판정을 서버 `attendedAt`으로 + ENDED 칩 3분기

서버가 이제 호출자 기준 `attendedAt`(출석 시각 표시 문자열, 예 `"19:02"`, 미출석·비로그인이면 `null`)을 준다. 지금까지 FE는 출석 여부를 `SeminarPage.jsx:50`의 `useState({})`로만 흉내 냈고 새로고침하면 사라졌다. 이 태스크는 진실원을 서버로 옮기고, 로컬 state는 refetch 도착 전까지의 낙관적 오버레이로만 남긴다.

**Files:**
- Modify: `src/features/seminar/seminar.data.js:59-64` (`ATTEND_LABEL` 뒤에 `ENDED_CHIP` 추가)
- Modify: `src/features/seminar/seminar.queries.js:27-29` (`useAttend`가 목록 무효화)
- Modify: `src/features/seminar/views/SeminarCard.jsx:11-14` (시그니처·칩·출석 판정)

**Interfaces:**
- Consumes: 계약의 `Seminar.attendedAt` (`docs/api/openapi.yaml:888`) — `string | null`, ISO가 아니라 **표시용 `HH:mm` 문자열**이다. 파싱하지 말고 그대로 렌더한다.
- Produces:
  - `ENDED_CHIP` — `{ attended: { label, tone }, absent: { label, tone } }`. Task 3·4는 안 쓴다.
  - `SeminarCard`의 새 prop `isLoggedIn: boolean` — Task 4에서 `ListView`가 통과시킨다. 이 태스크에서는 `ListView`가 아직 안 넘기므로 `undefined`(= falsy = 비로그인 취급)로 들어온다. **Task 4가 배선을 완성한다.**

- [x] **Step 1: `seminar.data.js`에 ENDED 칩 카피 추가**

현재 (`src/features/seminar/seminar.data.js:59-64`):

```js
// status → disabled CTA label (when the user can't check in). `done` = 출석 완료.
export const ATTEND_LABEL = {
  done: '출석 완료',
  UPCOMING: '출석 시간 전입니다',
  ENDED: '출석이 마감되었습니다',
};
```

바로 뒤에 다음을 추가:

```js
// ENDED 카드의 칩은 로그인한 회원에게만 개인화된다.
// 비로그인은 서버가 attendedAt을 채워줄 수 없으므로 STATUS_BADGE.ENDED('종료')로 폴백한다.
export const ENDED_CHIP = {
  attended: { label: '출석', tone: 'seal' },
  absent: { label: '결석', tone: 'neutral' },
};
```

- [x] **Step 2: `useAttend` 성공 시 세미나 목록 무효화**

현재 (`src/features/seminar/seminar.queries.js:27-29`):

```js
export function useAttend(options) {
  return useMutation({ mutationFn: api.checkAttendance, ...options });
}
```

다음으로 교체 (`useCreateSeminar`와 같은 구조):

```js
export function useAttend(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.checkAttendance,
    ...options,
    onSuccess: (...args) => {
      // 출석하면 서버의 attendedAt이 바뀌므로 목록을 다시 받아 온다.
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}
```

`useQueryClient`는 `seminar.queries.js:1`에서 이미 import 중이다 — import 줄은 손대지 않는다.

- [x] **Step 3: `SeminarCard`가 `attendedAt`을 읽고 칩을 분기**

현재 (`src/features/seminar/views/SeminarCard.jsx:1-14`):

```jsx
import React from 'react';
import { Button, Tag } from '@/design-system';
import { TopicChip } from './parts';
import { STATUS_BADGE, ATTEND_LABEL } from '../seminar.data';

/**
 * One seminar in the list — date block · body · attend action.
 * `attended` marks a seminar the user has already checked into; the CTA is
 * enabled only while a seminar is `ongoing` and not yet attended.
 */
export function SeminarCard({ seminar, attended, onAttend }) {
  const badge = STATUS_BADGE[seminar.status];
  const canAttend = !attended && seminar.status === 'ONGOING';
  const label = attended ? ATTEND_LABEL.done : ATTEND_LABEL[seminar.status];
```

다음으로 교체:

```jsx
import React from 'react';
import { Button, Tag } from '@/design-system';
import { TopicChip } from './parts';
import { STATUS_BADGE, ATTEND_LABEL, ENDED_CHIP } from '../seminar.data';

/**
 * One seminar in the list — date block · body · attend action.
 *
 * 출석 여부의 진실원은 서버가 준 `seminar.attendedAt`(호출자 기준, 비로그인이면 null)이다.
 * `attended` prop은 출석 직후 목록 refetch가 도착하기 전까지만 쓰이는 낙관적 오버레이다.
 * ENDED 칩만 로그인 상태로 개인화된다 — 비로그인은 개인화할 근거가 없어 '종료'로 폴백한다.
 */
export function SeminarCard({ seminar, attended, isLoggedIn, onAttend }) {
  const isAttended = attended || Boolean(seminar.attendedAt);
  const canAttend = !isAttended && seminar.status === 'ONGOING';
  const label = isAttended ? ATTEND_LABEL.done : ATTEND_LABEL[seminar.status];

  const endedChip = !isLoggedIn
    ? STATUS_BADGE.ENDED
    : seminar.attendedAt
      ? ENDED_CHIP.attended
      : ENDED_CHIP.absent;
  const badge = seminar.status === 'ENDED' ? endedChip : STATUS_BADGE[seminar.status];
```

`badge`를 쓰는 렌더 부분(`SeminarCard.jsx:58`의 `<Tag tone={badge.tone} size="sm">{badge.label}</Tag>`)은 그대로 둔다 — 모양이 같다.

- [x] **Step 4: 검증**

실행: `npm run lint && npm run typecheck && npm run build`
기대: 셋 다 통과. build는 청크 경고만.

- [x] **Step 5: 커밋**

`src/features/seminar/seminar.data.js`, `src/features/seminar/seminar.queries.js`, `src/features/seminar/views/SeminarCard.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 3: 출석 카운트다운 훅 + 카드 문구

서버가 `attendanceClosesAt`(ISO-8601 절대 시각, `startsAt + 출석창`)을 주므로 클라이언트가 남은 분을 계산한다. **폴링 아님** — 30초마다 로컬 시계만 다시 읽는다.

**Files:**
- Create: `src/features/seminar/useAttendanceCountdown.js`
- Modify: `src/features/seminar/seminar.data.js` (Task 2에서 추가한 `ENDED_CHIP` 뒤)
- Modify: `src/features/seminar/views/SeminarCard.jsx` (import, 훅 호출, action 영역)

**Interfaces:**
- Consumes: 계약의 `Seminar.attendanceClosesAt` (`docs/api/openapi.yaml:887`) — `required`이므로 항상 존재하지만, 훅은 `null`/파싱 실패도 `0`으로 방어한다.
- Produces:
  - `useAttendanceCountdown(closesAt: string | null | undefined): number` — 마감까지 남은 **분**(올림), 마감 후·값 없음·파싱 실패는 `0`.
  - `COUNTDOWN_LABEL(mins: number): string` — Task 4는 안 쓴다.

- [x] **Step 1: 카운트다운 훅 생성**

`src/features/seminar/useAttendanceCountdown.js` 신규 파일:

```js
import { useState, useEffect } from 'react';

/**
 * 출석 인정 마감까지 남은 분을 센다.
 *
 * 서버가 준 절대 시각(`attendanceClosesAt`, ISO-8601)이 기준이고, 클라이언트는
 * 30초마다 로컬 시계만 다시 읽는다 — 서버 폴링이 아니다. 마감이 지났거나 값이
 * 없거나 파싱할 수 없으면 0을 돌려주고, 호출부가 문구를 숨긴다.
 *
 *   const mins = useAttendanceCountdown(seminar.attendanceClosesAt);
 */
export function useAttendanceCountdown(closesAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!closesAt) return 0;
  const closes = new Date(closesAt).getTime();
  if (Number.isNaN(closes)) return 0;
  return Math.max(0, Math.ceil((closes - now) / 60_000));
}
```

- [x] **Step 2: `seminar.data.js`에 카운트다운 카피 추가**

Task 2에서 넣은 `ENDED_CHIP` 블록 바로 뒤에 추가:

```js
// ONGOING 카드에서 출석 버튼 아래 한 줄. mins는 useAttendanceCountdown이 계산한 남은 분.
export const COUNTDOWN_LABEL = (mins) => `출석 인정까지 ${mins}분 남음`;
```

- [x] **Step 3: `SeminarCard`에서 훅 호출**

Task 2 이후의 import 줄과 함수 첫 줄을 다음으로 바꾼다.

현재:

```jsx
import { STATUS_BADGE, ATTEND_LABEL, ENDED_CHIP } from '../seminar.data';
```

교체:

```jsx
import { STATUS_BADGE, ATTEND_LABEL, ENDED_CHIP, COUNTDOWN_LABEL } from '../seminar.data';
import { useAttendanceCountdown } from '../useAttendanceCountdown';
```

그리고 `export function SeminarCard({ seminar, attended, isLoggedIn, onAttend }) {` 바로 다음 줄에 훅 호출을 넣는다 (조건부 호출 금지 — 최상단에서 무조건 부른다):

```jsx
export function SeminarCard({ seminar, attended, isLoggedIn, onAttend }) {
  const minsLeft = useAttendanceCountdown(seminar.attendanceClosesAt);
  const isAttended = attended || Boolean(seminar.attendedAt);
```

(나머지 `canAttend`/`label`/`endedChip`/`badge` 줄은 Task 2 상태 그대로 유지)

- [x] **Step 4: action 영역을 세로 배치로 바꾸고 문구 렌더**

현재 (`src/features/seminar/views/SeminarCard.jsx:74-81` — Task 2 편집으로 줄 번호가 몇 줄 밀렸을 수 있으니 `{/* action */}` 주석으로 찾는다):

```jsx
      {/* action */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
        {canAttend ? (
          <Button onClick={() => onAttend(seminar)}>출석하기</Button>
        ) : (
          <Button variant="secondary" disabled>{label}</Button>
        )}
      </div>
```

다음으로 교체:

```jsx
      {/* action */}
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        {canAttend ? (
          <Button onClick={() => onAttend(seminar)}>출석하기</Button>
        ) : (
          <Button variant="secondary" disabled>{label}</Button>
        )}
        {/* 이미 출석했으면 남은 시간은 의미가 없다. 0분이면 다음 refetch에서 ENDED로 넘어간다. */}
        {canAttend && minsLeft > 0 && (
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            {COUNTDOWN_LABEL(minsLeft)}
          </p>
        )}
      </div>
```

- [x] **Step 5: 검증**

실행: `npm run lint && npm run typecheck && npm run build`
기대: 셋 다 통과. 특히 lint의 `react-hooks/rules-of-hooks`가 조용해야 한다 — 훅이 컴포넌트 최상단에서 무조건 호출되기 때문이다.

- [x] **Step 6: 커밋**

`src/features/seminar/useAttendanceCountdown.js`, `src/features/seminar/seminar.data.js`, `src/features/seminar/views/SeminarCard.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 4: 상세 모달 (카드 클릭 → `DetailModal`)

**Files:**
- Modify: `src/features/seminar/seminar.data.js` (Task 3의 `COUNTDOWN_LABEL` 뒤에 `DETAIL` 추가)
- Modify: `src/features/seminar/seminar.api.js` (`getRoster` 뒤에 `getAttendeePreview` 추가)
- Modify: `src/features/seminar/seminar.queries.js:10-13, 19-25` (`seminarKeys`에 `attendees`, `useAttendeePreview` 추가)
- Create: `src/features/seminar/views/DetailModal.jsx`
- Modify: `src/features/seminar/views/index.js:8` (export 추가)
- Modify: `src/features/seminar/views/ListView.jsx:21-42` (`isLoggedIn`·`onOpenDetail` 통과)
- Modify: `src/features/seminar/views/SeminarCard.jsx` (카드 클릭, 버튼 전파 차단)
- Modify: `src/features/seminar/SeminarPage.jsx` (state·핸들러·렌더)

**Interfaces:**
- Consumes:
  - `ENDED_CHIP`/`STATUS_BADGE` (Task 2), `SEMINAR_STATUS_LABELS`는 `STATUS_BADGE` 경유로만 쓴다.
  - **BE 플랜 Task 2의 계약** — `GET /api/seminars/{id}/attendees` → `AttendeePreviewResponse`: `{ count: number, list: AttendeePreviewEntry[] }`, `AttendeePreviewEntry`: `{ name: string | null, at: string }`. `at`은 `HH:mm` 표시 문자열. **`sid` 없음**(officer 전용 roster와 구분). 로그인 필요(비로그인 401).
- Produces:
  - `getAttendeePreview(id: string): Promise<AttendeePreviewResponse>`
  - `seminarKeys.attendees(id: string): ['seminar-attendees', string]`
  - `useAttendeePreview(id, options)` — `options.enabled`로 지연 조회.
  - `DetailModal({ seminar, isLoggedIn, onClose })`
  - `SeminarCard`/`ListView`의 새 prop `onOpenDetail(seminar)`.

- [x] **Step 1: `seminar.data.js`에 상세 모달 카피 추가**

Task 3에서 넣은 `COUNTDOWN_LABEL` 줄 바로 뒤에 추가:

```js
// 상세 모달 카피. 참석자 미리보기는 로그인 회원만 조회할 수 있다(서버가 401).
export const DETAIL = {
  descriptionTitle: '세미나 소개',
  myAttendanceTitle: '내 출석 기록',
  myAttendance: (at) => `${at}에 출석하셨습니다.`,
  attendeesTitle: '참석자',
  attendeesCount: (n) => `${n}명이 출석했습니다.`,
  attendeesLoginRequired: '로그인하시면 참석자를 확인하실 수 있습니다.',
  attendeesLoading: '불러오는 중…',
  attendeesError: '참석자를 불러오지 못했습니다.',
  unknownMember: '탈퇴한 회원',
  material: '발표 자료 보기',
  close: '닫기',
};
```

- [x] **Step 2: `seminar.api.js`에 참석자 미리보기 호출 추가**

현재 (`src/features/seminar/seminar.api.js:20-23`):

```js
export async function getRoster(rosterKey) {
  const { data } = await client.get(`/api/seminars/${rosterKey}/roster`);
  return data;
}
```

바로 뒤에 추가:

```js
/**
 * 참석자 미리보기 — 로그인한 회원 누구나 조회한다. officer 전용 roster와 달리
 * 학번(sid)이 없다. 응답: { count, list: [{ name, at }] }.
 */
export async function getAttendeePreview(seminarId) {
  const { data } = await client.get(`/api/seminars/${seminarId}/attendees`);
  return data;
}
```

- [x] **Step 3: `seminar.queries.js`에 키와 훅 추가**

현재 (`src/features/seminar/seminar.queries.js:10-13`):

```js
export const seminarKeys = {
  all: ['seminars'],
  roster: (key) => ['seminar-roster', key],
};
```

교체:

```js
export const seminarKeys = {
  all: ['seminars'],
  roster: (key) => ['seminar-roster', key],
  attendees: (id) => ['seminar-attendees', id],
};
```

그리고 `useRoster` 함수(`seminar.queries.js:19-25`) 바로 뒤에 추가:

```js
/**
 * 참석자 미리보기 — 상세 모달이 열릴 때만 조회한다(`options.enabled`).
 * 비로그인이면 서버가 401이므로 호출부가 enabled=false로 막는다.
 */
export function useAttendeePreview(id, options) {
  return useQuery({
    queryKey: seminarKeys.attendees(id),
    queryFn: () => api.getAttendeePreview(id),
    enabled: !!id,
    ...options,
  });
}
```

- [x] **Step 4: `DetailModal.jsx` 생성**

`src/features/seminar/views/DetailModal.jsx` 신규 파일:

```jsx
import React from 'react';
import { Button, Tag } from '@/design-system';
import { ModalShell } from './ModalShell';
import { TopicChip } from './parts';
import { STATUS_BADGE, ENDED_CHIP, DETAIL, EMPTY } from '../seminar.data';
import { useAttendeePreview } from '../seminar.queries';

const NOTE = {
  margin: 0,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--text-muted)',
  lineHeight: 'var(--lh-normal)',
};

/** 라벨·값 한 줄. 값이 없으면 줄 자체를 렌더하지 않는다. */
function Meta({ label, children }) {
  if (!children) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-soft)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)' }}>
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--text-body)' }}>{children}</span>
    </div>
  );
}

/** 아이라벨이 붙은 섹션 블록. */
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--w-semibold)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/** 참석자 섹션 — 로그인 회원만 조회한다. */
function Attendees({ seminarId, isLoggedIn }) {
  const preview = useAttendeePreview(seminarId, { enabled: isLoggedIn });

  if (!isLoggedIn) return <p style={NOTE}>{DETAIL.attendeesLoginRequired}</p>;
  if (preview.isLoading) return <p style={NOTE}>{DETAIL.attendeesLoading}</p>;
  if (preview.isError) return <p style={NOTE}>{DETAIL.attendeesError}</p>;

  const list = preview.data?.list ?? [];
  if (list.length === 0) return <p style={NOTE}>{EMPTY.attendees}</p>;

  return (
    <>
      <p style={{ ...NOTE, marginBottom: 8 }}>{DETAIL.attendeesCount(preview.data.count)}</p>
      <div>
        {list.map((a, i) => (
          <div
            key={`${a.name ?? ''}-${a.at}-${i}`}
            style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border-soft)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)' }}
          >
            <span style={{ color: 'var(--text-strong)', fontWeight: 'var(--w-medium)' }}>{a.name ?? DETAIL.unknownMember}</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.at}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * 세미나 상세 모달 — 카드를 누르면 열린다.
 *
 * 목록이 이미 갖고 있는 필드를 넓게 보여주고, 거기에 상세 설명·내 출석 기록·
 * 참석자 미리보기를 더한다. 참석자만 모달이 열릴 때 지연 조회하고 나머지는
 * 목록 응답을 그대로 쓴다.
 */
export function DetailModal({ seminar, isLoggedIn, onClose }) {
  const endedChip = !isLoggedIn
    ? STATUS_BADGE.ENDED
    : seminar.attendedAt
      ? ENDED_CHIP.attended
      : ENDED_CHIP.absent;
  const badge = seminar.status === 'ENDED' ? endedChip : STATUS_BADGE[seminar.status];

  return (
    <ModalShell title={seminar.title} onClose={onClose} maxWidth={560} align="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {seminar.topic && <TopicChip>{seminar.topic}</TopicChip>}
        <Tag tone={badge.tone} size="sm">{badge.label}</Tag>
      </div>

      <div style={{ marginTop: 18 }}>
        <Meta label="일시">{`${seminar.month} ${seminar.day}일 (${seminar.weekday}) ${seminar.time}`}</Meta>
        <Meta label="발표">{seminar.speaker}</Meta>
        <Meta label="장소">{seminar.place}</Meta>
        <Meta label="진행 방식">{seminar.mode}</Meta>
      </div>

      {seminar.description && (
        <Section title={DETAIL.descriptionTitle}>
          <p style={{ ...NOTE, color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{seminar.description}</p>
        </Section>
      )}

      {seminar.attendedAt && (
        <Section title={DETAIL.myAttendanceTitle}>
          <p style={NOTE}>{DETAIL.myAttendance(seminar.attendedAt)}</p>
        </Section>
      )}

      <Section title={DETAIL.attendeesTitle}>
        <Attendees seminarId={seminar.id} isLoggedIn={isLoggedIn} />
      </Section>

      <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
        {seminar.materialUrl && (
          <a
            href={seminar.materialUrl}
            target="_blank"
            rel="noreferrer"
            className="jr-mat"
            style={{ marginRight: 'auto', fontSize: 'var(--fs-sm)' }}
          >
            {DETAIL.material} <span aria-hidden="true">→</span>
          </a>
        )}
        <Button variant="ghost" onClick={onClose}>{DETAIL.close}</Button>
      </div>
    </ModalShell>
  );
}
```

`jr-mat` 클래스는 `seminar.css`에 이미 있다(카드가 쓰던 것) — 새로 만들지 않는다.

- [x] **Step 5: `views/index.js`에 export 추가**

현재 (`src/features/seminar/views/index.js:7-8`):

```js
export { AttendModal } from './AttendModal';
export { CreateModal } from './CreateModal';
```

교체:

```js
export { AttendModal } from './AttendModal';
export { CreateModal } from './CreateModal';
export { DetailModal } from './DetailModal';
```

- [x] **Step 6: `SeminarCard`에 카드 클릭과 버튼 전파 차단**

`export function SeminarCard(...)` 시그니처에 `onOpenDetail`을 더한다:

```jsx
export function SeminarCard({ seminar, attended, isLoggedIn, onAttend, onOpenDetail }) {
```

카드 루트 `div`(`SeminarCard.jsx:16-30`의 `<div style={{ display: 'flex', gap: 24, ... }}>`)에 `onClick`과 `cursor`를 더한다. 현재:

```jsx
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
```

교체:

```jsx
    <div
      onClick={() => onOpenDetail(seminar)}
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
        cursor: 'pointer',
      }}
    >
```

그리고 출석 버튼(Task 3 편집 후의 `{canAttend ? (` 블록)이 카드 클릭까지 열지 않도록 전파를 막는다. 현재:

```jsx
          <Button onClick={() => onAttend(seminar)}>출석하기</Button>
```

교체:

```jsx
          <Button onClick={(e) => { e.stopPropagation(); onAttend(seminar); }}>출석하기</Button>
```

- [x] **Step 7: `ListView`가 두 prop을 통과**

현재 (`src/features/seminar/views/ListView.jsx:20-22, 35-37` — Task 1에서 `FILTERS`만 바뀐 상태):

```jsx
/** List view — filter chips + the seminar schedule. */
export function ListView({ seminars, filter, onFilter, attended, onAttend }) {
```

교체:

```jsx
/** List view — filter chips + the seminar schedule. */
export function ListView({ seminars, filter, onFilter, attended, isLoggedIn, onAttend, onOpenDetail }) {
```

그리고 카드 렌더 줄. 현재:

```jsx
            <SeminarCard key={s.id} seminar={s} attended={!!attended[s.id]} onAttend={onAttend} />
```

교체:

```jsx
            <SeminarCard
              key={s.id}
              seminar={s}
              attended={!!attended[s.id]}
              isLoggedIn={isLoggedIn}
              onAttend={onAttend}
              onOpenDetail={onOpenDetail}
            />
```

- [x] **Step 8: `SeminarPage`에 모달 state와 렌더 배선**

import에 `DetailModal`을 더한다. 현재 (`src/features/seminar/SeminarPage.jsx:8-17`):

```jsx
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  ListView,
  RosterView,
  AttendModal,
  CreateModal,
} from './views';
```

교체:

```jsx
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  ListView,
  RosterView,
  AttendModal,
  CreateModal,
  DetailModal,
} from './views';
```

로그인 여부를 스토어에서 읽는다. 현재 (`SeminarPage.jsx:45`):

```jsx
  const isAdmin = useAuthStore((s) => ['OFFICER', 'ADMIN'].includes(s.user?.authority));
```

바로 뒤에 추가:

```jsx
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
```

상세 모달 state를 추가한다. 현재 (`SeminarPage.jsx:53-55`):

```jsx
  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');
```

바로 뒤에 추가:

```jsx
  const [detailSeminar, setDetailSeminar] = useState(null);
```

`<ListView>` 렌더에 두 prop을 넘긴다. 현재 (`SeminarPage.jsx:162-168`):

```jsx
            <ListView
              seminars={seminars}
              filter={filter}
              onFilter={setFilter}
              attended={attended}
              onAttend={openAttend}
            />
```

교체:

```jsx
            <ListView
              seminars={seminars}
              filter={filter}
              onFilter={setFilter}
              attended={attended}
              isLoggedIn={isLoggedIn}
              onAttend={openAttend}
              onOpenDetail={setDetailSeminar}
            />
```

모달을 렌더한다. 현재 (`SeminarPage.jsx:192`):

```jsx
      {createOpen && <CreateModal form={createForm} onClose={() => setCreateOpen(false)} onSubmit={submitCreate} pending={createM.isPending} />}
```

바로 뒤에 추가:

```jsx
      {detailSeminar && (
        <DetailModal
          seminar={detailSeminar}
          isLoggedIn={isLoggedIn}
          onClose={() => setDetailSeminar(null)}
        />
      )}
```

- [x] **Step 9: 검증**

실행: `npm run lint && npm run typecheck && npm run build`
기대: 셋 다 통과, build는 청크 경고만.

- [x] **Step 10: 커밋**

`src/features/seminar/seminar.data.js`, `src/features/seminar/seminar.api.js`, `src/features/seminar/seminar.queries.js`, `src/features/seminar/views/DetailModal.jsx`, `src/features/seminar/views/index.js`, `src/features/seminar/views/ListView.jsx`, `src/features/seminar/views/SeminarCard.jsx`, `src/features/seminar/SeminarPage.jsx`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 5: 개설 모달에 상세 설명 필드

**Files:**
- Modify: `src/features/seminar/SeminarPage.jsx:58` (폼 기본값)
- Modify: `src/features/seminar/views/CreateModal.jsx:38` (textarea)
- Modify: `src/features/seminar/seminar.api.js:44-54` (payload)

**Interfaces:**
- Consumes: 계약의 `SeminarCreateRequest.description` (`docs/api/openapi.yaml:905`) — `[string, 'null']`, 옵션 필드.
- Produces: 없음.

- [x] **Step 1: 폼 기본값에 `description` 추가**

현재 (`src/features/seminar/SeminarPage.jsx:58`):

```jsx
  const createForm = useForm({ title: '', speaker: '', topic: '', startsAt: '', place: '', mode: '', attendanceCode: '', materialUrl: '', target: [] });
```

교체:

```jsx
  const createForm = useForm({ title: '', speaker: '', topic: '', startsAt: '', place: '', mode: '', attendanceCode: '', materialUrl: '', description: '', target: [] });
```

- [x] **Step 2: `CreateModal`에 textarea 추가**

현재 (`src/features/seminar/views/CreateModal.jsx:38`):

```jsx
        <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={field('mode')} />
```

바로 뒤에 추가 (`as="textarea"`가 `resize: vertical`과 `minHeight: 96px`을 자동으로 준다 — 인라인 높이 지정 금지):

```jsx
        <Input
          as="textarea"
          label="상세 설명"
          placeholder="세미나에서 다룰 내용을 자유롭게 적어 주세요."
          value={values.description}
          onChange={field('description')}
        />
```

- [x] **Step 3: `createSeminar` payload에 `description` 추가**

현재 (`src/features/seminar/seminar.api.js:44-54`):

```js
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
```

교체 (`opt()`가 빈 문자열을 `null`로 바꾼다 — 계약이 nullable):

```js
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
    description: opt(form.description),
    target: form.target || [],
  };
```

- [x] **Step 4: 검증**

실행: `npm run lint && npm run typecheck && npm run build`
기대: 셋 다 통과.

- [x] **Step 5: 커밋**

`src/features/seminar/SeminarPage.jsx`, `src/features/seminar/views/CreateModal.jsx`, `src/features/seminar/seminar.api.js`를 스테이징하고 committer 서브에이전트 디스패치.

---

### Task 6: 최종 검증 (수동 시나리오)

이 레포엔 테스트 러너가 없다(Tech Stack 참조). 스펙 §테스트 계획의 FE 4개 항목을 아래 수동 체크리스트로 옮겨 실행한다 — 요구사항은 그대로 검증하되, 도구만 다르다.

**Files:** 없음 (검증 전용 태스크).

**Interfaces:** 없음.

- [x] **Step 1: 정적 게이트**

실행: `npm run lint && npm run typecheck && npm run build`
기대: 셋 다 통과. build의 `Some chunks are larger than 500 kB` 경고 **하나만** 허용(baseline과 동일). 다른 출력이 있으면 회귀다.

- [x] **Step 2: 백엔드 준비 상태 확인**

실행: `cd ../home-jaram-be && git log --oneline -5 && cd -`
기대: BE 플랜 Task 1(`attendedAt`/`attendanceClosesAt`/`description`)과 Task 2(`/api/seminars/{id}/attendees`) 커밋이 보인다.

BE가 아직 안 왔으면 — 그래도 Step 3의 비로그인·예정·종료 시나리오는 진행한다. `attendedAt`/`description`은 nullable이라 화면이 깨지지 않고 해당 섹션만 렌더되지 않으며, `attendanceClosesAt`이 없으면 훅이 `0`을 돌려 카운트다운 문구만 숨는다. **참석자 섹션과 카운트다운 문구, 출석/결석 칩은 BE 도착 후에 다시 확인한다.**

- [ ] **Step 3: dev 서버 수동 시나리오**

실행: `npm run dev` → `http://localhost:5173` 세미나 페이지

**비로그인 상태로:**
- [ ] 필터 칩 순서가 `예정` `종료` `전체` (스펙 테스트: 탭 DOM 순서)
- [ ] 종료된 세미나 카드의 칩이 `종료` — `출석`/`결석`이 아니다
- [ ] 카드를 누르면 상세 모달이 열린다 (스펙 테스트: 카드 클릭 → 모달 오픈)
- [ ] 모달의 참석자 섹션이 "로그인하시면 참석자를 확인하실 수 있습니다."만 보여준다. **DevTools Network 탭에 `/attendees` 요청이 아예 없어야 한다**(`enabled: false`)

**로그인 상태로 (출석한 적 있는 계정):**
- [ ] 종료된 세미나 중 출석한 것의 칩이 `출석`(버밀리언 seal), 결석한 것은 `결석`(neutral) (스펙 테스트: 칩 3분기)
- [ ] 진행 중 세미나 카드에서 출석 버튼 아래 "출석 인정까지 N분 남음"이 보인다
- [ ] **출석 버튼을 누르면 출석 모달만 열리고 상세 모달은 안 열린다** (스펙 테스트: 전파 차단)
- [ ] 출석 코드를 넣어 출석하면 버튼이 "출석 완료"로 바뀌고, 카운트다운 문구가 사라지고, **새로고침해도 상태가 유지된다**(로컬 state가 아니라 서버 `attendedAt`이 진실원)
- [ ] 카드 클릭 → 모달에서 상세 설명 · 내 출석 기록("HH:mm에 출석하셨습니다.") · 참석자 목록이 보이고, **참석자 목록에 학번이 없다**
- [ ] 임원 계정으로 세미나 개설 모달에 "상세 설명" textarea가 있고, 채워서 등록하면 상세 모달에 그 내용이 보인다. **비워서 등록해도 오류 없이 등록되고 모달에 소개 섹션이 아예 안 나온다**

- [ ] **Step 4: 카운트다운 타이머 누수 확인** (스펙 테스트: `clearInterval`)

React DevTools Profiler 없이 확인하는 방법: dev 서버에서 진행 중 세미나가 보이는 상태로 두고, 상단 서브 내비를 `출석 현황` ↔ `세미나 목록`으로 10회 왕복한다. 그다음 콘솔에서:

```js
// 목록을 떠난 상태에서 1분 넘게 두고 콘솔 에러가 없는지 본다.
// setInterval이 정리되지 않았다면 언마운트된 컴포넌트의 setState 경고가 뜬다.
```

기대: 콘솔에 경고·에러 없음. (`useAttendanceCountdown`의 `useEffect`가 `clearInterval`을 반환하므로 정리된다.)

- [ ] **Step 5: 최종 커밋**

코드 변경이 없으면 커밋하지 않는다. Step 3에서 고칠 게 나왔다면 수정 후 committer 서브에이전트로 커밋한다.

---

## Self-Review

**1. 스펙 커버리지** (스펙 §요구사항 4개 + §설계 Frontend 항목):

| 스펙 항목 | 태스크 |
|---|---|
| 요구사항 1 — 탭 순서 예정→종료→전체 | Task 1 |
| 요구사항 2 — 카드 클릭 → 모달 (리스트 정보 확대 · 상세 설명 · 내 출석 기록 · 참석자 미리보기) | Task 4 |
| 요구사항 3 — ONGOING 카운트다운 (서버 절대 시각 + 클라이언트 틱) | Task 3 |
| 요구사항 4 — ENDED 칩 3분기 (출석/결석/종료) | Task 2 |
| §설계 — `ListView.jsx` FILTERS 재배열 | Task 1 |
| §설계 — `SeminarCard.jsx` onClick · stopPropagation · 칩 분기 · 카운트다운 | Task 2·3·4 |
| §설계 — `useAttendanceCountdown.js` 신규 | Task 3 |
| §설계 — `DetailModal.jsx` 신규 (지연 조회 · 비로그인 안내) | Task 4 |
| §설계 — `seminar.api.js` `getAttendeePreview` | Task 4 |
| §설계 — `seminar.queries.js` `useAttendeePreview` | Task 4 |
| §설계 — `SeminarPage.jsx` `detailSeminar` state · 핸들러 · 렌더 | Task 4 |
| §설계 — `CreateModal.jsx`/`useForm.js` description | Task 5 |
| §엣지 — 비로그인 + ENDED → '종료' 폴백 | Task 2 Step 3, Task 6 Step 3 |
| §엣지 — ONGOING인데 이미 출석 → 카운트다운 숨김 | Task 3 Step 4 (`canAttend && minsLeft > 0`) |
| §엣지 — 설명 미입력 → 섹션 자체를 렌더 안 함 | Task 4 Step 4 (`{seminar.description && ...}`) |
| §테스트 계획 FE 4개 | Task 6 Step 3·4 (수동 체크리스트로 변환 — 사용자 결정) |

**`useForm.js`는 수정하지 않는다.** 스펙 §설계가 "`views/CreateModal.jsx` / `useForm.js`: description textarea 필드 추가"라고 묶어 적었지만, `useForm`은 초기값 객체를 그대로 받는 제네릭 헬퍼다(`useForm.js:13`, `useState(initial)`). 새 필드는 `SeminarPage.jsx:58`의 초기값에만 넣으면 되고 훅 자체는 바뀔 게 없다 — Task 5 Step 1이 그 자리다.

**2. 플레이스홀더 스캔:** TBD/TODO 없음. 모든 코드 스텝에 실제 코드가 들어 있다. Task 6은 코드가 아니라 검증 태스크이므로 체크리스트가 본문이다.

**3. 타입 일관성:**
- `attendedAt`은 ISO가 아니라 `HH:mm` 표시 문자열 — Task 2(`Boolean(seminar.attendedAt)`)와 Task 4(`DETAIL.myAttendance(seminar.attendedAt)`) 둘 다 파싱하지 않고 truthiness/렌더로만 쓴다. 일관됨.
- `attendanceClosesAt`은 ISO date-time — Task 3의 훅만 `new Date()`로 파싱한다. 일관됨.
- `ENDED_CHIP`은 Task 2에서 정의하고 Task 2(`SeminarCard`)·Task 4(`DetailModal`)가 같은 이름으로 쓴다. `{ label, tone }` 모양이 `STATUS_BADGE` 엔트리와 같아서 `badge.tone`/`badge.label` 렌더 코드를 공유한다.
- `seminarKeys.attendees(id)` → `['seminar-attendees', id]`는 스펙의 `queryKey: ['seminar-attendees', id]`와 일치.
- `isLoggedIn`은 `SeminarPage` → `ListView` → `SeminarCard`와 `SeminarPage` → `DetailModal` 두 경로로 흐른다. 이름 동일.

## 이 플랜이 다루지 않는 것

- `docs/api/openapi.yaml` 편집 — BE 플랜 Task 1·2 소유 (Global Constraints 참조).
- 테스트 인프라(vitest/RTL) 도입 — 별도 플랜감. 사용자가 이번엔 기존 선례(lint/typecheck/build/manual) 유지로 결정.
- `SeminarCard`의 `seminar.material` → `materialUrl` 드리프트 수정 (범위 밖).
- 카드 클릭의 키보드 접근성 (범위 밖).
