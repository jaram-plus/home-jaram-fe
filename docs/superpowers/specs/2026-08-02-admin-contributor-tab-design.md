# 관리자 인원 관리 — '기여자' 탭 설계

작성일: 2026-08-02

## 목표

관리자 콘솔 '인원 관리'의 **기여자** 탭을 실제로 동작하게 만든다.

1. 임원 임기를 받은 회원은 **자동으로** 기여자가 된다.
2. **기여자 추가** 버튼을 누르면 임원 지정과 같은 모양의 2단계 모달이 뜨고,
   목록에는 **아직 기여자가 아닌** 회원만 나온다.
3. 표에서 기여자를 **해제**할 수 있다.

## 배경 — 지금 무엇이 있고 무엇이 없는가

이미 있는 것:

- `Member.contributor` (boolean, `@ColumnDefault("false")`)
- `AdminResourceService.matchesMemberTab` 의 `case "contrib" -> m.isContributor()`
  — `GET /api/admin/members?tab=contrib` 는 이미 기여자만 걸러준다.
- 공개 화면 `PeopleService` 의 기여자 탭이 `Member::isContributor` 를 본다.
- 회원 상세 모달이 `data.contributor` 로 「기여자」 태그를 띄운다.

없는 것 — 그래서 이번에 만든다:

- **`contributor` 를 바꿀 수 있는 경로가 백엔드 전체에 하나도 없다.**
  `setContributor` 호출부는 엔티티 자신뿐이고, `AdminBatchExecutor.updateMember`
  의 수정 허용 필드는 `name`·`gen`·`grade`·`status`·`approval`·`department`·`title`
  뿐이다. 즉 지금은 아무도 기여자를 등록할 수 없다.
- `AdminResourceService.memberRow` 가 `contributor` 를 내려주지 않는다 —
  "기여자가 아닌 회원"을 골라내는 모달이 판정할 근거가 없다.
- `memberRow` 는 **현직** 부서·직책만 준다. 지난 임기를 표현할 수 없어
  표의 「직책 이력」("전 학술부장")을 만들 수 없다.
- 프론트 `SCHEMAS.contrib` 는 mock 기준(`type`·`contribution`·`link`)이라
  백엔드 모델에 대응 필드가 없다. `contrib` 는 아직 `LIVE_RESOURCES` 밖이라
  `SEED.contrib` 로 그려지고 있다.

## 범위

**이번 스코프**

- 백엔드: 임기 부여 시 기여자 자동 등록, 기존 데이터 백필, 일괄 저장 화이트리스트에
  `contributor` 추가, `memberRow` 투영 확장, 공개 기여자 탭에서 현직 임원 제외.
- 프론트: `contrib` 실 연동 전환, 표 스키마 교체, 기여자 추가 모달, 기여자 해제 액션,
  모달 공용 셸 추출.

**범위 밖**

- 기여 내용·구분·링크 같은 서술 필드 — `Member` 에 없고 이번 요구에도 없다.
  기여자 표는 회원 정보를 그대로 보여준다.
- 기여자 추가·해제의 서버측 권한 검증. `/admin` 은 `RequireAdmin` 이 `OFFICER`·`ADMIN`
  만 통과시키고, 그 안에서는 임원 누구나 기여자를 관리한다. 임원 지정(`exec.roles.js`)
  처럼 세부 역할로 나누지 않으므로 추가 판정 로직 자체가 없다.
- 기여자 표에서의 회원 정보 수정 — 회원 탭이 담당한다(임원진 탭과 같은 규칙).

## 백엔드 (home-jaram-be)

### 1. 임기 부여 시 자동 등록 — `Member.assignTerm`

```java
public void assignTerm(MemberDepartment d, MemberTitle t, int currentGen) {
    this.contributor = true;                    // 임기를 받은 사람은 기여자다
    Optional<MemberTerm> cur = currentTerm();
    if (cur.isPresent() && cur.get().getDepartment() == d && cur.get().getTitle() == t) return;
    ...
}
```

같은 (부서, 직책) 재지정은 early-return 하므로 대입은 그 **앞**에 둔다.
임기 종료(`endCurrentTerm`)는 플래그를 건드리지 않는다 — 이력은 남는다.

플래그의 의미는 이제 **"임원 이력이 있거나 직접 등록된 사람"** 이다.
현직 임원도 참이며, 공개 화면에서의 처리는 §4 에서 따로 정한다.

### 2. 기존 데이터 백필

Flyway 가 없고 `ddl-auto: update` 라 마이그레이션 파일을 둘 자리가 없다.
`com.jaram.be.member.ContributorBackfill` 을 `ApplicationRunner` 로 둔다.

```java
members.findAll().stream()
    .filter(m -> !m.isContributor() && !m.getTerms().isEmpty())
    .forEach(m -> m.setContributor(true));
```

멱등하고(두 번째 실행부터는 대상이 0건), 회원 수백 규모라 부팅 비용이 무시할
수준이다. 그래서 실행 후에도 지우지 않고 남겨 자가 치유되게 둔다.

### 3. 일괄 저장 화이트리스트 — `AdminBatchExecutor.updateMember`

```java
case "contributor" -> boolField(v, errors, k, m::setContributor, actions);
```

`intField` 와 같은 모양의 `boolField` 헬퍼를 새로 만든다 — `Boolean` 또는
`"true"`/`"false"` 문자열을 받고, 그 외 값은 `errors` 에 "허용되지 않은 값입니다."

`contributor` 는 다른 필드와 상호작용하지 않는다. 졸업(OB)·직책 조합 규칙과
얽히지 않으므로 추가 검증이 없다.

### 4. 공개 기여자 탭에서 현직 임원 제외 — `PeopleService.list`

```java
flatTab("자람에 힘을 더해주신 분들입니다.", "등록된 기여자가 없습니다.",
        active.stream()
              .filter(Member::isContributor)
              .filter(m -> m.currentTerm().isEmpty())   // 현직은 임원 탭이 담당
              .toList()),
```

§1 이후 현직 임원도 `contributor == true` 가 되므로, 이 필터가 없으면 임원 탭과
기여자 탭에 같은 사람이 두 번 실린다. **관리 화면(`tab=contrib`)은 거르지 않는다** —
관리자는 자동 등록이 실제로 걸렸는지 봐야 하고, 임기가 끝나면 그대로 공개된다.

### 5. 행 투영 확장 — `AdminResourceService.memberRow`

```java
r.put("contributor", m.isContributor());
MemberTerm last = m.currentTerm().or(m::lastEndedTerm).orElse(null);
r.put("termDepartment", last == null ? null : last.getDepartment().name());
r.put("termTitle", last == null ? null : last.getTitle().name());
r.put("termEndGen", last == null ? null : last.getEndGen());
```

- `contributor` — 추가 모달이 후보를 거르는 근거.
- `term*` — 표의 「직책 이력」. 현직이 있으면 현직, 없으면 마지막으로 끝난 임기.
  이미 `termStartGen` 이 같은 방식(특정 탭 전용 파생값)으로 실려 있어 패턴이 일관된다.

`AdminListResponse.items` 는 `additionalProperties: true` 이고 `tab=contrib` 설명도
이미 있으므로 **openapi.yaml 변경은 없다.**

### 6. 테스트

- `AdminMemberAssignmentTest` — 임기를 주면 `contributor` 가 참이 된다.
- `AdminResourceTest` — `tab=contrib` 행에 `contributor`·`termTitle`·`termEndGen` 이
  실린다. `contributor: false` 업데이트가 적용된다.
- `PeopleTest` — 현직 임원은 기여자 탭에 없고, 임기가 끝난 회원은 있다.
  기존 `returnsActiveMembersGroupedByTab` 이 §1·§4 로 깨지지 않는지 함께 확인한다.

## 프론트엔드 (home-jaram-fe)

### 1. `admin.data.js`

`SCHEMAS.contrib` 를 회원 기반으로 교체한다. **모든 컬럼이 `static`** 이다 —
기여자 탭에서 바뀌는 것은 기여자 여부 하나뿐이고, 회원 정보 수정은 회원 탭이
담당한다(임원진 탭과 같은 규칙).

```
eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '기여자 추가',
desc: '자람에 힘을 더해주신 분들입니다. 임원 임기를 받으면 자동으로 등록되고,
       기여자 추가로 직접 등록할 수 있습니다.',
filters: [{ key: 'grade', label: '등급', options: ['전체','수습회원','준회원','정회원','졸업생'] }],
cols:
  name       이름       static  0.9fr
  studentId  학번       static  1fr
  gen        기수       static  0.6fr  center
  role       직책 이력  static  1.1fr
  grade      등급       static  0.8fr
  __act      —          actions 1fr    center  ['detail','uncontrib']
```

- `SEED.contrib` 삭제 (실 연동 전환).
- `TOAST.contribAdded(name)` = `` `${name} 님을 기여자로 등록했습니다.` ``
- `MESSAGES.noContribCandidate` = `'등록할 수 있는 회원이 없습니다. 이미 기여자로
  등록된 회원은 목록에 나오지 않습니다.'`

### 2. `admin.api.js`

- `LIVE_RESOURCES` 에 `'contrib'` 추가.
- `fetchList` 에 `if (resource === 'contrib') return fetchContribs(params);`

```
fetchContribs(params)
  GET /api/admin/members?tab=contrib&page=1&size=ALL_ROWS_SIZE
  → fromWire('contrib', m) + role 파생 → queryLocally(rows, params)
```

`role` 파생 — `titleLabel(termTitle, termDepartment)` 에 `termEndGen != null` 이면
`'전 '` 접두. 임기가 없으면(직접 등록된 기여자) `'—'`.

`fromWire('contrib', …)` 는 `GEN_RESOURCES` 에 `contrib` 이 이미 있어 `gen` 정수를
`'41기'` 로 바꿔준다. `grade` 라벨 변환을 위해 `ENUM_FIELDS.contrib = { grade: GRADE_LABEL }`
를 더한다.

```
fetchContribCandidates()
  GET /api/admin/members?tab=member&page=1&size=ALL_ROWS_SIZE
  → filter(approval === 'APPROVED' && !contributor)
  → { id, name, studentId, gen, faculty, version }
```

`fetchAssignableMembers` 와 같은 모양이다. 졸업생(OB)은 제외하지 않는다 —
졸업한 선배야말로 기여자로 등록할 대상이다.

```
addContributor({ member })
  PATCH /api/admin/members:batch
  { updates: [{ id, version, fields: { contributor: true } }], creates: [], deletes: [] }
  → conflicts/errors 를 열어보고 실패면 code 를 붙여 throw
```

`assignExec` 와 같은 규약이다(배치는 행이 실패해도 200 + `errors[]` 로 온다).

**해제는 전용 API 를 만들지 않는다.** 표의 `uncontrib` 액션이 `contributor: false` 를
스테이지하고 하단 저장바가 기존 `saveBatch('contrib', …)` 로 커밋한다 —
임원진 탭의 '임기 해제'와 완전히 같은 흐름이다. `toWire` 는 `contrib` 의 boolean 을
그대로 통과시킨다(빈 문자열만 `null` 로 바꾼다).

### 3. `admin.queries.js`

- `adminKeys.contribCandidates()` = `['admin','contribCandidates']`
- `useContribCandidates()`
- `useAddContributor()` — 성공 시 `['admin','list']`, `contribCandidates()`,
  `['admin','member']`, `dashboard()` 무효화.

### 4. 모달 공용 셸 — `views/forms/PickerModal.jsx` (신규)

`ExecAssignModal` 과 `ContribAddModal` 은 셸·헤더·검색·목록·푸터가 사실상 같다.
그대로 복사하면 ~180줄이 중복되므로 공용 조각을 뽑는다.

```
PickerModal({ children })         고정 크기(520×620) 오버레이 카드 + Esc 닫기
PickerHeader({ eyebrow, title, desc, onClose })
MemberPicker({ query, onPick, emptyMessage })   검색 입력 + 회원 목록 + 로딩/에러/빈 상태
PickerNote({ children })
PickerFooter({ onBack, onSubmit, submitLabel, disabled, busy })
```

`MemberPicker` 의 `query` 는 TanStack Query 결과(`{ data, isLoading, error }`)를
그대로 받는다 — 어떤 목록을 부를지는 각 모달이 정한다.

`ExecAssignModal` 은 이 조각들을 쓰도록 고쳐 쓰고 2단계(부서·직책 선택)만 남긴다.
아직 커밋되지 않은 신규 파일이라 지금 추출하는 비용이 가장 싸다.

### 5. `views/forms/ContribAddModal.jsx` (신규)

2단계. `ExecAssignModal` 과 개수·레이아웃이 같다.

1. **회원 고르기** — `useContribCandidates()`. 이름·학번·학과로 검색.
   비면 `MESSAGES.noContribCandidate`.
2. **확인** — 고른 회원의 이름·기수·학번을 보여주고 `[이전] [기여자로 추가]`.
   `useAddContributor()` 로 즉시 커밋하고, 성공하면 `TOAST.contribAdded(name)` 후 닫는다.

eyebrow 는 `CONTRIB`.

### 6. `views/table/TableView.jsx`

- `onAddRow` — `resource === 'contrib'` 이면 `setAddingContrib(true)` (exec 분기 옆).
- `onAction` — `kind === 'uncontrib'`:

```js
const orig = origById[row.id] || {};
setEdit(resource, row.id, 'contributor', row.contributor === false ? orig.contributor : false, orig.contributor);
```

  `unassign` 과 대칭이다. 이미 해제해 둔 행을 다시 누르면 원래 값으로 되돌린다.
- `{addingContrib && <ContribAddModal onClose={…} onDone={showToast} />}`
- contrib 탭은 권한 판정이 없으므로 `me`·`grants` 를 조회하지 않는다 (현행 유지).

### 7. `views/table/EditableCell.jsx`

`actionLabel` 에 한 줄, `actionStyle` 은 기본값(`delete` 계열의 중립 스타일)을 쓴다.

```js
if (kind === 'uncontrib') return row.contributor === false ? '해제 취소' : '기여자 해제';
```

`unassign` 처럼 `canEditRow` 로 거르지 않는다 — 기여자 관리에는 역할 게이트가 없다.

### 8. `views/index.js`

`PickerModal` 조각과 `ContribAddModal` 을 재수출한다.

## 검증

1. `cd home-jaram-be && ./gradlew test` — §6 의 신규·기존 테스트 통과.
2. `cd home-jaram-fe && npm run build` — 타입/번들 오류 없음.
3. 실제 화면 왕복:
   - 임원 지정 → 기여자 탭에 그 회원이 나타난다.
   - 기여자 추가 모달 → 이미 기여자인 회원은 후보에 없다.
   - 기여자 해제 → 저장바 커밋 후 목록에서 빠지고, 후보 목록에 다시 나타난다.
   - 공개 `/people` 기여자 탭에 현직 임원이 없고, 임기가 끝난 회원은 있다.

## 결정 기록

| 결정 | 이유 |
| --- | --- |
| 자동 등록을 파생이 아니라 **영속 플래그**로 | 공개 화면·관리 화면·회원 상세가 이미 `contributor` 하나를 본다. 파생으로 가면 세 곳의 규칙을 각각 맞춰야 하고, 관리자가 개별 해제할 수단이 없어진다. |
| 임기 **시작** 시점에 찍는다 | 종료 시점에 찍으면 현직 임원이 기여자가 아니게 되어, 임기가 끝나는 순간 갑자기 등장한다. 시작 시점에 찍고 공개 화면에서만 현직을 거르는 쪽이 데이터 의미가 단순하다. |
| 기여 내용·구분·링크를 만들지 않는다 | `Member` 에 없는 필드고 요구에도 없다. 표는 회원 정보를 그대로 보여준다. |
| 해제에 전용 API 를 두지 않는다 | 표의 일괄 저장이 이미 유일한 수정 경로다. 저장 경로를 둘로 만들면 같은 행의 충돌 처리가 늘어난다. |
| 역할 게이트를 두지 않는다 | `/admin` 이 이미 `OFFICER`·`ADMIN` 만 통과시킨다. 기여자 등록은 임기 부여만큼 민감하지 않다. |
| 모달 공용 셸을 추출한다 | 복사하면 ~180줄이 중복된다. `ExecAssignModal` 이 아직 커밋 전이라 지금이 가장 싸다. |
