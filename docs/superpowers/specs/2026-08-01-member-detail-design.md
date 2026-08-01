# 관리자 인원 관리 — 회원 상세 보기 설계

작성일: 2026-08-01

## 목표

관리자 콘솔 '인원 관리' → '회원' 탭 표의 각 행에 **상세** 버튼을 두고, 누르면
그 회원의 상세 정보가 모달로 뜬다. 조회 전용이다.

## 배경 — 왜 백엔드 작업이 필요한가

표는 이미 `name`·`studentId`·`gen`·`grade`·`status`·`email` 을 보여준다.
관리 목록 응답(`AdminResourceService.memberRow`)이 그 외에 더 주는 것은
`department`·`title`·`approval`·`id`·`version` 뿐이라, 프론트만으로 모달을 만들면
표 대비 새 정보가 사실상 세 개(부서·직책·승인상태)에 그친다.

반면 `Member` 엔티티에는 투영되지 않은 필드가 많다 — `phone`, `faculty`,
`bio`, `githubUrl`, `blogUrl`, `createdAt`, `terms`, `contributor`.
회원 단건을 조회하는 엔드포인트는 없다(`AdminMemberController` 는
`pending`·`approve`·`reject` 만 가진다). `/api/people` 은 `id`·`studentId` 가 없는
공개용 카드라 관리 행과 이어붙일 수 없다.

따라서 **상세 조회 엔드포인트를 새로 만들고** 프론트가 그것을 띄운다.

## 범위

- **이번 스코프:** `GET /api/admin/members/{id}` 신설(+ openapi.yaml 반영),
  프론트 조회 훅, 읽기 전용 상세 모달, '회원' 탭 행의 상세 버튼.
- **범위 밖:**
  - 모달에서의 수정 — 표의 인라인 편집 + 일괄 저장(`version` 낙관적 잠금)이
    이미 유일한 저장 경로다. 모달을 편집 가능하게 하면 저장 경로가 둘이 되고
    같은 행을 양쪽에서 건드렸을 때의 충돌까지 다뤄야 한다. 게다가 수정 가능
    필드는 백엔드 화이트리스트(`name`·`gen`·`grade`·`status`·`approval`·
    `department`·`title`)로 제한되어 있어, 상세에서 새로 보이는 값
    (전화·학부·자기소개 등)은 어차피 고칠 수 없다.
  - 임원진·기여자·졸업생 탭 — 이 탭들의 화면 스키마가 요구하는 필드
    (`position`·`term`, `type`·`contribution`·`link`, `gradYear`·`org`·`job`)가
    백엔드 모델에 존재하지 않는다. 별도 과제다.
  - 상세 화면 딥링크(URL) — 모달은 로컬 상태로만 연다.

## 백엔드 (home-jaram-be)

### 1. DTO `com.jaram.be.admin.dto.MemberDetail`

`Member` 가 이미 가진 값만 투영한다. 새 컬럼·마이그레이션 없음.

```
record MemberDetail(
    String id, String name, String studentId, String email,
    String phone, String faculty,
    Integer gen, MemberGrade grade, MemberStatus status,
    MemberApproval approval, boolean contributor,
    MemberDepartment department, MemberTitle title,
    List<MemberTermResponse> terms,
    String bio, String githubUrl, String blogUrl,
    String createdAt)
```

- enum 은 이름(UPPER_SNAKE)으로 직렬화된다 — 관리 목록 응답과 같은 규약.
- `createdAt` 은 `Instant.toString()`(ISO-8601). `PendingMember` 와 같다.
- `terms` 는 기존 `MemberTermResponse.of` 를 재사용한다. `me`·`people` 이 이미
  쓰는 공용 DTO라 임기 표현이 세 화면에서 같아진다. `endGen == null` 이 현직.
- `department`·`title` 은 `Member` 의 파생 게터(현직 임기 기준)를 그대로 쓴다.

### 2. `AdminMemberService.detail(String id)`

```java
@Transactional(readOnly = true)
public MemberDetail detail(String id) { ... load(id) ... }
```

기존 `load(id)` 헬퍼를 재사용한다 — 없는 id 면
`ApiException(NOT_FOUND, "NOT_FOUND", "회원을 찾을 수 없습니다.")` 를 던진다.

### 3. `AdminMemberController`

```java
@GetMapping("/{id}")
public MemberDetail detail(@PathVariable String id) { return service.detail(id); }
```

- 이미 `@RequestMapping("/api/admin/members")` 라 경로는 `/api/admin/members/{id}`.
- `/pending` 은 리터럴 경로라 Spring 이 `{id}` 보다 먼저 매칭한다 — 충돌 없음.
- `AdminResourceController` 의 `/api/admin/{resource}` 는 한 세그먼트라 무관.
- 권한: `SecurityConfig` 의 `/api/admin/**` → `hasAuthority("OFFICER")` 를 상속하므로
  보안 설정 변경 없음.

### 4. `docs/api/openapi.yaml`

- `paths` 에 `/api/admin/members/{id}` GET 추가 — `tags: [admin]`,
  `security: [{ bearerAuth: [] }]`, 200 `MemberDetail`, 401/403/404/5XX 는 기존
  공용 응답 참조(`Unauthorized`·`Forbidden`·`NotFound`·`ServerError`).
- `components.schemas.MemberDetail` 추가. `terms` 는 기존 `MemberTerm` 스키마 참조.

## 프론트엔드 (home-jaram-fe)

### 1. `admin.api.js`

```js
export async function fetchMemberDetail(id) {
  try {
    const { data } = await client.get(`/api/admin/members/${id}`);
    return fromWire('member', data);
  } catch (error) {
    throwWireError(error, 'NOT_FOUND');
  }
}
```

`fromWire('member', …)` 가 `grade`·`status` 를 한글 라벨로, `gen` 을 `'41기'` 로
바꾼다. `department`·`title`·`terms[]` 는 여기서 변환하지 않는다 — `terms` 는
항목마다 부서가 달라 직책 라벨이 행 단위 맵으로 표현되지 않기 때문에, 렌더
시점에 `@/shared/member/enums` 의 `departmentLabel`/`titleLabel` 로 라벨링한다.
(`titleLabel` 은 백엔드 `MemberTitle.label` 과 같은 규칙을 미러한다.)

### 2. `admin.queries.js`

```js
adminKeys.memberDetail = (id) => ['admin', 'member', id];

export function useMemberDetail(id, options = {}) {
  return useQuery({
    queryKey: adminKeys.memberDetail(id),
    queryFn: () => api.fetchMemberDetail(id),
    enabled: !!id,
    ...options,
  });
}
```

`enabled: !!id` 라 모달이 열릴 때만 요청한다.

### 3. `views/forms/MemberDetailModal.jsx`

`AddRowModal`·`ConfirmDialog` 와 같은 디렉터리·같은 패턴: 고정 백드롭
(`rgba(28,24,19,.55)` + blur, `adm-anim-fade`) + 카드(`adm-anim-pop`,
`surface-card`, 상단 3px 버밀리언 보더). 백드롭 클릭과 ESC 로 닫힌다.
토큰만 사용하고 이모지·그라데이션은 쓰지 않는다.

props: `{ row, onClose }` — `row` 는 표의 행(즉시 표시할 값 + `id`).

구성:

- **헤더** — `MEMBER` 아이라벨(11px, letter-spacing, `--brand`), 이름(세리프 22px),
  메타 줄 `41기 · 수습회원 · 활동`. 기여자면 `기여자` 태그를 덧붙인다.
  헤더 값은 `row` 에서 오므로 로딩 중에도 채워져 있다.
- **본문** — 정의 목록(라벨 좌 / 값 우): 학번, 학부, 연락처, 이메일, 신청일.
  이어서 부서·직책(현직이 있을 때), 자기소개(여러 줄), GitHub·블로그 링크.
  `createdAt` 의 라벨은 **'신청일'** 이다 — 엔티티상 레코드 생성 시각이라
  승인 시점이 아니라 가입 신청 시점이다. 승인일은 저장하는 필드가 없다.
- **임기 이력** — `39기 학술부장 (2024–2025)` 형태의 목록.
  `endGen === null` 인 항목은 `현직` 태그를 단다. 임기가 없으면 절 자체를 생략.
- **값이 없는 필드는 행을 그리지 않는다** — 빈 칸이 줄줄이 남는 것보다 낫다.
- **로딩** — 헤더는 그대로 두고 본문 자리에 스켈레톤.
- **오류** — 본문 자리에 문구 + 닫기 버튼. `error.code === 'NOT_FOUND'` 면
  "회원을 찾을 수 없습니다.", 그 외에는 일반 실패 문구.

### 4. 트리거 배선

- `admin.data.js` — `SCHEMAS.member` 의 `__act` 를
  `actions: ['detail', 'delete']` 로 바꾸고 `width` 를 두 버튼에 맞게 넓힌다.
- `EditableCell.jsx` — `actionLabel` 에 `detail → '상세'`,
  `actionStyle` 에 중립 아웃라인 분기를 추가한다. 기존 확장 지점이라 구조 변경 없음.
- `TableView.jsx` — `const [detailRow, setDetailRow] = useState(null)` 하나,
  `onAction` 에 `kind === 'detail'` 분기, 렌더 끝에 모달 조건부 렌더.
  기존 저장·dirty·삭제 경로는 건드리지 않는다.

## 검증

1. `npx eslint src/features/admin/` · `npm run build` 통과.
2. 백엔드 기동 후 officer 토큰으로
   `GET /api/admin/members/{실재 id}` → 200 + 위 필드,
   `GET /api/admin/members/없는-id` → 404 `{code: "NOT_FOUND"}`,
   `GET /api/admin/members/pending` → 여전히 대기 목록(경로 충돌 없음).
3. 화면: 회원 탭에서 상세 버튼 → 모달에 표에 없던 값(연락처·학부·신청일)이 뜬다.
   빈 필드는 행이 생략된다. ESC·백드롭으로 닫힌다.
4. 회귀: 모달을 열고 닫아도 표의 미저장 편집(dirty)이 유지된다.
