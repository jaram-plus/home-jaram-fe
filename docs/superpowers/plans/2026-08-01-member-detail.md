# 관리자 회원 상세 보기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 콘솔 '인원 관리' → '회원' 탭 각 행에 **상세** 버튼을 달고, 누르면 그 회원의 상세 정보를 조회 전용 모달로 띄운다.

**Architecture:** 백엔드에 `GET /api/admin/members/{id}` 를 신설해 관리 목록이 주지 않는 필드(연락처·학부·자기소개·링크·신청일·임기 이력)를 내려주고, 프론트는 모달이 열릴 때만 그것을 조회한다. 수정 경로는 기존 표 인라인 편집 + 일괄 저장 하나로 유지한다.

**Tech Stack:** Spring Boot(Java 21 record DTO, JUnit5 + RestAssured + Testcontainers), React 19 + TanStack Query v5 + Vite, OpenAPI 3.1 계약.

## Global Constraints

- **두 레포를 함께 수정한다.** 백엔드 `/home/ksb/Dev/home-jaram/home-jaram-be`, 프론트 `/home/ksb/Dev/home-jaram/home-jaram-fe`. 각 레포에서 따로 커밋한다.
- **`openapi.yaml` 은 단일 원본이다.** 실제 파일은 `home-jaram-fe/docs/api/openapi.yaml` 하나뿐이고, 백엔드의 `docs/api/openapi.yaml` 과 `src/test/resources/openapi/openapi.yaml` 은 여기로 향하는 심링크다. **프론트 레포의 파일만 편집하면 백엔드 계약 테스트에 즉시 반영된다.** 심링크를 일반 파일로 덮어쓰지 말 것.
- **UI 는 `src/design-system` 토큰·컴포넌트만 쓴다.** 색·여백·타이포는 `var(--brand)`·`var(--space-5)` 같은 CSS 변수로만. 새 색/여백을 만들지 않는다.
- **보이스: 한국어 · 존댓말. 이모지 금지. 그라데이션 금지.** 라틴 문자는 소문자 대문자 아이라벨로만(`MEMBER`).
- **프론트에는 테스트 러너가 없다.** `package.json` 스크립트는 `dev`·`build`·`preview`·`typecheck`·`lint` 뿐이다. FE 태스크의 검증은 `npx eslint` + `npm run build` + 실제 앱에서의 수동 확인이다. **테스트 프레임워크를 새로 도입하지 말고, 돌릴 수 없는 테스트 단계를 쓰지 말 것.**
- **백엔드 테스트는 Docker 를 쓴다**(Testcontainers Postgres 싱글턴). Docker 가 떠 있어야 한다.
- 커밋 메시지는 한국어 현재형 한 줄 요약(기존 이력과 동일). 끝에 `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## File Structure

**계약 (프론트 레포에 있으나 양쪽이 공유)**
- Modify: `home-jaram-fe/docs/api/openapi.yaml` — `/api/admin/members/{id}` 경로 + `MemberDetail` 스키마

**백엔드 (`home-jaram-be`)**
- Create: `src/main/java/com/jaram/be/admin/dto/MemberDetail.java` — 상세 응답 DTO + `of(Member)` 팩토리
- Modify: `src/main/java/com/jaram/be/admin/AdminMemberService.java` — `detail(String id)` 추가
- Modify: `src/main/java/com/jaram/be/admin/AdminMemberController.java` — `GET /{id}` 추가
- Modify: `src/test/java/com/jaram/be/admin/AdminMemberTest.java` — 동작 테스트
- Modify: `src/test/java/com/jaram/be/contract/AdminContractTest.java` — 계약 테스트

**프론트 (`home-jaram-fe`)**
- Modify: `src/features/admin/admin.api.js` — `fetchMemberDetail(id)`
- Modify: `src/features/admin/admin.queries.js` — `adminKeys.memberDetail`, `useMemberDetail`
- Create: `src/features/admin/views/forms/MemberDetailModal.jsx` — 모달 (조회 전용)
- Modify: `src/features/admin/views/index.js` — 배럴 export
- Modify: `src/features/admin/admin.data.js` — `SCHEMAS.member.__act` 에 `detail` 액션
- Modify: `src/features/admin/views/table/EditableCell.jsx` — `detail` 라벨·스타일
- Modify: `src/features/admin/views/table/TableView.jsx` — 상태 + 모달 렌더

---

### Task 1: openapi 계약에 상세 엔드포인트 추가

계약을 먼저 확정한다. 이 태스크만으로는 서버 동작이 바뀌지 않는다 — 검증은 "스펙이 여전히 파싱되고 기존 계약 테스트가 깨지지 않는다"이다.

**Files:**
- Modify: `home-jaram-fe/docs/api/openapi.yaml` (경로는 `/api/admin/members/{id}/reject` 블록 다음, `# ── admin (management surface) ──` 주석 앞. 스키마는 `PendingMember`(1429행 부근) 다음)

**Interfaces:**
- Consumes: 기존 `#/components/parameters/MemberId`, `#/components/schemas/{MemberGrade,MemberStatus,MemberApproval,MemberDepartment,MemberTitle,MemberTerm}`, `#/components/responses/{Unauthorized,Forbidden,NotFound,ServerError}`
- Produces: `#/components/schemas/MemberDetail` — Task 2 의 Java DTO 와 Task 3 의 FE 조회가 이 모양을 따른다

- [ ] **Step 1: 경로 추가**

`/api/admin/members/{id}/reject` 블록 바로 뒤에 넣는다. `MemberId` 파라미터는 approve/reject 가 이미 쓰는 것을 그대로 재사용한다.

```yaml
  /api/admin/members/{id}:
    get:
      tags: [admin]
      summary: 회원 상세 조회
      description: >
        admin 「인원 관리」 회원 탭 상세 모달의 소스. 관리 목록(AdminListResponse)이 주지 않는
        연락처·학부·자기소개·링크·신청일·임기 이력까지 반환한다. 조회 전용이며, 수정은
        {resource}:batch 로만 한다.
      security: [{ bearerAuth: [] }]
      parameters:
        - $ref: '#/components/parameters/MemberId'
      responses:
        '200':
          description: 회원 상세
          content:
            application/json:
              schema: { $ref: '#/components/schemas/MemberDetail' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '5XX': { $ref: '#/components/responses/ServerError' }
```

- [ ] **Step 2: 빠져 있는 `MemberApproval` enum 스키마를 먼저 추가한다**

**이 스펙에는 `MemberApproval` 스키마가 없다**(`MemberGrade`·`MemberStatus`·`MemberDepartment`·`MemberTitle` 만 있다). 다음 스텝의 `$ref` 가 매달린 참조가 되어 스펙 전체가 깨지므로 먼저 만든다. `MemberStatus` 정의 바로 뒤(1027행 부근)에 넣는다.

```yaml
    MemberApproval:
      type: string
      description: 가입 승인 상태(활동축 MemberStatus와 별개). 가입 시 PENDING, admin이 승인/반려한다.
      enum: [PENDING, APPROVED, REJECTED]
```

- [ ] **Step 3: 스키마 추가**

`PendingMember` 스키마 정의 바로 뒤, `# ── admin (management surface) ──` 주석 앞에 넣는다.

**중요 — nullable enum 표기:** `grade`·`status`·`department`·`title` 은 회원에 따라 null 이다(임기 없는 일반 회원은 department·title 이 null). 여기서는 `MeProfile` 과 **똑같이** 맨 `$ref` 로 적는다. `MeContractTest` 가 임기·전화·학부가 전부 null 인 회원으로 `/api/me` 를 통과시키고 있어, 이 검증기가 `$ref` enum 의 null 을 허용한다는 것이 이미 증명되어 있다. `oneOf` 로 감싸지 말 것 — 기존 스키마와 표기가 어긋난다.

```yaml
    MemberDetail:
      type: object
      description: >
        admin 회원 상세(조회 전용). 관리 목록 행보다 넓은 표현이다.
        createdAt 은 레코드 생성 시각 — 승인 시점이 아니라 가입 신청 시점이다.
      required: [id, name, studentId, email, approval, contributor, terms, createdAt]
      properties:
        id: { type: string }
        name: { type: string }
        studentId: { type: string }
        email: { type: string, format: email }
        phone: { type: [string, 'null'], example: 010-1234-5678 }
        faculty: { type: [string, 'null'], example: 컴퓨터학부 }
        gen: { type: [integer, 'null'], example: 41 }
        grade: { $ref: '#/components/schemas/MemberGrade' }
        status: { $ref: '#/components/schemas/MemberStatus' }
        approval: { $ref: '#/components/schemas/MemberApproval' }
        contributor: { type: boolean, description: 기여자 등록 여부 }
        department: { $ref: '#/components/schemas/MemberDepartment' }
        title: { $ref: '#/components/schemas/MemberTitle' }
        terms:
          type: array
          description: 임기 이력(오래된 순 startGen ASC). 임기가 없으면 빈 배열.
          items: { $ref: '#/components/schemas/MemberTerm' }
        bio: { type: [string, 'null'] }
        githubUrl: { type: [string, 'null'], format: uri }
        blogUrl: { type: [string, 'null'], format: uri }
        createdAt: { type: string, format: date-time, description: 가입 신청 시각 }
```

- [ ] **Step 4: 심링크가 살아있는지 + YAML 이 파싱되는지 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
ls -la docs/api/openapi.yaml src/test/resources/openapi/openapi.yaml
python3 -c "
import yaml
d = yaml.safe_load(open('src/test/resources/openapi/openapi.yaml'))
s = d['components']['schemas']
print('path:', '/api/admin/members/{id}' in d['paths'])
print('MemberDetail:', 'MemberDetail' in s)
print('MemberApproval:', 'MemberApproval' in s)
missing = [r for r in ('MemberGrade','MemberStatus','MemberApproval','MemberDepartment','MemberTitle','MemberTerm') if r not in s]
print('매달린 참조:', missing or '없음')
"
```

기대: 두 경로 모두 `->` 심링크로 남아 있고, 앞의 세 줄이 모두 `True`, `매달린 참조: 없음`.

- [ ] **Step 5: 기존 계약 테스트가 깨지지 않았는지 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test --tests '*ContractTest' -q
```

기대: PASS (이 시점엔 새 엔드포인트를 아무도 호출하지 않는다).

- [ ] **Step 6: 커밋 (프론트 레포에서)**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe
git add docs/api/openapi.yaml
git commit -m "$(cat <<'EOF'
docs(api): 회원 상세 조회 계약을 추가한다

GET /api/admin/members/{id} 와 MemberDetail 스키마. 관리 목록이 주지 않는
연락처·학부·자기소개·링크·신청일·임기 이력을 담는다. nullable enum 표기는
MeProfile 관례를 그대로 따른다. 참조만 되고 정의가 없던 MemberApproval
enum 도 함께 채운다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 백엔드 상세 엔드포인트 (TDD)

**Files:**
- Create: `home-jaram-be/src/main/java/com/jaram/be/admin/dto/MemberDetail.java`
- Modify: `home-jaram-be/src/main/java/com/jaram/be/admin/AdminMemberService.java`
- Modify: `home-jaram-be/src/main/java/com/jaram/be/admin/AdminMemberController.java`
- Test: `home-jaram-be/src/test/java/com/jaram/be/admin/AdminMemberTest.java`
- Test: `home-jaram-be/src/test/java/com/jaram/be/contract/AdminContractTest.java`

**Interfaces:**
- Consumes: Task 1 의 `MemberDetail` 스키마. 기존 `AdminMemberService.load(String id)`(private, 없으면 `ApiException(NOT_FOUND, "NOT_FOUND", "회원을 찾을 수 없습니다.")`), `MemberTermResponse.of(MemberTerm)`
- Produces: `MemberDetail.of(Member)` 정적 팩토리, `AdminMemberService.detail(String id) → MemberDetail`, `GET /api/admin/members/{id}`

- [ ] **Step 1: 실패하는 동작 테스트를 쓴다**

`AdminMemberTest.java` 의 마지막 `}` 앞에 추가한다. 기존 `pending(...)` 헬퍼를 재사용하고, 임기 없는 회원(대다수 경우)을 포함해 null 필드를 함께 검증한다.

```java
    @Test
    void officerReadsMemberDetail() {
        Member m = pending("detail@hanyang.ac.kr", "2023022222");
        m.setApproval(MemberApproval.APPROVED);
        m.setGrade(MemberGrade.ASSOCIATE);
        m.setGen(41);
        m.setPhone("010-1234-5678");
        m.setFaculty("컴퓨터학부");
        members.save(m);

        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members/" + m.getId())
                .then().statusCode(200)
                .body("id", equalTo(m.getId()))
                .body("studentId", equalTo("2023022222"))
                .body("phone", equalTo("010-1234-5678"))
                .body("faculty", equalTo("컴퓨터학부"))
                .body("grade", equalTo("ASSOCIATE"))
                .body("approval", equalTo("APPROVED"))
                .body("contributor", equalTo(false))
                .body("department", nullValue())
                .body("title", nullValue())
                .body("terms", hasSize(0))
                .body("createdAt", notNullValue());
    }

    @Test
    void memberDetailReturns404ForUnknownId() {
        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members/does-not-exist")
                .then().statusCode(404).body("code", equalTo("NOT_FOUND"));
    }

    @Test
    void pendingPathStillResolvesAfterAddingIdRoute() {
        pending("stillwaiting@hanyang.ac.kr", "2023033333");

        given().header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members/pending")
                .then().statusCode(200).body("size()", equalTo(1))
                .body("[0].email", equalTo("stillwaiting@hanyang.ac.kr"));
    }
```

세 번째 테스트가 중요하다 — `/pending` 이 리터럴이라 `{id}` 보다 먼저 매칭되는지를 못박는다.

- [ ] **Step 2: 실패하는지 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test --tests '*AdminMemberTest*' -q
```

기대: FAIL. `officerReadsMemberDetail` 과 `memberDetailReturns404ForUnknownId` 가 404/405 등으로 깨진다(핸들러가 없다). `pendingPathStillResolvesAfterAddingIdRoute` 는 이미 PASS.

- [ ] **Step 3: `MemberDetail` DTO 를 만든다**

`src/main/java/com/jaram/be/admin/dto/MemberDetail.java`:

```java
package com.jaram.be.admin.dto;

import com.jaram.be.member.Member;
import com.jaram.be.member.MemberApproval;
import com.jaram.be.member.MemberDepartment;
import com.jaram.be.member.MemberGrade;
import com.jaram.be.member.MemberStatus;
import com.jaram.be.member.MemberTerm;
import com.jaram.be.member.MemberTitle;
import com.jaram.be.member.dto.MemberTermResponse;

import java.util.Comparator;
import java.util.List;

/**
 * 계약 MemberDetail. admin 회원 상세(조회 전용) — 관리 목록 행(AdminResourceService.memberRow)
 * 보다 넓은 표현이다. createdAt 은 레코드 생성 시각이라 승인 시점이 아니라 가입 신청 시점이다.
 * department·title 은 현직 임기에서 파생되므로 임기가 없으면 null 이다.
 */
public record MemberDetail(
        String id,
        String name,
        String studentId,
        String email,
        String phone,
        String faculty,
        Integer gen,
        MemberGrade grade,
        MemberStatus status,
        MemberApproval approval,
        boolean contributor,
        MemberDepartment department,
        MemberTitle title,
        List<MemberTermResponse> terms,
        String bio,
        String githubUrl,
        String blogUrl,
        String createdAt) {

    /** 지연 로딩되는 terms 를 건드리므로 반드시 트랜잭션 안에서 호출한다. */
    public static MemberDetail of(Member m) {
        return new MemberDetail(
                m.getId(), m.getName(), m.getStudentId(), m.getEmail(),
                m.getPhone(), m.getFaculty(), m.getGen(),
                m.getGrade(), m.getStatus(), m.getApproval(), m.isContributor(),
                m.getDepartment(), m.getTitle(),
                m.getTerms().stream()
                        .sorted(Comparator.comparingInt(MemberTerm::getStartGen))
                        .map(MemberTermResponse::of)
                        .toList(),
                m.getBio(), m.getGithubUrl(), m.getBlogUrl(),
                m.getCreatedAt().toString());
    }
}
```

`sorted(...)` 는 계약의 "오래된 순(startGen ASC)"을 지키기 위한 것이다.

- [ ] **Step 4: 서비스에 `detail` 을 더한다**

`AdminMemberService.java` — `listPending()` 바로 뒤에 넣는다. import 에 `com.jaram.be.admin.dto.MemberDetail` 추가.

```java
    @Transactional(readOnly = true)
    public MemberDetail detail(String id) {
        return MemberDetail.of(load(id));
    }
```

`load(id)` 는 이미 파일 하단에 있는 private 헬퍼다 — 없는 id 면 `ApiException(NOT_FOUND, …)` 를 던진다. 새로 만들지 말 것.

- [ ] **Step 5: 컨트롤러에 경로를 더한다**

`AdminMemberController.java` — `pending()` 뒤에 넣는다. import 에 `com.jaram.be.admin.dto.MemberDetail` 추가.

```java
    @GetMapping("/{id}")
    public MemberDetail detail(@PathVariable String id) { return service.detail(id); }
```

클래스에 이미 `@RequestMapping("/api/admin/members")` 가 있으므로 최종 경로는 `/api/admin/members/{id}` 다. `SecurityConfig` 의 `/api/admin/**` → `hasAuthority("OFFICER")` 를 상속하니 보안 설정은 건드리지 않는다.

- [ ] **Step 6: 동작 테스트가 통과하는지 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test --tests '*AdminMemberTest*' -q
```

기대: PASS (세 테스트 모두).

- [ ] **Step 7: 계약 테스트를 쓴다**

`AdminContractTest.java` 의 마지막 `}` 앞에 추가한다. 기존 `approved(...)` 헬퍼를 쓴다 — 임기가 없어 department·title 이 null 인 회원이라 nullable 표기까지 함께 검증된다.

```java
    @Test
    void memberDetailMatchesContract() {
        Member m = approved("김자람", "2023000001");
        given().filter(validation)
                .header("Authorization", "Bearer " + officerToken)
                .when().get("/api/admin/members/" + m.getId())
                .then().statusCode(200);
    }
```

- [ ] **Step 8: 계약 테스트가 통과하는지 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test --tests '*AdminContractTest*' -q
```

기대: PASS. 실패하면 응답 JSON 과 Task 1 스키마가 어긋난 것이다 — 검증기 메시지가 어느 필드인지 짚어준다.

- [ ] **Step 9: admin 전체 스위트로 회귀 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be && ./gradlew test --tests 'com.jaram.be.admin.*' --tests 'com.jaram.be.contract.*' -q
```

기대: PASS. 특히 `AdminResourceTest`(목록·배치)와 `AdminMemberAssignmentTest`(임기 배정)가 새 경로에 영향받지 않았음을 확인한다.

- [ ] **Step 10: 커밋 (백엔드 레포에서)**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-be
git add src/main/java/com/jaram/be/admin/dto/MemberDetail.java \
        src/main/java/com/jaram/be/admin/AdminMemberService.java \
        src/main/java/com/jaram/be/admin/AdminMemberController.java \
        src/test/java/com/jaram/be/admin/AdminMemberTest.java \
        src/test/java/com/jaram/be/contract/AdminContractTest.java
git commit -m "$(cat <<'EOF'
feat(admin): 회원 상세 조회 엔드포인트를 연다

GET /api/admin/members/{id} — 관리 목록이 주지 않는 연락처·학부·자기소개·
링크·신청일·임기 이력을 반환한다. 임기는 startGen 오름차순. /pending 이
리터럴이라 {id} 보다 먼저 매칭되는 것도 테스트로 못박는다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 프론트 조회 계층

**Files:**
- Modify: `home-jaram-fe/src/features/admin/admin.api.js`
- Modify: `home-jaram-fe/src/features/admin/admin.queries.js`

**Interfaces:**
- Consumes: Task 2 의 `GET /api/admin/members/{id}`. 기존 `client`, `fromWire(resource, row)`, `throwWireError(error, fallbackCode)`
- Produces: `fetchMemberDetail(id)` — 라벨링된 상세 객체를 반환. `useMemberDetail(id, options)` — `{ data, isLoading, error }`. `adminKeys.memberDetail(id)`

- [ ] **Step 1: `admin.api.js` 에 조회 함수를 더한다**

`fetchMemberDetail` 을 `fetchMembers` 바로 뒤에 놓는다(회원 관련 조회를 붙여 둔다).

```js
/**
 * 회원 상세 (GET /api/admin/members/{id}). 조회 전용 — 수정은 표의 일괄 저장이 유일한 경로다.
 * grade·status·gen 은 fromWire 로 화면 라벨이 되지만, department·title·terms[] 는
 * 항목마다 부서가 달라 라벨이 (부서, 직책) 조합으로 파생되므로 렌더 시점에 titleLabel 로 처리한다.
 */
export async function fetchMemberDetail(id) {
  try {
    const { data } = await client.get(`/api/admin/members/${id}`);
    return fromWire('member', data);
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
```

- [ ] **Step 2: `admin.queries.js` 에 쿼리키와 훅을 더한다**

`adminKeys` 에 한 줄 추가:

```js
  memberDetail: (id) => ['admin', 'member', id],
```

그리고 `useDashboardStats` 앞에 훅을 추가:

```js
/** 회원 상세. 모달이 열려 id 가 있을 때만 조회한다. */
export function useMemberDetail(id, options = {}) {
  return useQuery({
    queryKey: adminKeys.memberDetail(id),
    queryFn: () => api.fetchMemberDetail(id),
    enabled: !!id,
    ...options,
  });
}
```

- [ ] **Step 3: lint + build 로 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe && npx eslint src/features/admin/ && npm run build
```

기대: eslint 출력 없음, `✓ built`.

- [ ] **Step 4: 커밋**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe
git add src/features/admin/admin.api.js src/features/admin/admin.queries.js
git commit -m "$(cat <<'EOF'
feat(admin): 회원 상세 조회 계층을 더한다

fetchMemberDetail + useMemberDetail. 모달이 열릴 때만(enabled) 조회한다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 상세 모달 컴포넌트

**Files:**
- Create: `home-jaram-fe/src/features/admin/views/forms/MemberDetailModal.jsx`
- Modify: `home-jaram-fe/src/features/admin/views/index.js`

**Interfaces:**
- Consumes: Task 3 의 `useMemberDetail(id)`. 기존 `Tag`(`@/design-system`), `departmentLabel`/`titleLabel`(`@/shared/member/enums`), CSS 클래스 `adm-anim-fade`·`adm-anim-pop`(`admin.css`)
- Produces: `<MemberDetailModal row={row} onClose={fn} />` — `row` 는 표의 행 객체(최소 `id`·`name`·`gen`·`grade`·`status`). Task 5 가 이 시그니처로 렌더한다.

**임기 표기 주의:** `MemberTerm` 의 `startGen`/`endGen` 은 **기수**이지 연도가 아니다(설계 문서의 예시 `(2024–2025)` 는 연도처럼 보이나 잘못된 예시다). `39–41기 학술부장` 형태로 적고, `endGen === null` 이면 현직이다.

- [ ] **Step 1: 모달 컴포넌트를 만든다**

`AddRowModal`·`ConfirmDialog` 와 같은 백드롭·카드 구조를 따른다(같은 디렉터리, 같은 `adm-anim-*` 클래스, 같은 토큰).

```jsx
import React from 'react';
import { Tag } from '@/design-system';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import { useMemberDetail } from '../../admin.queries';

/**
 * 회원 상세 모달 (조회 전용). 표의 행으로 헤더를 즉시 그리고 나머지는
 * GET /api/admin/members/{id} 로 채웁니다. 값이 없는 항목은 줄 자체를 생략합니다.
 * 수정은 표의 인라인 편집 + 일괄 저장이 유일한 경로라 여기서는 아무것도 바꾸지 않습니다.
 */
export function MemberDetailModal({ row, onClose }) {
  const { data, isLoading, error } = useMemberDetail(row?.id);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const meta = [row?.gen, row?.grade, row?.status].filter(Boolean).join(' · ');
  const dept = departmentLabel(data?.department);
  const position = titleLabel(data?.title, data?.department);

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>MEMBER</p>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-strong)' }}>{row?.name}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              {meta}
              {data?.contributor && <span style={{ marginLeft: 8 }}><Tag tone="neutral">기여자</Tag></span>}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginTop: 22 }}>
          {isLoading && <Skeleton />}
          {error && (
            <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>
              {error.code === 'NOT_FOUND' ? '회원을 찾을 수 없습니다.' : '상세 정보를 불러오지 못했습니다.'}
            </p>
          )}
          {data && (
            <>
              <Field label="학번">{data.studentId}</Field>
              <Field label="학부">{data.faculty}</Field>
              <Field label="연락처">{data.phone}</Field>
              <Field label="이메일">{data.email}</Field>
              <Field label="신청일">{(data.createdAt || '').slice(0, 10)}</Field>
              <Field label="부서">{dept}</Field>
              <Field label="직책">{position}</Field>
              <Field label="자기소개">{data.bio}</Field>
              <Field label="GitHub"><Link href={data.githubUrl} /></Field>
              <Field label="블로그"><Link href={data.blogUrl} /></Field>
              <Terms terms={data.terms} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** 값이 비면 줄 자체를 그리지 않습니다 — 빈 칸이 줄줄이 남는 것보다 낫습니다. */
function Field({ label, children }) {
  const empty = children == null || children === '' || children === false;
  if (empty) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{children}</span>
    </div>
  );
}

function Link({ href }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-deep)' }}>{href}</a>;
}

/** 임기 이력. startGen·endGen 은 기수다(연도 아님). endGen 이 null 이면 현직. */
function Terms({ terms }) {
  if (!terms || terms.length === 0) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.14em', color: 'var(--text-faint)' }}>TERMS</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {terms.map((t, i) => (
          <li key={`${t.startGen}-${t.title}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{genRange(t)}</span>
            <span>{titleLabel(t.title, t.department)}</span>
            {t.endGen == null && <Tag tone="brand">현직</Tag>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function genRange(t) {
  if (t.endGen == null) return `${t.startGen}기~`;
  return t.startGen === t.endGen ? `${t.startGen}기` : `${t.startGen}–${t.endGen}기`;
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 14, borderRadius: 4, background: 'var(--surface-sunken)' }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 배럴에 export 를 더한다**

`src/features/admin/views/index.js` 의 `export { ConfirmDialog } from './forms/ConfirmDialog';` 바로 뒤:

```js
export { MemberDetailModal } from './forms/MemberDetailModal';
```

- [ ] **Step 3: lint + build 로 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe && npx eslint src/features/admin/ && npm run build
```

기대: eslint 출력 없음, `✓ built`. (이 시점엔 아직 아무도 모달을 렌더하지 않는다 — 컴파일만 확인한다.)

- [ ] **Step 4: 커밋**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe
git add src/features/admin/views/forms/MemberDetailModal.jsx src/features/admin/views/index.js
git commit -m "$(cat <<'EOF'
feat(admin): 회원 상세 모달을 만든다

조회 전용. 값이 없는 항목은 줄을 생략하고, 임기는 기수 범위로 적으며
endGen 이 null 이면 현직 태그를 답니다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 상세 버튼 배선 + 통합 확인

**Files:**
- Modify: `home-jaram-fe/src/features/admin/admin.data.js` (`SCHEMAS.member` 의 `__act` 컬럼)
- Modify: `home-jaram-fe/src/features/admin/views/table/EditableCell.jsx` (`actionLabel`, `actionStyle`)
- Modify: `home-jaram-fe/src/features/admin/views/table/TableView.jsx`

**Interfaces:**
- Consumes: Task 4 의 `<MemberDetailModal row={row} onClose={fn} />`. 기존 `onAction(kind, row)` 배선
- Produces: 없음 (최종 통합)

- [ ] **Step 1: 스키마에 액션을 더한다**

`admin.data.js` 의 `SCHEMAS.member.cols` 마지막 항목을 바꾼다. 버튼이 둘이 되므로 폭을 넓힌다.

```js
      { key: '__act', label: '', type: 'actions', width: '1fr', align: 'center', actions: ['detail', 'delete'] },
```

- [ ] **Step 2: `EditableCell` 에 라벨·스타일을 더한다**

`actionLabel` 의 `if (kind === 'approve')` 앞에:

```js
  if (kind === 'detail') return '상세';
```

`actionStyle` 의 `if (kind === 'approve')` 앞에:

```js
  if (kind === 'detail') return { ...base, background: 'transparent', color: 'var(--text-body)', border: '1px solid var(--border-strong)' };
```

- [ ] **Step 3: `TableView` 에 상태와 렌더를 더한다**

이 파일은 형제 모듈을 배럴이 아니라 직접 상대경로로 가져온다(`import { ConfirmDialog } from '../forms/ConfirmDialog';`). 같은 방식으로, 그 줄 바로 뒤에 추가한다:

```js
import { MemberDetailModal } from '../forms/MemberDetailModal';
```

`graduating` state 선언 근처에:

```js
  const [detailRow, setDetailRow] = React.useState(null);
```

`onAction` 의 분기 사슬에 (`approve` 분기 앞) 추가:

```js
    } else if (kind === 'detail') {
      setDetailRow(row);
```

컴포넌트 반환부 끝, 다른 모달들이 렌더되는 곳 옆에:

```jsx
      {detailRow && <MemberDetailModal row={detailRow} onClose={() => setDetailRow(null)} />}
```

- [ ] **Step 4: lint + build 로 확인**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe && npx eslint src/features/admin/ && npm run build
```

기대: eslint 출력 없음, `✓ built`.

- [ ] **Step 5: 실제 앱에서 수동으로 확인한다**

프론트에는 테스트 러너가 없으므로 이 단계가 실질 검증이다. 백엔드를 띄우고(`cd ../home-jaram-be && ./gradlew bootRun`), 프론트를 띄운 뒤(`npm run dev`), **운영진 계정으로 로그인**해 `/admin/members` 로 간다.

확인 목록:

1. 각 행 오른쪽에 `상세`·`삭제` 두 버튼이 있고 폭이 깨지지 않는다.
2. `상세` 를 누르면 모달이 열리고, 헤더(이름·기수·등급·상태)가 **즉시** 보인다(행 데이터라 요청을 기다리지 않는다).
3. 응답이 오면 표에 없던 값 — **연락처·학부·신청일** — 이 채워진다.
4. 값이 비어 있는 항목은 라벨만 남지 않고 줄 전체가 사라진다.
5. 임원 이력이 있는 회원은 `TERMS` 절에 `39–40기 학술부장` 같은 줄이 뜨고, 현직이면 `현직` 태그가 붙는다. 이력이 없으면 절 자체가 없다.
6. ESC 와 백드롭 클릭으로 닫힌다. `×` 로도 닫힌다.
7. **회귀:** 셀을 하나 고쳐 dirty 상태를 만든 뒤 모달을 열었다 닫아도 미저장 변경이 그대로 남아 있고, 하단 저장 바의 건수가 변하지 않는다.
8. **회귀:** 다른 탭(임원진·기여자·졸업생)과 세미나·스터디 표에는 `상세` 버튼이 생기지 않는다(`SCHEMAS.member` 만 건드렸다).

- [ ] **Step 6: 커밋**

```bash
cd /home/ksb/Dev/home-jaram/home-jaram-fe
git add src/features/admin/admin.data.js \
        src/features/admin/views/table/EditableCell.jsx \
        src/features/admin/views/table/TableView.jsx
git commit -m "$(cat <<'EOF'
feat(admin): 회원 표에서 상세 보기를 연다

회원 탭 행의 액션에 '상세'를 더해 조회 전용 모달을 띄운다. 표의 편집·저장
경로는 건드리지 않는다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## 범위 밖 (이 계획에서 다루지 않음)

- 모달에서의 수정 — 표의 인라인 편집 + 일괄 저장이 유일한 저장 경로로 남는다.
- `approval` 은 `MemberDetail` 에 담기지만 **모달에서 렌더하지 않는다.** 회원 탭은 `APPROVED` 만 보여주므로 항상 같은 값이라 화면에 무의미하다. 리소스 표현으로서는 유지한다.
- 임원진·기여자·졸업생 탭 — 화면 스키마가 요구하는 필드(`position`·`term`, `type`·`contribution`·`link`, `gradYear`·`org`·`job`)가 백엔드 모델에 없다. 별도 과제.
- 상세 화면 딥링크(URL) — 모달은 로컬 상태로만 연다.
