# 세미나 스키마 통일 (admin ↔ seminar) 설계

작성일: 2026-07-04

## 배경

`src/features/admin`(세미나 관리 탭)과 `src/features/seminar`(회원용 세미나
페이지)는 같은 백엔드 `Seminar` 리소스를 다루지만, 필드 구성·이름·상태 라벨이
서로 다르게 짜여 있었다(admin은 백엔드 계약 확정 전 mock 시절에 임의로 만든
스키마를 그대로 씀). 백엔드 `docs/api/openapi.yaml`이 정리된 지금, 두 화면이
같은 값을 같은 모양으로 주고받도록 통일한다.

## 현재 상태 (문제)

| 항목 | seminar (openapi 기준 canonical) | admin (기존) |
|---|---|---|
| 필드 구성 | `title, speaker, topic, startsAt, place, mode, materialUrl` | `title, target, speaker, date, code, status` |
| 일시 | `startsAt` (ISO-8601 datetime) | `date` (조합 문자열, 예: "2026-03-07 19:00") |
| 출석코드 | `attendanceCode` (생성 요청 전용, 응답엔 미노출) | `code` (테이블 컬럼으로 노출·수정 시도) |
| 대상 | 없음 | `target` (자유 문자열: "전체"/"41기"/"수습"/"재학생" 등 비정형 mock 값) |
| status 라벨 | 예정 / **진행 중** / **종료** | 예정 / **진행** / **완료** |
| capacity | 미구현 | 미구현 (openapi엔 있었으나 이번에 제거) |
| 쓰기 경로 | `POST /api/seminars` (`createSeminar`) | `PATCH /api/admin/seminars:batch` (`saveBatch`) |

`target`/`date`/`code` 컬럼은 openapi `Seminar`/`SeminarCreateRequest` 스키마에
없는 유령 필드였고, `attendanceCode`는 애초에 목록 응답에 노출되지 않아 admin
표에 넣어도 항상 빈칸으로만 보이는 문제가 있었다.

## 결정 사항 (사용자 확정)

1. **status 라벨**: seminar 쪽 채택 — 예정 / 진행 중 / 종료.
2. **target(대상) 필드**: 삭제하지 않고 유지. openapi 계약에 정식으로 추가한다.
3. **target 타입**: 회원 등급 기반 enum. 기존 `admin.data.js` `GRADE_LABEL`
   (`NEWCOMER=수습회원, ASSOCIATE=준회원, REGULAR=정회원, OB=졸업생`) 재사용.
   `shared/member/enums.js`의 `TITLE_LABELS`는 부서 직책용이라 라벨이 달라서
   (`NEWCOMER=신입부원` 등) 쓰지 않는다.
4. **복수 대상**: 여러 등급을 동시에 지정 가능해야 한다 → `target`은 등급 키
   배열. **빈 배열 = 전체 공개** (별도 `ALL` enum 값을 두지 않는다).
5. **capacity**: 두 화면 다 미구현 상태였으므로 이번 작업 범위에서 제외하고,
   openapi `Seminar`/`SeminarCreateRequest`에서도 함께 삭제한다.
6. **attendanceCode 노출**: admin은 임원 전용 관리 화면이므로 admin 조회
   응답에는 `attendanceCode`가 포함되도록 계약을 확장한다(공개 `GET
   /api/seminars` 응답에는 여전히 미노출 — 회원 대상 코드 노출 방지 목적 유지).
7. **구조 접근법**: 상태/등급 라벨을 `src/shared/seminar/enums.js` 공유 모듈로
   신설해 admin·seminar 양쪽이 여기서 import한다. `shared/member/enums.js`와
   동일한 패턴이며, 이후 한쪽만 라벨을 바꿔 다시 갈라지는 것을 구조적으로
   막는다. (대안이었던 "값만 맞추고 중복 유지"는 재발 위험 때문에, "seminar가
   admin에 직접 import되는 방향"은 의존 방향이 어색해서 기각.)

## 변경 대상 및 내용

### 1. `docs/api/openapi.yaml`

- `TargetGrade` enum 스키마 신설: `[NEWCOMER, ASSOCIATE, REGULAR, OB]`.
- `Seminar`, `SeminarCreateRequest`에서 `capacity` 필드 삭제.
- `Seminar`, `SeminarCreateRequest`에 `target: { type: array, items:
  {$ref: '#/components/schemas/TargetGrade'} }` 추가. 설명: "공개 대상 등급.
  빈 배열은 전체 공개."
- `AdminListResponse.items`의 description에 seminars 리소스 한정 보강:
  "seminars 리소스 행에는 attendanceCode 포함(공개 Seminar 응답과 달리 임원
  전용 조회이므로 노출)." (`items`가 이미 `additionalProperties: true`인
  느슨한 스키마라 별도 타입 분기 없이 설명만 추가하면 됨.)

### 2. `src/shared/seminar/enums.js` (신설)

```js
export const SEMINAR_STATUS_LABELS = { UPCOMING: '예정', ONGOING: '진행 중', ENDED: '종료' };
export const TARGET_GRADE_LABELS = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };

export const SEMINAR_STATUSES = Object.keys(SEMINAR_STATUS_LABELS);
export const TARGET_GRADES = Object.keys(TARGET_GRADE_LABELS);

export function seminarStatusLabel(key) {
  return key ? SEMINAR_STATUS_LABELS[key] ?? null : null;
}

/** 등급 키 배열 → 한글 라벨. 빈 배열/undefined → '전체'. */
export function targetGradeLabels(keys) {
  if (!keys || keys.length === 0) return '전체';
  return keys.map((k) => TARGET_GRADE_LABELS[k]).join('·');
}
```

### 3. `src/features/admin/admin.data.js`

- `SEMINAR_STATUS_LABEL` 상수 삭제 → `shared/seminar/enums.js`의
  `SEMINAR_STATUS_LABELS`를 import해 사용.
- `SCHEMAS.seminars.cols` 재정의 (openapi 필드 1:1):
  `title, speaker, topic, startsAt(일시), place, mode, target(대상,
  multiselect), attendanceCode(출석코드), status`. 기존 `date`/`code`/구
  `target`(자유문자열) 컬럼 제거.
- `SEED.seminars` 시드 데이터를 새 필드 구성으로 재작성 (`target`은 등급 키
  배열, 예: `['NEWCOMER']`, `[]`=전체).

### 4. `src/features/admin/admin.api.js`

- `ENUM_FIELDS.seminars`에 `status`(기존 유지)만이 아니라 `target` 배열
  매핑을 추가한다. 기존 `flip()`은 단일 값 라벨↔키 매핑용이라 배열 필드에는
  그대로 쓸 수 없으므로, `toWire`/`fromWire`에 배열 필드 전용 분기를 추가한다
  (`target`은 키 배열을 그대로 주고받고, 화면 표시용 라벨 조립은
  `targetGradeLabels()`로 별도 처리).

### 5. `src/features/admin/views/table/` (DataTable/EditableCell)

- 컬럼 `type: 'multiselect'` 신설: 등급 체크박스 목록으로 렌더링, 값은 배열로
  저장. 기존 `type: 'select'`(단일값) 렌더링 경로와 분리.
- `admin.validation.js`에 해당 필드용 검증 규칙 없으면 통과(현재 다른 select
  필드들도 필수 검증 없음과 동일하게).

### 6. `src/features/seminar/seminar.data.js`

- `STATUS_BADGE`의 `label`을 `shared/seminar/enums.js`
  `SEMINAR_STATUS_LABELS`로 교체하고, `tone`만 이 파일에 남긴다:
  `{ UPCOMING: 'brand', ONGOING: 'seal', ENDED: 'neutral' }`.

### 7. `src/features/seminar/seminar.api.js`

- `createSeminar` payload에 `target` 필드 추가(기본값 빈 배열).

### 8. `src/features/seminar/views/CreateModal.jsx`

- "공개 대상" multi-select 입력 추가 (수습회원/준회원/정회원/졸업생 체크박스).
  전체 비워두면 "전체 공개"로 안내하는 보조 문구 표시.

## 검증 계획

- admin 세미나 표에서 등급 여러 개 선택해 저장 → `toWire` 결과가 배열 그대로
  전송되는지 mock 응답/네트워크 탭으로 확인.
- seminar `CreateModal`에서 대상 선택 후 등록 → payload에 `target` 배열
  포함되는지 확인.
- 두 화면에서 동일 세미나의 status 배지 문구(진행 중/종료)가 일치하는지
  육안 확인.
- lint/build로 깨진 import 없는지 확인 (`shared/seminar/enums.js` 신설 경로
  포함).

## 범위 밖

- `attendanceCode` 값 자체의 보안 처리(해싱 등) — 기존 정책 유지, 노출 범위만
  admin 조회로 확장.
- capacity(정원) 재도입 — 별도 요청 시 후속 작업.
- 백엔드(Spring) 실제 구현 — 이 스펙은 프론트 계약 문서(openapi.yaml)와 FE
  코드 변경 범위만 다룬다.
