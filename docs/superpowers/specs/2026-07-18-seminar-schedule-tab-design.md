# 세미나 페이지 — '일정'/'목록' 탭 설계

작성일: 2026-07-18

## 목표

세미나 페이지(`src/features/seminar`) 최상단에 '일정' / '목록' 두 탭을 만든다.
'목록' 탭은 현재 화면(필터 칩 예정/종료/결석/전체 + `ListView`)을 그대로
옮긴 것이고, '일정' 탭은 날짜순 대시보드 — 세미나를 카드로 쭉 나열하고 카드
안에 발표자 슬롯을 3개까지 보여준다.

## 범위

- **이번 스코프(Phase 1):** 탭 UI 구조 + '일정' 대시보드 뷰. 백엔드 계약
  변경 없음 — 기존 `seminar.speaker`(단일 문자열) 그대로 쓴다.
- **범위 밖(Phase 2, 별도 스펙 — BE 조율 필요):** `speaker` → `speakers[]`
  (최대 3명) 계약 확장, 학회원 자기등록 플로우, admin 탭의 등록 허용
  토글, 슬롯별 카드 추가/삭제 admin 관리. 이번 Phase 1의 '슬롯 3개'는
  UI상으로만 최대 3자리를 그려주고(1번 슬롯만 `speaker`로 채워지고 2·3번은
  '미정'), 실제 다중 발표자 데이터는 다루지 않는다.

## 사용자 경험

1. 세미나 페이지 진입 시 기본 탭은 **'목록'**(현재 동작 그대로 유지 — 최초
   필터는 `upcoming`).
2. 상단에 '일정' / '목록' 탭(기존 `TabButton` 컴포넌트, 세미나 목록/출석
   현황 서브내비에 쓰이던 것과 같은 밑줄 탭 스타일)이 있다.
3. '일정' 탭 선택 시:
   - 필터 칩 없이 **모든 상태**(예정/진행중/종료 포함)의 세미나를 `startsAt`
     오름차순으로 카드 목록으로 보여준다.
   - 각 카드: 날짜 블록(`day`/`month`/`weekday`/`time`, `SeminarCard`의
     날짜 블록과 같은 스타일) + 제목 + 상태 태그 + 발표자 슬롯 3개.
     슬롯 1은 `seminar.speaker`(없으면 '미정'), 슬롯 2·3은 항상 '미정'.
   - 카드를 누르면 '목록' 탭과 동일한 `DetailModal`이 열린다(같은
     `onOpenDetail` 배선을 재사용).
   - 세미나가 하나도 없으면 기존 `EmptyState` 재사용.
4. '목록' 탭 선택 시: 지금 화면과 완전히 동일(코드도 그대로, `ListView`
   내부는 손대지 않는다).

## 아키텍처

기존 `src/features/seminar` 구조(Page → views → queries.js → api.js)를
유지한다. 새 파일은 `views/ScheduleView.jsx`와 `views/ScheduleCard.jsx` 둘
뿐이고, 나머지는 최소 배선 변경이다. API/쿼리 계층은 변경 없음 —
`useSeminars()`가 이미 갖고 온 데이터를 클라이언트에서 정렬만 다르게 할
뿐이다.

## 컴포넌트

### `SeminarPage.jsx` (수정)

- `const [view, setView] = useState('list')` 추가 — `'list' | 'schedule'`.
- 페이지 타이틀 섹션 아래, `ListView`/`ScheduleView` 렌더 위에 탭 내비 추가
  (과거 `SUB_NAV` 패턴과 동일하게 `TabButton` 두 개):
  ```jsx
  const TABS = [
    { key: 'list', label: '목록' },
    { key: 'schedule', label: '일정' },
  ];
  ```
- 렌더 분기: `view === 'list'`이면 지금 있는 로딩/에러/`ListView` 블록
  그대로, `view === 'schedule'`이면 `ScheduleView`에 `seminars`,
  `onOpenDetail={setDetailSeminar}` 전달. 로딩/에러 처리는 두 탭이 공유
  (`seminarsQ.isLoading`/`isError`는 탭과 무관하게 한 번만 fetch됨).

### `views/ScheduleView.jsx` (신규)

```jsx
import React from 'react';
import { ScheduleCard } from './ScheduleCard';
import { EmptyState } from './parts';
import { EMPTY } from '../seminar.data';

/** 일정 대시보드 — 필터 없이 전체 세미나를 startsAt 오름차순 카드로. */
export function ScheduleView({ seminars, onOpenDetail }) {
  const sorted = [...seminars].sort(
    (a, b) => new Date(a.startsAt) - new Date(b.startsAt)
  );
  return (
    <div className="jr-anim">
      {sorted.length > 0 ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {sorted.map((s) => (
            <ScheduleCard key={s.id} seminar={s} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.seminars}</EmptyState>
      )}
    </div>
  );
}
```

### `views/ScheduleCard.jsx` (신규)

- `SeminarCard`의 날짜 블록 스타일을 그대로 재사용(같은 인라인 스타일
  값), 출석 버튼/카운트다운 영역은 없음 — 이 카드는 순수 조회용.
- 본문: 상태 태그(`STATUS_BADGE[seminar.status]` — `ENDED` 개인화 칩은
  '일정' 탭에서는 안 쓴다. 로그인 여부와 무관하게 항상 '종료' 배지) +
  제목 + 발표자 슬롯 3개.
- 슬롯 렌더: 가로로 3칸, 1번 칸은 `seminar.speaker ?? SLOT_EMPTY`, 2·3번
  칸은 항상 `SLOT_EMPTY`. 채워진 슬롯과 빈 슬롯은 텍스트 색으로만
  구분(`--text-body` vs `--text-faint`) — 새 토큰 발명 없음.
- 클릭: 카드 루트 `div`에 `onClick={() => onOpenDetail(seminar)}` (버튼이
  없으므로 `SeminarCard`처럼 `stopPropagation` 처리할 대상 없음).

### `views/index.js` (수정)

`ScheduleView`만 export 추가. `ScheduleCard`는 `ScheduleView` 안에서만
쓰이고 다른 곳에서 import될 일이 없으므로 배럴에는 안 뺀다(`SeminarCard`가
배럴에 있는 건 `ListView` 밖에서도 쓰일 수 있던 과거 관행의 잔재이지,
새 컴포넌트에 그대로 따를 이유는 아니다).

### `seminar.data.js` (수정)

```js
// 일정 탭 발표자 슬롯 중 채워지지 않은 자리. Phase 2(다중 발표자)에서
// 실제 신청 상태로 바뀌기 전까지의 placeholder.
export const SLOT_EMPTY = '미정';
```

## 데이터 흐름

- `SeminarPage`가 이미 갖고 있는 `seminars = seminarsQ.data ?? []`를
  그대로 `ScheduleView`에 전달. 새 쿼리 없음.
- 정렬은 `ScheduleView` 내부에서 렌더 시점에 계산(메모이제이션 불필요 —
  세미나 개수가 적고 별도 벤치마크 신호 없음. `ListView`의 필터도 매
  렌더 계산이라 기존 패턴과 일치).

## 에러 처리

- 로딩/에러 상태는 탭 전환과 무관하게 `SeminarPage`가 이미 처리하는
  `seminarsQ.isLoading`/`isError` 블록을 그대로 공유한다 — '일정' 탭
  전용 에러 처리 안 만든다.
- 빈 배열은 `EmptyState` 재사용(신규 문구 없음, 기존 `EMPTY.seminars`).

## 테스트 계획

이 레포엔 테스트 러너가 없다(vitest/jest 의존성 0, 선례 확인됨). 검증은:

1. `npm run lint && npm run typecheck && npm run build` — 셋 다 통과,
   build는 기존 청크 경고만 허용.
2. `npm run dev` 수동 확인:
   - 진입 시 기본 탭이 '목록'이고 현재 화면과 동일하게 보인다.
   - '일정' 탭 클릭 → 카드가 날짜 오름차순으로 보이고, 상태 무관하게
     전부(종료 포함) 보인다.
   - 카드마다 발표자 슬롯 3칸이 보이고 1번만 채워져 있다(2·3번은 '미정').
   - 카드 클릭 → 상세 모달이 '목록' 탭 카드 클릭과 동일하게 열린다.
   - 세미나가 0개인 상태(또는 임시로 필터링해서) → 빈 상태 문구가
     보인다.
   - 탭 전환을 반복해도 로딩 재요청 없음(react-query 캐시 재사용 —
     Network 탭에서 `/api/seminars` 추가 호출 없는지 확인).

## 이 스펙이 다루지 않는 것

- 다중 발표자(`speakers[]`) 계약, 자기등록, admin 토글/카드 관리 —
  Phase 2, 별도 스펙(BE 조율 필요, 이번 홈-jaram-be 협업 패턴과 동일하게
  cross-repo spec+plan 쌍으로 진행 예정).
- `docs/api/openapi.yaml` 편집 — 이번 스코프는 계약 변경이 전혀 없다.
- 월별 그룹핑 등 다른 일정 레이아웃 — 사용자 결정: 날짜순 단일 리스트로
  확정.
