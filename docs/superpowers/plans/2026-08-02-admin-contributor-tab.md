# 관리자 인원 관리 '기여자' 탭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 콘솔 '인원 관리'의 기여자 탭을 실 데이터로 잇고, 임원 임기를 받은 회원은 자동 등록하며, '기여자 추가' 모달로 직접 등록·해제할 수 있게 한다.

**Architecture:** `Member.contributor` 를 단일 진실원으로 삼는다. 임기 부여 시 백엔드가 플래그를 찍고, 관리 화면은 기존 `PATCH /api/admin/members:batch` 경로로 플래그를 켜고 끈다. 새 엔드포인트는 만들지 않는다 — 목록은 이미 있는 `GET /api/admin/members?tab=contrib` 을, 수정은 이미 있는 배치를 쓴다. 프론트는 임원진 탭과 같은 모양(읽기 전용 표 + 모달로 등록 + 스테이지된 해제 + 일괄 저장)으로 맞춘다.

**Tech Stack:** 백엔드 Spring Boot (Java 21, JPA, `ddl-auto: update`, RestAssured + Testcontainers). 프론트 React 19 + Vite, TanStack Query v5, zustand, react-router-dom v7.

**설계서:** `docs/superpowers/specs/2026-08-02-admin-contributor-tab-design.md`

## Global Constraints

- 두 개의 레포를 오간다. 백엔드 `/home/ksb/Dev/home-jaram/home-jaram-be`, 프론트 `/home/ksb/Dev/home-jaram/home-jaram-fe`. 커밋도 각 레포에서 따로 한다.
- 커밋 메시지는 한국어 현재형 서술("~한다"), Conventional Commits 접두사. 예: `feat(admin): 임기를 받으면 기여자로 등록한다`
- 주석·UI 문구는 **한국어 존댓말**, **이모지 금지** (`docs/dev/code-rules.md`).
- 프론트 UI 는 `src/design-system` 토큰(`var(--brand)`, `var(--space-5)` …)만 쓴다. 새 색·여백을 만들지 않는다.
- 프론트 import 는 `@/` alias.
- **프론트에는 테스트 프레임워크가 없다** (`package.json` 에 vitest/jest 없음). 이번 작업에서 도입하지 않는다. 프론트 검증은 `npm run lint` + `npm run build` + 명시된 수동 확인이다.
- 백엔드 테스트는 Docker 가 필요하다 (Testcontainers + PostgreSQL).
- `openapi.yaml` 은 변경하지 않는다 — `AdminListResponse.items` 가 `additionalProperties: true` 이고 `tab=contrib` 설명이 이미 있다.

## File Structure

**백엔드 (home-jaram-be)**

| 파일 | 책임 | 작업 |
| --- | --- | --- |
| `src/main/java/com/jaram/be/member/Member.java` | 임기 부여 시 기여자 플래그 | 수정 |
| `docs/migrations/2026-08-02-contributor-backfill.sql` | 기존 임기 보유자 백필 | 신규 |
| `src/main/java/com/jaram/be/admin/AdminBatchExecutor.java` | 일괄 저장 화이트리스트에 `contributor` | 수정 |
| `src/main/java/com/jaram/be/admin/AdminResourceService.java` | `memberRow` 투영 확장 | 수정 |
| `src/main/java/com/jaram/be/people/PeopleService.java` | 공개 기여자 탭에서 현직 임원 제외 | 수정 |
| `src/test/java/com/jaram/be/admin/AdminMemberAssignmentTest.java` | 자동 등록 | 수정 |
| `src/test/java/com/jaram/be/admin/AdminResourceTest.java` | 투영·업데이트 | 수정 |
| `src/test/java/com/jaram/be/people/PeopleTest.java` | 공개 탭 규칙 (기존 테스트 1건 반전) | 수정 |

**프론트 (home-jaram-fe)**

| 파일 | 책임 | 작업 |
| --- | --- | --- |
| `src/features/admin/admin.data.js` | `SCHEMAS.contrib` 교체, 시드 삭제, 문구 | 수정 |
| `src/features/admin/admin.api.js` | `fetchContribs` · `fetchContribCandidates` · `addContributor` | 수정 |
| `src/features/admin/admin.queries.js` | `useContribCandidates` · `useAddContributor` | 수정 |
| `src/features/admin/views/forms/PickerModal.jsx` | 모달 공용 셸·헤더·회원 목록·푸터 | 신규 |
| `src/features/admin/views/forms/ExecAssignModal.jsx` | 공용 조각으로 이관 | 수정 |
| `src/features/admin/views/forms/ContribAddModal.jsx` | 기여자 추가 2단계 모달 | 신규 |
| `src/features/admin/views/table/TableView.jsx` | 추가 버튼·해제 액션 배선 | 수정 |
| `src/features/admin/views/table/EditableCell.jsx` | `uncontrib` 액션 라벨 | 수정 |
| `src/features/admin/views/index.js` | 재수출 | 수정 |

**작업 순서:** 백엔드(Task 1–4)를 먼저 끝내야 프론트가 실 데이터를 볼 수 있다. Task 5–9 는 프론트다.

---

## Task 1: 임기를 받으면 기여자로 등록한다

**Files:**
- Modify: `home-jaram-be/src/main/java/com/jaram/be/member/Member.java` (`assignTerm`)
- Create: `home-jaram-be/docs/migrations/2026-08-02-contributor-backfill.sql`
- Test: `home-jaram-be/src/test/java/com/jaram/be/admin/AdminMemberAssignmentTest.java`

**Interfaces:**
- Consumes: 없음 (첫 작업)
- Produces: `Member.assignTerm(MemberDepartment, MemberTitle, int)` 호출 후 `member.isContributor() == true`. Task 4 의 `PeopleService` 필터와 Task 3 의 `memberRow` 가 이 사실에 의존한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`AdminMemberAssignmentTest` 맨 아래(마지막 `}` 앞)에 추가한다.

```java
    @Test
    void assigningATermRegistersTheMemberAsContributor() {
        Member m = approved("기여등록", "2023000006");
        assertThat(m.isContributor()).isFalse();

        patch(m.getId(), Map.of("department", "PR", "title", "STAFF"))
                .body("updated.size()", equalTo(1));

        assertThat(members.findById(m.getId()).orElseThrow().isContributor()).isTrue();
    }

    // 임기가 끝나도 이력은 남는다 — 기여자에서 자동으로 빠지지 않는다.
    @Test
    void endingATermKeepsTheContributorFlag() {
        Member m = approved("임기종료", "2023000007");
        m.assignTerm(MemberDepartment.FINANCE, MemberTitle.LEAD, 42);
        members.saveAndFlush(m);

        Map<String, Object> fields = new HashMap<>();
        fields.put("department", null);
        fields.put("title", null);
        patch(m.getId(), fields).body("updated.size()", equalTo(1));

        assertThat(members.findById(m.getId()).orElseThrow().isContributor()).isTrue();
    }
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
./gradlew test --tests '*AdminMemberAssignmentTest'
```

Expected: FAIL — `assigningATermRegistersTheMemberAsContributor` 에서 `Expecting value to be true but was false`.
(`endingATermKeepsTheContributorFlag` 는 `assignTerm` 이 아직 플래그를 안 찍으므로 같이 실패한다.)

- [ ] **Step 3: `Member.assignTerm` 을 고친다**

`Member.java` 의 `assignTerm` 을 아래로 바꾼다. **대입은 early-return 앞에** 둔다 — 같은 (부서, 직책) 재지정에서도 플래그는 켜져야 한다.

```java
    /** 같은 (부서, 직책)이면 아무것도 하지 않는다 — 저장할 때마다 길이 0 임기가 쌓이지 않도록. */
    public void assignTerm(MemberDepartment d, MemberTitle t, int currentGen) {
        // 임기를 받은 사람은 기여자다. 임기가 끝나도 이력이므로 되돌리지 않는다.
        this.contributor = true;
        Optional<MemberTerm> cur = currentTerm();
        if (cur.isPresent() && cur.get().getDepartment() == d && cur.get().getTitle() == t) return;
        cur.ifPresent(term -> term.end(currentGen));
        terms.add(MemberTerm.start(this, d, t, currentGen));
    }
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

```bash
./gradlew test --tests '*AdminMemberAssignmentTest'
```

Expected: PASS (신규 2건 포함 전부)

- [ ] **Step 5: 백필 SQL 을 쓴다**

`docs/migrations/2026-08-02-contributor-backfill.sql` 생성. 기존 `2026-07-20-member-refactor.sql` 의 서술 방식(대상 커밋·실행 시점·트랜잭션)을 따른다.

```sql
-- 기여자 플래그 백필 (PostgreSQL)
--
-- 배경
--   Member.assignTerm 이 이제 contributor 를 켠다. 그 변경 이전에 임기를 받은
--   회원은 플래그가 꺼진 채로 남아 있어, 관리 화면 기여자 탭과 공개 인원 소개에
--   나오지 않는다. 임기 이력이 있는 회원을 한 번에 기여자로 올린다.
--
-- 이 프로젝트는 ddl-auto: update 로 스키마를 관리하고 마이그레이션 도구가 없다.
-- 컬럼(member.contributor)과 테이블(member_term)은 이미 존재하므로 스키마 변경은
-- 없고, 데이터 이관만 한다.
--
-- ── 실행 시점 ──────────────────────────────────────────────────────────
-- 새 코드를 배포한 뒤 아무 때나 실행해도 된다. 멱등하므로 여러 번 실행해도
-- 두 번째부터는 0건이 갱신된다.

BEGIN;

-- 사전 점검 — 갱신될 건수. 따로 실행해 눈으로 확인한다.
--   SELECT count(*) FROM member
--    WHERE contributor = false AND id IN (SELECT member_id FROM member_term);

UPDATE member SET contributor = true
 WHERE contributor = false
   AND id IN (SELECT DISTINCT member_id FROM member_term);

COMMIT;
```

- [ ] **Step 6: 커밋한다**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
git add src/main/java/com/jaram/be/member/Member.java \
        src/test/java/com/jaram/be/admin/AdminMemberAssignmentTest.java \
        docs/migrations/2026-08-02-contributor-backfill.sql
git commit -m "feat(member): 임기를 받으면 기여자로 등록한다"
```

---

## Task 2: 일괄 저장으로 기여자 여부를 바꾼다

**Files:**
- Modify: `home-jaram-be/src/main/java/com/jaram/be/admin/AdminBatchExecutor.java` (`updateMember` 의 `switch`, 값 변환 헬퍼 구역)
- Test: `home-jaram-be/src/test/java/com/jaram/be/admin/AdminResourceTest.java`

**Interfaces:**
- Consumes: Task 1 의 자동 등록 (테스트에서 임기 없는 회원을 쓰므로 간섭은 없다)
- Produces: `PATCH /api/admin/members:batch` 의 `fields.contributor` 가 `true`/`false` 를 받아 적용된다. Task 7·9 의 프론트가 이 계약에 의존한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`AdminResourceTest` 의 `// ── A2 batch ──` 구역 끝(다음 구역 주석 또는 마지막 `}` 앞)에 추가한다.

```java
    @Test
    void batchUpdateTogglesContributorFlag() {
        Member m = approved("기여토글", "2023000031");
        assertThat(m.isContributor()).isFalse();

        Map<String, Object> on = new HashMap<>();
        on.put("id", m.getId());
        on.put("version", null);
        on.put("fields", Map.of("contributor", true));

        given().header("Authorization", "Bearer " + officerToken)
                .contentType("application/json")
                .body(Map.of("updates", List.of(on)))
                .when().patch("/api/admin/members:batch")
                .then().statusCode(200)
                .body("updated.size()", equalTo(1))
                .body("errors.size()", equalTo(0));

        assertThat(members.findById(m.getId()).orElseThrow().isContributor()).isTrue();

        Map<String, Object> off = new HashMap<>();
        off.put("id", m.getId());
        off.put("version", null);
        off.put("fields", Map.of("contributor", false));

        given().header("Authorization", "Bearer " + officerToken)
                .contentType("application/json")
                .body(Map.of("updates", List.of(off)))
                .when().patch("/api/admin/members:batch")
                .then().statusCode(200)
                .body("updated.size()", equalTo(1));

        assertThat(members.findById(m.getId()).orElseThrow().isContributor()).isFalse();
    }

    @Test
    void batchUpdateRejectsNonBooleanContributor() {
        Member m = approved("잘못된값", "2023000032");
        Map<String, Object> update = new HashMap<>();
        update.put("id", m.getId());
        update.put("version", null);
        update.put("fields", Map.of("contributor", "예"));

        given().header("Authorization", "Bearer " + officerToken)
                .contentType("application/json")
                .body(Map.of("updates", List.of(update)))
                .when().patch("/api/admin/members:batch")
                .then().statusCode(200)
                .body("errors.size()", equalTo(1))
                .body("errors[0].fieldErrors.contributor", notNullValue())
                .body("updated.size()", equalTo(0));
    }
```

`AdminResourceTest` 에는 `approved(name, sid)` 헬퍼·`officerToken`·`HashMap`/`List`/`Map`·`import static org.hamcrest.Matchers.*` 가 이미 있다(`notNullValue` 는 여기 포함된다). **`assertThat` 만 없으므로** import 를 추가한다.

```java
import static org.assertj.core.api.Assertions.assertThat;
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
./gradlew test --tests '*AdminResourceTest'
```

Expected: FAIL — `contributor` 가 화이트리스트에 없어 `errors[0].fieldErrors.contributor == "수정할 수 없는 필드입니다."` 가 되고 `updated.size()` 가 0 이다.

- [ ] **Step 3: 화이트리스트와 헬퍼를 더한다**

`updateMember` 의 `switch` 에서 `case "approval"` 다음 줄에 추가한다.

```java
                case "contributor" -> boolField(v, errors, k, m::setContributor, actions);
```

값 변환 헬퍼 구역(`intField` 바로 아래)에 추가한다.

```java
    private void boolField(Object v, Map<String, String> errors, String key,
                           Consumer<Boolean> setter, List<Runnable> actions) {
        Boolean b = asBool(v);
        if (b == null) errors.put(key, "참/거짓이 아닙니다.");
        else actions.add(() -> setter.accept(b));
    }

    private Boolean asBool(Object v) {
        if (v instanceof Boolean b) return b;
        if (v == null) return null;
        String s = v.toString().trim();
        if (s.equalsIgnoreCase("true")) return Boolean.TRUE;
        if (s.equalsIgnoreCase("false")) return Boolean.FALSE;
        return null;
    }
```

`contributor` 는 졸업(OB)·직책 조합 규칙과 얽히지 않으므로 `updateMember` 아래쪽의 교차 검증 블록은 손대지 않는다.

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

```bash
./gradlew test --tests '*AdminResourceTest'
```

Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/main/java/com/jaram/be/admin/AdminBatchExecutor.java \
        src/test/java/com/jaram/be/admin/AdminResourceTest.java
git commit -m "feat(admin): 일괄 저장으로 기여자 여부를 바꾼다"
```

---

## Task 3: 관리 목록 행에 기여자 여부와 임기 정보를 싣는다

**Files:**
- Modify: `home-jaram-be/src/main/java/com/jaram/be/admin/AdminResourceService.java` (`memberRow`)
- Test: `home-jaram-be/src/test/java/com/jaram/be/admin/AdminResourceTest.java`

**Interfaces:**
- Consumes: Task 1 의 자동 등록
- Produces: `GET /api/admin/members` 의 각 행에 `contributor`(boolean), `termDepartment`(String|null), `termTitle`(String|null), `termEndGen`(Integer|null). Task 5 의 `fetchContribs` 가 「직책 이력」 컬럼을, Task 7 의 `fetchContribCandidates` 가 후보 필터를 이 필드들로 만든다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`AdminResourceTest` 의 `// ── A1 목록 ──` 구역(다른 `listFilters…` 테스트 옆)에 추가한다.

```java
    @Test
    void memberRowCarriesContributorAndLastTerm() {
        // 임기가 끝난 회원 — 마지막으로 끝난 임기가 실린다.
        Member past = approved("전학술", "2023000041");
        past.assignTerm(MemberDepartment.ACADEMIC, MemberTitle.LEAD, 40);
        past.endCurrentTerm(41);
        members.saveAndFlush(past);

        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members?tab=contrib")
                .then().statusCode(200)
                .body("items.size()", equalTo(1))
                .body("items[0].name", equalTo("전학술"))
                .body("items[0].contributor", equalTo(true))
                .body("items[0].termDepartment", equalTo("ACADEMIC"))
                .body("items[0].termTitle", equalTo("LEAD"))
                .body("items[0].termEndGen", equalTo(41));
    }

    @Test
    void memberRowCarriesCurrentTermWithoutEndGen() {
        Member current = approved("현직", "2023000042");
        current.assignTerm(MemberDepartment.INFRA, MemberTitle.SERVER_ADMIN, 42);
        members.saveAndFlush(current);

        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members?tab=exec")
                .then().statusCode(200)
                .body("items[0].termTitle", equalTo("SERVER_ADMIN"))
                .body("items[0].termDepartment", equalTo("INFRA"))
                .body("items[0].termEndGen", nullValue());
    }

    @Test
    void memberRowWithoutAnyTermHasNullTermFields() {
        approved("임기없음", "2023000043");

        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members?tab=member")
                .then().statusCode(200)
                .body("items[0].contributor", equalTo(false))
                .body("items[0].termTitle", nullValue())
                .body("items[0].termDepartment", nullValue())
                .body("items[0].termEndGen", nullValue());
    }
```

`nullValue` import(`org.hamcrest.Matchers.nullValue`)가 없으면 추가한다.

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
./gradlew test --tests '*AdminResourceTest'
```

Expected: FAIL — `items[0].contributor` 등이 `null`(응답에 키가 없음)이다.

- [ ] **Step 3: `memberRow` 투영을 넓힌다**

`AdminResourceService.memberRow` 의 `r.put("termStartGen", …)` 다음에 추가한다.

```java
        r.put("contributor", m.isContributor());
        // 기여자 표의 「직책 이력」 — 현직이 있으면 현직, 없으면 마지막으로 끝난 임기.
        MemberTerm last = m.currentTerm().or(m::lastEndedTerm).orElse(null);
        r.put("termDepartment", last == null ? null : last.getDepartment().name());
        r.put("termTitle", last == null ? null : last.getTitle().name());
        r.put("termEndGen", last == null ? null : last.getEndGen());
```

`MemberTerm` import 는 이미 있다(`termStartGen` 이 쓴다).

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

```bash
./gradlew test --tests '*AdminResourceTest'
```

Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/main/java/com/jaram/be/admin/AdminResourceService.java \
        src/test/java/com/jaram/be/admin/AdminResourceTest.java
git commit -m "feat(admin): 관리 목록 행에 기여자 여부와 임기 정보를 싣는다"
```

---

## Task 4: 공개 기여자 탭에서 현직 임원을 뺀다

**Files:**
- Modify: `home-jaram-be/src/main/java/com/jaram/be/people/PeopleService.java` (`list`)
- Test: `home-jaram-be/src/test/java/com/jaram/be/people/PeopleTest.java`

**Interfaces:**
- Consumes: Task 1 의 자동 등록 (이 필터가 없으면 현직 임원이 두 탭에 중복 게시된다)
- Produces: 없음 (프론트 작업은 이 변경에 의존하지 않는다)

**⚠️ 기존 결정을 뒤집는 작업이다.** `officerWhoIsAlsoAContributorAppearsInBothTabs` 는 "현직 임원이면서 기여자면 두 탭 모두에 뜬다"를 의도적으로 고정하고 있다. 새 규칙에서는 현직 임기가 있는 동안 공개 기여자 탭에서 빠진다. 테스트를 지우지 말고 **이름과 주석까지 새 규칙으로 다시 쓴다.**

- [ ] **Step 1: 기존 테스트를 새 규칙으로 다시 쓴다**

`PeopleTest` 의 `officerWhoIsAlsoAContributorAppearsInBothTabs` 를 통째로 아래로 교체한다.

```java
    // 임기를 받으면 contributor 가 켜지므로(Member.assignTerm) 현직 임원은 모두
    // 기여자 플래그를 갖는다. 공개 화면에서는 임원 탭이 현직을 담당하므로
    // 기여자 탭에서 뺀다 — 같은 사람이 두 번 실리지 않게.
    @Test
    void currentOfficerIsExcludedFromTheContributorTab() {
        Member m = active("멀티", "2023000010", "m@hanyang.ac.kr", 40);
        m.assignTerm(MemberDepartment.LEADERSHIP, MemberTitle.PRESIDENT, 42);
        m.setContributor(true);
        members.save(m);

        given().when().get("/api/people").then().statusCode(200)
                .body("exec.groups.flatten().members.flatten().name", hasItem("멀티"))
                .body("contrib.groups.flatten().members.flatten().name", not(hasItem("멀티")))
                .body("grad.groups.flatten().members.flatten().name", not(hasItem("멀티")));
    }

    // 임기가 끝나면 임원 탭에서 빠지고 기여자 탭에 남는다.
    @Test
    void formerOfficerAppearsInTheContributorTab() {
        Member m = active("전부장", "2023000012", "past@hanyang.ac.kr", 39);
        m.assignTerm(MemberDepartment.PR, MemberTitle.LEAD, 40);
        m.endCurrentTerm(41);
        members.save(m);

        given().when().get("/api/people").then().statusCode(200)
                .body("exec.groups.flatten().members.flatten().name", not(hasItem("전부장")))
                .body("contrib.groups.flatten().members.flatten().name", hasItem("전부장"))
                .body("contrib.groups.flatten().members.flatten().role", hasItem("전 홍보부장"));
    }
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
./gradlew test --tests '*PeopleTest'
```

Expected: FAIL — `currentOfficerIsExcludedFromTheContributorTab` 에서 "멀티"가 여전히 기여자 탭에 있다.
(`formerOfficerAppearsInTheContributorTab` 은 Task 1 덕분에 이미 통과할 수 있다.)

- [ ] **Step 3: 기여자 필터를 좁힌다**

`PeopleService.list` 의 기여자 `flatTab` 호출을 아래로 바꾼다.

```java
                flatTab("자람에 힘을 더해주신 분들입니다.", "등록된 기여자가 없습니다.",
                        active.stream()
                              .filter(Member::isContributor)
                              // 현직은 임원 탭이 담당한다 — 같은 사람을 두 탭에 싣지 않는다.
                              .filter(m -> m.currentTerm().isEmpty())
                              .toList()),
```

**관리 화면(`AdminResourceService.matchesMemberTab`)은 손대지 않는다.** 관리자는 자동 등록이 실제로 걸렸는지 봐야 한다.

- [ ] **Step 4: `PeopleTest` 전체가 통과하는지 확인한다**

```bash
./gradlew test --tests '*PeopleTest'
```

Expected: PASS. 특히 `returnsActiveMembersGroupedByTab` 을 확인한다 — 이 테스트의 회장·학술부장이 Task 1 로 `contributor = true` 가 되지만 현직이라 기여자 탭에서 빠지므로, `contrib.groups[0].members[0].name == "박나눔"` 이 그대로 성립한다. 실패한다면 필터가 안 걸린 것이다.

- [ ] **Step 5: 백엔드 전체 테스트를 돌린다**

```bash
./gradlew test
```

Expected: PASS. `AdminContractTest`·`PeopleContractTest`·`AdminDashboardTest` 등이 Task 1–4 로 깨지지 않는지 확인한다. 깨지면 그 테스트가 고정하던 규칙을 읽고, 새 규칙에 맞게 고칠지 구현을 고칠지 판단한 뒤 진행한다.

- [ ] **Step 6: 커밋한다**

```bash
git add src/main/java/com/jaram/be/people/PeopleService.java \
        src/test/java/com/jaram/be/people/PeopleTest.java
git commit -m "fix(people): 현직 임원을 공개 기여자 탭에서 뺀다"
```

---

## Task 5: 기여자 탭을 실 데이터로 잇는다

**Files:**
- Modify: `home-jaram-fe/src/features/admin/admin.data.js` (`SCHEMAS.contrib`, `SEED`, `MESSAGES`, `TOAST`)
- Modify: `home-jaram-fe/src/features/admin/admin.api.js` (`LIVE_RESOURCES`, `ENUM_FIELDS`, `fetchList`, `fetchContribs`)

**Interfaces:**
- Consumes: Task 3 의 행 필드 `contributor`·`termDepartment`·`termTitle`·`termEndGen`
- Produces: `contrib` 리소스 목록이 `{ id, name, studentId, gen, grade, role, contributor, version }` 형태의 행을 낸다. Task 8·9 의 표와 액션이 `row.contributor` 와 `row.role` 에 의존한다.

- [ ] **Step 1: `SCHEMAS.contrib` 를 교체한다**

`admin.data.js` 의 `SCHEMAS.contrib` 블록 전체를 바꾼다. 모든 컬럼이 `static` 이다 — 기여자 탭에서 바뀌는 것은 기여자 여부 하나뿐이고, 회원 정보 수정은 회원 탭이 담당한다(임원진 탭과 같은 규칙).

```js
  contrib: {
    // 이름·학번·기수·등급은 회원 정보라 이 표에서 고치지 않는다(회원 탭이 담당).
    // 여기서 바꾸는 건 기여자 여부뿐이며, 그것도 '기여자 해제'로만 이뤄진다.
    eyebrow: 'PEOPLE', title: '인원 관리', addLabel: '기여자 추가',
    desc: '자람에 힘을 더해주신 분들입니다. 임원 임기를 받으면 자동으로 등록되고, 기여자 추가로 직접 등록할 수 있습니다.',
    filters: [{ key: 'grade', label: '등급', options: ['전체', '수습회원', '준회원', '정회원', '졸업생'] }],
    cols: [
      { key: 'name', label: '이름', type: 'static', width: '0.9fr' },
      { key: 'studentId', label: '학번', type: 'static', width: '1fr' },
      { key: 'gen', label: '기수', type: 'static', width: '0.6fr', align: 'center' },
      { key: 'role', label: '직책 이력', type: 'static', width: '1.1fr' },
      { key: 'grade', label: '등급', type: 'static', width: '0.8fr' },
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'uncontrib'] },
    ],
  },
```

- [ ] **Step 2: 시드를 지우고 문구를 더한다**

`SEED` 객체에서 `contrib: [ … ]` 배열 전체를 삭제한다(`grad`·`studies` 는 그대로 둔다). `SEED` 상단 주석의 "member·exec 는 실 서버…" 문장을 `member·exec·contrib 는 실 서버(GET /api/admin/members)로 전환되어 시드를 두지 않는다.` 로 고친다.

`MESSAGES` 에 추가한다.

```js
  noContribCandidate: '등록할 수 있는 회원이 없습니다. 이미 기여자로 등록된 회원은 목록에 나오지 않습니다.',
```

`TOAST` 에 추가한다.

```js
  contribAdded: (name) => `${name} 님을 기여자로 등록했습니다.`,
```

- [ ] **Step 3: API 를 실 서버로 돌린다**

`admin.api.js` 를 세 군데 고친다.

`LIVE_RESOURCES` 에 `'contrib'` 추가:

```js
const LIVE_RESOURCES = new Set(['member', 'exec', 'contrib', 'seminars', 'seminarApprovals', 'applications']);
```

`ENUM_FIELDS` 에 `contrib` 추가 (등급 라벨 변환·필터가 라벨로 비교되므로 필요하다):

```js
  contrib: { grade: GRADE_LABEL },
```

`fetchList` 의 분기에 한 줄 추가 (`if (resource === 'exec') …` 다음):

```js
  if (resource === 'contrib') return fetchContribs(params);
```

- [ ] **Step 4: `fetchContribs` 를 쓴다**

`admin.api.js` 의 `fetchExecs` 함수 바로 아래에 추가한다.

```js
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
```

`titleLabel` 은 파일 상단에서 이미 import 하고 있다(`import { titleKey, titleLabel } from '@/shared/member/enums';`). `fromWire('contrib', …)` 는 `GEN_RESOURCES` 에 `contrib` 이 이미 있어 `gen` 정수를 `'41기'` 로 바꿔주고, Step 3 의 `ENUM_FIELDS.contrib` 로 `grade` 를 한글 라벨로 바꿔준다.

- [ ] **Step 5: 린트와 빌드를 확인한다**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe
npm run lint && npm run build
```

Expected: 둘 다 오류 없음. `SEED.contrib` 참조가 남아 있으면 여기서 잡힌다.

- [ ] **Step 6: 화면에서 확인한다**

백엔드를 띄운 채 `npm run dev` 로 `/admin/members?tab=contrib` 를 연다.

확인할 것:
- 임원 임기가 있는 회원이 목록에 나온다(Task 1 이후 지정한 회원, 또는 백필 SQL 실행분).
- 「직책 이력」이 `전 학술부장` 처럼 보이고, 현직이면 `학술부장` 으로 보인다.
- 기수가 `41기`, 등급이 `정회원` 처럼 한글 라벨이다.
- 등급 필터와 검색이 동작한다.
- 행의 「상세」 버튼이 회원 상세 모달을 연다.

「기여자 해제」 버튼은 아직 아무 라벨도 안 뜬다 — Task 9 에서 붙인다.

- [ ] **Step 7: 커밋한다**

```bash
git add src/features/admin/admin.data.js src/features/admin/admin.api.js
git commit -m "feat(admin): 기여자 탭을 실 데이터로 잇는다"
```

---

## Task 6: 모달 공용 셸을 뽑는다

**Files:**
- Create: `home-jaram-fe/src/features/admin/views/forms/PickerModal.jsx`
- Modify: `home-jaram-fe/src/features/admin/views/forms/ExecAssignModal.jsx`
- Modify: `home-jaram-fe/src/features/admin/views/index.js`

**Interfaces:**
- Consumes: 없음
- Produces: 아래 다섯 개를 `PickerModal.jsx` 가 named export 한다. Task 8 의 `ContribAddModal` 이 그대로 쓴다.
  - `PickerModal({ onClose, children })` — 고정 크기(520×620) 오버레이 카드. Esc·배경 클릭으로 닫는다.
  - `PickerHeader({ eyebrow, title, desc, onClose })`
  - `MemberPicker({ query, onPick, emptyMessage })` — `query` 는 TanStack Query 결과 `{ data, isLoading, error }`. `data` 는 `{ id, name, studentId, gen, faculty }[]`.
  - `PickerNote({ children })`
  - `PickerFooter({ onBack, onSubmit, submitLabel, disabled, busy })`

**순수 리팩터링이다 — 화면 동작이 바뀌면 안 된다.** `ExecAssignModal` 은 아직 커밋되지 않은 신규 파일이라 지금 추출하는 비용이 가장 싸다.

- [ ] **Step 1: `PickerModal.jsx` 를 만든다**

`ExecAssignModal.jsx` 의 셸·`Header`·`PickStep`·`Note`·푸터 버튼 스타일을 그대로 옮긴다. **스타일 값을 새로 만들지 말고 원본에서 복사한다** — 시각적 회귀가 없어야 한다.

```jsx
import React from 'react';

const WIDTH = 520;
const HEIGHT = 620;

/**
 * 회원을 골라 무언가를 지정하는 모달들의 공용 셸 (임원 지정 · 기여자 추가).
 * 크기를 고정해 1단계에서 2단계로 넘어갈 때 카드가 출렁이지 않게 합니다.
 * 표의 인라인 편집과 달리 이런 모달은 즉시 저장합니다 — 임명·등록은 모아 두었다
 * 함께 커밋할 성질이 아닙니다.
 */
export function PickerModal({ onClose, children }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: WIDTH, maxWidth: '100%', height: HEIGHT, maxHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 28, boxSizing: 'border-box' }}
      >
        {children}
      </div>
    </div>
  );
}

export function PickerHeader({ eyebrow, title, desc, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>{eyebrow}</p>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-strong)' }}>{title}</h3>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
    </div>
  );
}

/**
 * 검색 가능한 회원 목록. 어떤 회원을 부를지는 호출부가 정하고(query), 여기서는
 * 이름·학번·기수·학과로 좁히기만 합니다.
 *
 * @param query        TanStack Query 결과 { data, isLoading, error }
 * @param onPick       행을 누르면 그 회원 객체를 받습니다
 * @param emptyMessage 후보가 아예 없을 때의 안내 문구
 */
export function MemberPicker({ query, onPick, emptyMessage }) {
  const { data, isLoading, error } = query;
  const [term, setTerm] = React.useState('');

  const needle = term.trim().toLowerCase();
  const rows = (data || []).filter((m) => !needle
    || [m.name, m.studentId, m.gen, m.faculty].some((v) => String(v).toLowerCase().includes(needle)));

  return (
    <>
      <input
        type="text"
        placeholder="이름·학번·학과 검색"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', margin: '18px 0 12px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, outline: 'none' }}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        {isLoading && <PickerNote>회원 명단을 불러오는 중입니다.</PickerNote>}
        {error && <PickerNote>회원 명단을 불러오지 못했습니다.</PickerNote>}
        {!isLoading && !error && rows.length === 0 && (
          <PickerNote>{needle ? '검색 결과가 없습니다.' : emptyMessage}</PickerNote>
        )}
        {rows.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m)}
            style={{ display: 'grid', gridTemplateColumns: '58px 1fr 96px 1.1fr', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>{m.gen}</span>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{m.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{m.studentId}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.faculty || '—'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function PickerNote({ children }) {
  return <p style={{ margin: 0, padding: '28px 16px', textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{children}</p>;
}

export function PickerFooter({ onBack, onSubmit, submitLabel, disabled, busy }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
      <button type="button" onClick={onBack} style={{ padding: '10px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer' }}>
        이전
      </button>
      <button type="button" onClick={onSubmit} disabled={disabled || busy} style={{ padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', border: '1.5px solid transparent', borderRadius: 8, cursor: busy ? 'wait' : 'pointer', opacity: disabled || busy ? 0.6 : 1, boxShadow: 'var(--shadow-brand)' }}>
        {submitLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `ExecAssignModal` 을 공용 조각으로 이관한다**

`ExecAssignModal.jsx` 를 아래로 교체한다. 2단계(부서·직책 선택) 로직은 그대로고, 셸·헤더·목록·푸터만 공용 조각으로 바뀐다.

```jsx
import React from 'react';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import { MESSAGES, TOAST } from '../../admin.data';
import { departmentOptions, isHandover, titleOptions } from '../../exec.roles';
import { useAssignableMembers, useAssignExec } from '../../admin.queries';
import { PickerModal, PickerHeader, MemberPicker, PickerFooter } from './PickerModal';

/**
 * 임원 지정 모달 (2단계).
 *   1) 지정할 수 있는 회원 목록 — 현직 임기가 없고 졸업생도 아닌 회원. 검색으로 좁힙니다.
 *   2) 부서·직책 선택 — 로그인한 임원의 권한(grants) 안에서만 고를 수 있고,
 *      부서마다 허용되는 직책이 정해져 있습니다(백엔드 MemberTitle.allowedIn 과 같은 규칙).
 *
 * @param grants 로그인 임원이 줄 수 있는 { 부서키: [직책키] } (exec.roles.grantsOf)
 * @param me     로그인 임원의 { id, department, title } — 회장 인계 판정에 씁니다.
 */
export function ExecAssignModal({ grants, me, onClose, onDone }) {
  const [picked, setPicked] = React.useState(null);
  const candidates = useAssignableMembers();

  return (
    <PickerModal onClose={onClose}>
      {picked ? (
        <AssignStep member={picked} grants={grants} me={me} onBack={() => setPicked(null)} onClose={onClose} onDone={onDone} />
      ) : (
        <>
          <PickerHeader eyebrow="ASSIGN" title="임원 지정" desc="임기가 없는 회원 중에서 고르세요." onClose={onClose} />
          <MemberPicker query={candidates} onPick={setPicked} emptyMessage={MESSAGES.noAssignable} />
        </>
      )}
    </PickerModal>
  );
}

/* ── 2단계: 부서·직책 정하기 ────────────────────────────────────────── */

function AssignStep({ member, grants, me, onBack, onClose, onDone }) {
  const departments = departmentOptions(grants);
  const [department, setDepartment] = React.useState(departments[0] || '');
  const titles = titleOptions(grants, department);
  const [title, setTitle] = React.useState(titles[0] || '');

  // 부서를 바꾸면 이전 직책이 그 부서에서 허용되지 않을 수 있다 — 함께 맞춰 준다.
  const pickDepartment = (next) => {
    setDepartment(next);
    const allowed = titleOptions(grants, next);
    if (!allowed.includes(title)) setTitle(allowed[0] || '');
  };

  const handover = isHandover(me, title);
  const assign = useAssignExec({
    onSuccess: () => { onDone(TOAST.assigned(member.name, titleLabel(title, department))); onClose(); },
  });

  const submit = () => {
    if (!department || !title || assign.isPending) return;
    assign.mutate({
      member,
      department,
      title,
      // 회장을 넘기면 넘기는 쪽 임기도 함께 끝난다.
      handoverFrom: handover ? me.id : null,
    });
  };

  return (
    <>
      <PickerHeader eyebrow="ASSIGN" title="부서·직책 지정" desc={`${member.name} · ${member.gen} · ${member.studentId}`} onClose={onClose} />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 20 }}>
        <Row label="부서">
          <Select value={department} onChange={pickDepartment} options={departments} render={departmentLabel} />
        </Row>
        <Row label="직책">
          <Select value={title} onChange={setTitle} options={titles} render={(t) => titleLabel(t, department)} />
        </Row>

        {handover && (
          <p style={{ margin: '18px 0 0', padding: '12px 14px', fontSize: 'var(--fs-sm)', lineHeight: 1.6, color: 'var(--red-600)', background: 'var(--brand-tint)', border: '1px solid var(--red-100)', borderRadius: 8 }}>
            {MESSAGES.handoverPresident}
          </p>
        )}
        {assign.error && (
          <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>{assign.error.message}</p>
        )}
      </div>

      <PickerFooter
        onBack={onBack}
        onSubmit={submit}
        submitLabel={handover ? '회장 넘기기' : '지정'}
        disabled={!title}
        busy={assign.isPending}
      />
    </>
  );
}

/* ── 조각 ────────────────────────────────────────────────────────────── */

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, render }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer', outline: 'none' }}
    >
      {options.map((o) => <option key={o} value={o}>{render(o)}</option>)}
    </select>
  );
}

export default ExecAssignModal;
```

`useAssignableMembers()` 를 최상위에서 호출하는 것에 주의한다 — 2단계로 넘어가도 훅 호출 순서가 유지되어야 한다(원본은 `PickStep` 안에서 불렀다).

- [ ] **Step 3: 재수출을 더한다**

`views/index.js` 의 `export { ExecAssignModal } …` 줄 위에 추가한다.

```js
export { PickerModal, PickerHeader, MemberPicker, PickerNote, PickerFooter } from './forms/PickerModal';
```

- [ ] **Step 4: 린트와 빌드를 확인한다**

```bash
npm run lint && npm run build
```

Expected: 오류 없음.

- [ ] **Step 5: 임원 지정 모달이 그대로인지 확인한다**

`npm run dev` 로 `/admin/members?tab=exec` 를 열고 **회장 또는 부회장 계정**으로 확인한다(권한이 없으면 버튼 자체가 안 보인다).

- 「임원 지정」 버튼 → 모달이 뜬다. 카드 크기·테두리·상단 빨간 선이 이전과 같다.
- 검색이 동작하고, 회원을 고르면 2단계로 넘어간다.
- 「이전」으로 1단계로 돌아온다. **검색어는 초기화된다** — 원본과 같은 동작이다(`MemberPicker` 가 다시 마운트된다).
- Esc·배경 클릭으로 닫힌다.
- 실제로 한 명을 지정해 토스트가 뜨고 표에 반영되는지 확인한다.

- [ ] **Step 6: 커밋한다**

```bash
git add src/features/admin/views/forms/PickerModal.jsx \
        src/features/admin/views/forms/ExecAssignModal.jsx \
        src/features/admin/views/index.js
git commit -m "refactor(admin): 회원 고르기 모달의 공용 셸을 뽑는다"
```

---

## Task 7: 기여자 후보 조회와 등록 API 를 만든다

**Files:**
- Modify: `home-jaram-fe/src/features/admin/admin.api.js`
- Modify: `home-jaram-fe/src/features/admin/admin.queries.js`

**Interfaces:**
- Consumes: Task 2 의 `fields.contributor` 계약, Task 3 의 행 필드 `contributor`
- Produces:
  - `fetchContribCandidates(): Promise<{ id, name, studentId, gen, faculty, version }[]>`
  - `addContributor({ member }): Promise<AdminBatchResponse>` — `member` 는 `{ id, name, version }` 을 가진 후보 객체
  - `useContribCandidates(options?)` — TanStack Query 결과
  - `useAddContributor(options?)` — `mutate({ member })`
  - `adminKeys.contribCandidates()`

- [ ] **Step 1: `fetchContribCandidates` 를 쓴다**

`admin.api.js` 의 `fetchAssignableMembers` 바로 아래에 추가한다.

```js
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
```

- [ ] **Step 2: `addContributor` 를 쓴다**

`admin.api.js` 의 `assignExec` 바로 아래에 추가한다.

```js
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
```

- [ ] **Step 3: 훅을 더한다**

`admin.queries.js` 의 `adminKeys` 에 추가한다.

```js
  contribCandidates: () => ['admin', 'contribCandidates'],
```

`useAssignExec` 바로 아래에 추가한다.

```js
/** 기여자로 등록할 수 있는 회원 목록 (기여자 추가 모달). */
export function useContribCandidates(options = {}) {
  return useQuery({ queryKey: adminKeys.contribCandidates(), queryFn: api.fetchContribCandidates, ...options });
}

/**
 * 기여자 등록. 성공하면 기여자 목록과 후보 목록을 함께 다시 불러옵니다 —
 * 방금 등록한 회원은 후보에서 빠지고 기여자 표에 나타나야 합니다.
 */
export function useAddContributor(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addContributor,
    ...options,
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list'] });
      qc.invalidateQueries({ queryKey: adminKeys.contribCandidates() });
      qc.invalidateQueries({ queryKey: ['admin', 'member'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(data, vars, ctx);
    },
  });
}
```

- [ ] **Step 4: 린트와 빌드를 확인한다**

```bash
npm run lint && npm run build
```

Expected: 오류 없음. (아직 호출부가 없어 화면 변화는 없다.)

- [ ] **Step 5: 커밋한다**

```bash
git add src/features/admin/admin.api.js src/features/admin/admin.queries.js
git commit -m "feat(admin): 기여자 후보 조회와 등록 경로를 더한다"
```

---

## Task 8: 기여자 추가 모달을 만든다

**Files:**
- Create: `home-jaram-fe/src/features/admin/views/forms/ContribAddModal.jsx`
- Modify: `home-jaram-fe/src/features/admin/views/table/TableView.jsx`
- Modify: `home-jaram-fe/src/features/admin/views/index.js`

**Interfaces:**
- Consumes: Task 6 의 `PickerModal`·`PickerHeader`·`MemberPicker`·`PickerFooter`, Task 7 의 `useContribCandidates`·`useAddContributor`, Task 5 의 `MESSAGES.noContribCandidate`·`TOAST.contribAdded`
- Produces: `ContribAddModal({ onClose, onDone })` — `onDone(message)` 로 토스트 문구를 넘긴다.

- [ ] **Step 1: `ContribAddModal.jsx` 를 만든다**

```jsx
import React from 'react';
import { MESSAGES, TOAST } from '../../admin.data';
import { useAddContributor, useContribCandidates } from '../../admin.queries';
import { PickerModal, PickerHeader, MemberPicker, PickerFooter } from './PickerModal';

/**
 * 기여자 추가 모달 (2단계). 임원 지정 모달과 같은 셸을 씁니다.
 *   1) 아직 기여자가 아닌 회원 목록 — 검색으로 좁힙니다.
 *   2) 고른 회원을 확인하고 등록 — 표의 모아 저장과 달리 즉시 커밋합니다.
 *
 * 임원 지정과 달리 권한 판정이 없습니다. /admin 자체가 임원만 들어오므로
 * 그 안에서는 누구나 기여자를 관리합니다.
 */
export function ContribAddModal({ onClose, onDone }) {
  const [picked, setPicked] = React.useState(null);
  const candidates = useContribCandidates();

  return (
    <PickerModal onClose={onClose}>
      {picked ? (
        <ConfirmStep member={picked} onBack={() => setPicked(null)} onClose={onClose} onDone={onDone} />
      ) : (
        <>
          <PickerHeader eyebrow="CONTRIB" title="기여자 추가" desc="아직 기여자가 아닌 회원 중에서 고르세요." onClose={onClose} />
          <MemberPicker query={candidates} onPick={setPicked} emptyMessage={MESSAGES.noContribCandidate} />
        </>
      )}
    </PickerModal>
  );
}

/* ── 2단계: 확인하고 등록 ───────────────────────────────────────────── */

function ConfirmStep({ member, onBack, onClose, onDone }) {
  const add = useAddContributor({
    onSuccess: () => { onDone(TOAST.contribAdded(member.name)); onClose(); },
  });

  const submit = () => {
    if (add.isPending) return;
    add.mutate({ member });
  };

  return (
    <>
      <PickerHeader eyebrow="CONTRIB" title="기여자로 등록" desc="아래 회원을 기여자 명단에 올립니다." onClose={onClose} />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 20 }}>
        <Row label="이름">{member.name}</Row>
        <Row label="기수">{member.gen || '—'}</Row>
        <Row label="학번">{member.studentId}</Row>
        <Row label="학부">{member.faculty || '—'}</Row>

        <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          등록하면 공개 인원 소개의 기여자 명단에도 함께 오릅니다. 기여자 표에서 언제든 해제할 수 있습니다.
        </p>

        {add.error && (
          <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>{add.error.message}</p>
        )}
      </div>

      <PickerFooter onBack={onBack} onSubmit={submit} submitLabel="기여자로 추가" busy={add.isPending} />
    </>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)' }}>{children}</span>
    </div>
  );
}

export default ContribAddModal;
```

- [ ] **Step 2: `TableView` 에 배선한다**

`TableView.jsx` 를 네 군데 고친다.

import 에 추가 (`import { ExecAssignModal } …` 다음 줄):

```js
import { ContribAddModal } from '../forms/ContribAddModal';
```

`const [assigning, setAssigning] = React.useState(false);` 다음 줄에 추가:

```js
  const [addingContrib, setAddingContrib] = React.useState(false);
```

`onAddRow` 의 임원진 분기 바로 다음에 추가:

```js
    // 기여자도 회원 명부에서 골라 등록한다 — 표에 빈 행을 만드는 게 아니다.
    if (resource === 'contrib') { setAddingContrib(true); return; }
```

`{assigning && ( … )}` 블록 다음에 추가:

```jsx
      {addingContrib && (
        <ContribAddModal
          onClose={() => setAddingContrib(false)}
          onDone={showToast}
        />
      )}
```

- [ ] **Step 3: 재수출을 더한다**

`views/index.js` 의 `export { ExecAssignModal } …` 다음 줄에 추가한다.

```js
export { ContribAddModal } from './forms/ContribAddModal';
```

- [ ] **Step 4: 린트와 빌드를 확인한다**

```bash
npm run lint && npm run build
```

Expected: 오류 없음.

- [ ] **Step 5: 화면에서 확인한다**

`npm run dev` 로 `/admin/members?tab=contrib` 를 연다.

- 「기여자 추가」 버튼 → 모달이 뜨고, **이미 기여자인 회원은 목록에 없다.**
- 졸업생(OB)도 후보 목록에 나온다.
- 검색이 동작한다.
- 회원을 고르면 확인 화면으로 넘어가고 이름·기수·학번·학부가 보인다.
- 「이전」으로 목록으로 돌아간다.
- 「기여자로 추가」 → 토스트가 뜨고 모달이 닫히며, **표에 그 회원이 나타난다.**
- 모달을 다시 열면 방금 등록한 회원이 후보에서 빠져 있다.

- [ ] **Step 6: 커밋한다**

```bash
git add src/features/admin/views/forms/ContribAddModal.jsx \
        src/features/admin/views/table/TableView.jsx \
        src/features/admin/views/index.js
git commit -m "feat(admin): 기여자 추가 모달을 만든다"
```

---

## Task 9: 표에서 기여자를 해제한다

**Files:**
- Modify: `home-jaram-fe/src/features/admin/views/table/EditableCell.jsx` (`actionLabel`)
- Modify: `home-jaram-fe/src/features/admin/views/table/TableView.jsx` (`onAction`)

**Interfaces:**
- Consumes: Task 5 의 `SCHEMAS.contrib` 액션 `'uncontrib'`, 행의 `contributor` 필드; Task 2 의 `fields.contributor` 계약
- Produces: 없음 (마지막 작업)

해제는 전용 API 를 쓰지 않는다. 임원진 탭의 「임기 해제」와 같이 값을 스테이지했다가 하단 저장바가 기존 `saveBatch('contrib', …)` 로 커밋한다.

- [ ] **Step 1: 액션 라벨을 더한다**

`EditableCell.jsx` 의 `actionLabel` 에서 `unassign` 줄 다음에 추가한다.

```js
  if (kind === 'uncontrib') return row.contributor === false ? '해제 취소' : '기여자 해제';
```

`actionStyle` 은 손대지 않는다 — `uncontrib` 는 마지막 `return` 의 중립 스타일을 쓴다.

**`col.actions.filter` 는 손대지 않는다.** `unassign` 만 `canEditRow` 로 거른다. 기여자 관리에는 역할 게이트가 없다(설계서 §범위 밖).

- [ ] **Step 2: `TableView.onAction` 에 분기를 더한다**

`onAction` 의 `else if (kind === 'unassign') { … }` 블록 다음에 추가한다.

```js
    } else if (kind === 'uncontrib') {
      // 기여자 표의 '해제'는 회원 삭제가 아니라 기여자 플래그 내리기다.
      // 이미 내려 둔 행이면 원래 값으로 되돌린다(setEdit 이 편집분을 지운다).
      const orig = origById[row.id] || {};
      setEdit(resource, row.id, 'contributor', row.contributor === false ? orig.contributor : false, orig.contributor);
```

- [ ] **Step 3: 린트와 빌드를 확인한다**

```bash
npm run lint && npm run build
```

Expected: 오류 없음.

- [ ] **Step 4: 화면에서 왕복을 확인한다**

`npm run dev` 로 `/admin/members?tab=contrib` 를 연다.

- 각 행에 「기여자 해제」 버튼이 보인다.
- 누르면 라벨이 「해제 취소」로 바뀌고 하단 저장바에 변경 1건이 뜬다.
- 「해제 취소」를 누르면 저장바가 사라진다(편집분이 지워진다).
- 다시 해제하고 저장 → 토스트가 뜨고 **그 회원이 표에서 빠진다.**
- 「기여자 추가」 모달을 열면 방금 해제한 회원이 후보에 **다시 나타난다.**
- 공개 `/people` 기여자 탭에서도 빠졌는지 확인한다.

- [ ] **Step 5: 자동 등록 왕복을 확인한다**

- `/admin/members?tab=exec` 에서 임원을 한 명 지정한다.
- `/admin/members?tab=contrib` 로 옮기면 **그 회원이 기여자로 들어와 있다.**
- 공개 `/people` 에서는 임원 탭에만 있고 기여자 탭에는 없다(현직이므로).
- `tab=exec` 에서 그 회원의 임기를 해제하고 저장한다.
- 공개 `/people` 기여자 탭에 이제 나타나고, 역할이 「전 …」 으로 보인다.

- [ ] **Step 6: 커밋한다**

```bash
git add src/features/admin/views/table/EditableCell.jsx \
        src/features/admin/views/table/TableView.jsx
git commit -m "feat(admin): 표에서 기여자를 해제한다"
```

---

## 마무리 확인

- [ ] 백엔드 전체 테스트: `cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test` → PASS
- [ ] 프론트: `cd /home/ksb/Dev/home-jaram/home-jaram-fe && npm run lint && npm run build` → 오류 없음
- [ ] 운영 배포 시 `docs/migrations/2026-08-02-contributor-backfill.sql` 을 실행해야 한다는 것을 인수인계한다. 실행하지 않으면 이 변경 이전에 임기를 받은 회원이 기여자 명단에 나오지 않는다.
