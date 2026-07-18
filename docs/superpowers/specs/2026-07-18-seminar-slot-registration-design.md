# 세미나 일정 자기등록 · 승인 플로우 설계 (Phase 2)

작성일: 2026-07-18

> 이 스펙은 `docs/superpowers/specs/2026-07-18-seminar-schedule-tab-design.md`("일정"/"목록" 탭
> 스펙, 이하 Phase 1 스펙)의 §범위 "Phase 2(별도 스펙 — BE 조율 필요)" 항목을 실현한다.
> Phase 1 스펙 본문은 그대로 두고, 이 문서가 그 문서의 "슬롯 3개는 UI로만 그려주고 실제
> 다중 발표자 데이터는 다루지 않는다"는 전제를 **대체(supersede)** 한다 — `ScheduleCard`의
> 슬롯 렌더가 이제 정적 placeholder가 아니라 실제 `Schedule.slots` 데이터를 그린다.

## 목표

임원진이 만든 "일정"에 학회원이 선착순으로 자기 자리를 등록하고, 시간이 지나면 임원이
그 일정을 잠가 명단을 확정한 뒤, 각자 자기 세미나 내용을 채워 제출 → 임원 승인을 거쳐
정식 세미나로 공개되는 전체 라이프사이클을 만든다.

**사용자가 정한 순서 (원문 그대로):**
임원진이 일정 카드를 생성 → 학회원들이 선착순으로 일정에 자신의 프로필 등록 → (일정
시간이 지난 후 임원진이 관리자 탭에서 토글로 일정 고정 후 수정 안 되게 함) → 학회원이
자신의 일정에 맞는 세미나 생성 → pending → 임원진의 승인.

## 범위

- **이번 스코프:** `Schedule`(일정) 신규 리소스 + 슬롯 자기등록/잠금, `Seminar`에
  `scheduleId`/`approvalStatus`/`rejectReason` 추가, 승인/반려 플로우, 관련 FE 화면
  (일정 탭 `ScheduleCard` 실데이터화, admin "일정 관리" 신규 화면, admin "세미나 승인"
  신규 화면), `openapi.yaml` 계약 변경.
- **범위 밖:** Schedule 재오픈(LOCKED→OPEN) 시나리오, 슬롯 정원 사후 변경, 미제출 슬롯의
  자동 마감/알림, 승인 대기 세미나의 공개 미리보기. 임원 직접 세미나 생성 경로
  (`/admin/seminars` TableView 행추가)는 이 스펙과 무관하게 이미 존재 — 그대로 유지.

## 데이터 모델

```
Schedule {
  id
  date, place, mode
  capacity: int = 3          // 임원이 생성 시 기본 3, 필요하면 다른 값 지정
  status: OPEN | LOCKED      // 임원 수동 토글로만 LOCKED. 역방향(재오픈) 없음.
  slots: Slot[]              // capacity 개, 생성 직후엔 전부 빈 슬롯
}

Slot {
  index
  member: MemberSummary | null   // 선착순 자기등록. 비었으면 null.
  seminarId: string | null       // LOCKED 이후 본인이 세미나를 만들면 채워짐
}
```

`Seminar`에 추가:

```
scheduleId: string | null        // 슬롯 경로로 만들어졌으면 채워짐. 임원 직접생성은 null.
approvalStatus: PENDING | APPROVED | REJECTED   // 기존 ApprovalStatus enum 재사용
rejectReason: string | null      // REJECTED일 때만
```

## 상태 머신

- `Schedule.status`: `OPEN` → (임원 토글) → `LOCKED`. 역방향 없음.
- `Slot`: 빈 슬롯 → (학회원 자기등록, `Schedule.status===OPEN`일 때만) → 채워짐.
  `LOCKED` 이후엔 자기등록·자진취소 모두 막힘 — 임원의 강제해제만 예외로 가능(단, 그
  슬롯에 `seminarId`가 있으면 먼저 세미나를 반려해야 함, 아래 검증 참고).
- **세미나 생성은 반드시 `Schedule.status===LOCKED` 이후, 그 슬롯의 소유자만** 가능하다.
  순서상 자연히 "잠금 전엔 세미나가 아예 없으므로" 슬롯 자진취소가 제출된 세미나를
  덮어쓰는 경우가 생기지 않는다(자진취소는 OPEN 상태에서만 허용되고, 그때는 세미나가
  존재할 수 없다).
- `Seminar.approvalStatus`: 세미나 생성 시 `PENDING`으로 시작 → 임원이 `APPROVED` 또는
  `REJECTED`. `REJECTED`면 본인이 내용을 고쳐 같은 세미나 row를 재제출 → 다시 `PENDING`
  (새 row 아님, `rejectReason`은 재제출 시 null로 초기화).
- **공개 노출**: 일반 회원 대상 세미나 목록/일정 탭에는 `APPROVED`(+ 기존
  `UPCOMING/ONGOING/ENDED` 파생 상태) 세미나만 보인다. `PENDING`/`REJECTED`는 본인과
  임원만 볼 수 있다.

## 사용자 흐름

**학회원 (일정 탭, `ScheduleCard` 확장)**

1. 빈 슬롯 + 로그인 + `Schedule.status===OPEN` → "등록하기" 버튼 → 확인 모달(본인
   프로필 자동, 확인만) → 슬롯에 내 이름.
2. 내가 맡은 슬롯, `LOCKED`, 세미나 미제출 → "세미나 만들기" 버튼 → 기존 `CreateModal`류
   폼 재사용하되 `scheduleId`/`slotIndex`는 URL로 전달하고 `startsAt`/`place`/`mode`는
   Schedule 값으로 고정(입력칸 없음) — 제목·주제·설명·발표자료·출석코드·대상만 입력.
3. 내가 맡은 슬롯, 세미나 제출함 → 상태 칩(`대기중`/`반려됨`, `승인됨`은 이미 정식
   목록에 뜨니 슬롯엔 안 보임). `반려됨`이면 "수정하기"로 같은 폼을 값 채워 재오픈.
4. 남이 맡은 슬롯 → 이름만, 액션 없음. `LOCKED`인 빈 슬롯 → "잠김" 표시만, 등록 불가.
5. `OPEN` 상태에서 내가 맡은 슬롯은 "포기하기"로 자진취소 가능(이 시점엔 세미나가
   존재할 수 없으므로 단순히 슬롯만 비움).

**임원 (admin 신규 화면 2개)**

1. **`/admin/schedules` "일정 관리"** — 카드형 커스텀 뷰(슬롯별 개별 액션이 필요해
   균일 컬럼 `TableView`엔 안 맞음). 카드마다 날짜·장소·정원, 슬롯별 줄(맡은 회원 이름
   또는 "비어있음" + 찬 슬롯엔 "해제" 버튼 — `seminarId` 있으면 버튼 비활성 + 안내),
   잠금 토글(OPEN⇄LOCKED). 상단 "일정 만들기" 버튼(날짜·장소·모드·정원 입력).
2. **`/admin/seminar-approvals` "세미나 승인"** — 기존 `applications` 리소스와 같은
   패턴(`TableView` + `SCHEMAS`, `actions:['approve','reject']`). `approvalStatus===PENDING`
   세미나만 조회. 승인 시 정식 목록 노출 시작, 반려 시 학회원 쪽에 "반려됨" + 사유.

기존 `/admin/seminars`(세미나 관리 테이블)는 그대로 — 임원 직접생성 세미나(`scheduleId`
null)와 이미 승인된 슬롯 세미나가 함께 보인다(둘 다 결국 `Seminar` row).

## API 계약 (openapi.yaml)

**신규 — 회원용 (`src/features/seminar/schedule.api.js`)**

```
GET   /api/schedules                              → Schedule[] (slots 포함)
POST  /api/schedules/{id}/slots/{index}/claim      → 본인 프로필로 슬롯 등록
                                                       409: 이미 참·잠김
DELETE /api/schedules/{id}/slots/{index}           → 본인 슬롯 자진취소 (OPEN만 허용)
POST  /api/schedules/{id}/slots/{index}/seminar    → SeminarCreateRequest 재사용
                                                       → Seminar(PENDING)
                                                       412: Schedule이 아직 OPEN이거나
                                                       본인 슬롯 아님
PATCH /api/seminars/{id}                           → 본인 소유 + REJECTED 상태에서만
                                                       재제출 허용(→PENDING)
```

**신규 — 임원용 (`admin.api.js`)**

```
POST   /api/admin/schedules                        → Schedule 생성 {date, place, mode, capacity=3}
PATCH  /api/admin/schedules/{id}/lock               → status LOCKED
DELETE /api/admin/schedules/{id}/slots/{index}      → 강제 해제 (seminarId 있으면 409 —
                                                        먼저 반려부터)
GET    /api/admin/seminars?approvalStatus=PENDING   → 승인 대기 목록(기존 seminars 리소스
                                                        재사용, applications가 members를
                                                        필터링해 쓰는 것과 같은 패턴)
POST   /api/admin/seminars/{id}/approve
POST   /api/admin/seminars/{id}/reject              → { reason }
```

**스키마 추가**: `Schedule`, `ScheduleSlot`, `ScheduleCreateRequest`, `ScheduleStatus`(OPEN/LOCKED)
신규. `Seminar`에 `scheduleId`(nullable), `approvalStatus`(기존 `ApprovalStatus` enum
재사용), `rejectReason` 추가.

## 엣지케이스

- **동시 등록 경쟁**: 슬롯 클레임은 서버가 원자적으로 처리, 정원 초과 시 409 →
  FE는 "방금 다른 분이 등록해서 자리가 찼습니다" 토스트 + 목록 리페치.
- **중복 등록 제한 없음**: 한 회원이 여러 슬롯(같은/다른 일정) 동시 보유 가능.
- **자진취소는 OPEN에서만, 세미나는 항상 LOCKED 이후에만 생성**되므로 "세미나 있는
  슬롯을 취소"하는 경우 자체가 발생하지 않는다(상태 머신 절 참고).
- **미제출 방치**: 잠금 후 슬롯 주인이 세미나를 끝내 안 만들어도 시스템이 개입하지
  않는다. 임원이 admin "일정 관리"에서 수동으로 강제해제할 수 있을 뿐.
- **PENDING/REJECTED 비공개**: 목록/일정 탭 어디에도 안 뜬다. 슬롯 카드에서 본인에게만
  칩으로 보인다.

## 테스트 계획

이 레포엔 테스트 러너가 없다(선례 확인됨). `npm run lint && npm run typecheck && npm run build`
통과 + `npm run dev` 수동 시나리오(임원 계정으로 일정 생성 → 슬롯 등록 → 잠금 →
세미나 제출 → 반려 → 재제출 → 승인 → 공개 목록에 노출 확인, 동시등록 409 케이스는
두 탭으로 재현)로 검증한다. 세부 체크리스트는 구현 플랜 단계에서 태스크별로 작성한다.

## 이 스펙이 다루지 않는 것

- Schedule 재오픈, 슬롯 정원 사후 변경, 미제출 자동 마감/알림.
- `docs/api/openapi.yaml`을 실제로 편집하는 작업 자체 — 이 스펙은 계약 *설계*이고,
  편집은 구현 플랜의 태스크로 진행한다.
- BE 구현 — 이 스펙을 참조하는 별도 BE 플랜(`home-jaram-be` 레포, 기존 seminar-tab-redesign
  선례와 동일한 cross-repo 구조)이 담당한다.
