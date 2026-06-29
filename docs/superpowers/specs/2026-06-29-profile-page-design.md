# 프로필 페이지(`/profile`) 설계

작성일: 2026-06-29

## 목표

로그인한 회원이 자신의 개인 정보를 보고, 수정하고, 저장하면 백엔드 DB에
반영되는 `/profile` 페이지를 추가한다. 헤더의 프로필 칩을 누르면 이 페이지로
이동한다(현재 `src/shared/ui/Header.jsx`에 미구현 TODO로 남아 있음).

## 범위

- **수정 가능 필드:** `bio`(자기소개), `githubUrl`, `blogUrl`.
- **읽기 전용 필드:** `name`(이름), `gen`(기수), `email`, `studentId`(학번),
  `authority`(권한).
- **제외:** 비밀번호 변경(이미 `/login`에 재설정 플로우 존재), 프로필 이미지.

## 사용자 경험 (보기 + 수정 토글)

1. 진입 시 `GET /api/me`로 내 정보를 불러와 **읽기 모드** 카드로 표시한다.
2. "수정" 버튼 → **수정 모드**. 읽기 전용 필드는 그대로 표시하고
   `bio`/`githubUrl`/`blogUrl`만 입력 가능한 폼으로 바뀐다.
3. "저장" → `PATCH /api/me` → 성공 시 토스트 + 읽기 모드 복귀.
   "취소" → 입력값을 원래대로 되돌리고 읽기 모드로 복귀.

## 파일 구조

기존 feature 패턴(`login`, `study`, `people`)을 그대로 따른다.

```
src/features/profile/
  ProfilePage.jsx        # 인증 가드 + 보기/수정 모드 상태 관리
  profile.api.js         # getMe(), updateMe(payload)
  profile.queries.js     # useMe(), useUpdateMe()
  profile.validation.js  # isUrl (빈값 허용)
  profile.data.js        # 필드 라벨·안내·메시지 상수
  profile.css            # 페이지 전용 스타일(필요 시)
  useForm.js             # 기존 useForm 헬퍼 복사(다른 feature와 동일 형태)
  views/
    index.js             # 배럴 export
    ProfileView.jsx      # 읽기 모드 카드
    EditView.jsx         # 수정 폼
    parts.jsx            # Eyebrow, FieldRow 등 공용 조각
    Toast.jsx            # 저장 완료 토스트(study/seminar Toast 톤)
```

### 라우팅 / 네비게이션 변경

- `src/App.tsx`: `<Route path="/profile" element={<ProfilePage />} />` 추가.
- `src/shared/ui/Header.jsx`: 로그인 상태의 프로필 칩 `span` →
  `<Link to="/profile">`로 교체(기존 TODO 주석 제거).

## 데이터 계층

### `profile.api.js`

```js
import { client } from '@/shared/api/client';

export async function getMe() {
  const { data } = await client.get('/api/me');
  return data; // MeProfile
}

export async function updateMe(payload) {
  // payload: { bio, githubUrl, blogUrl }
  const { data } = await client.patch('/api/me', payload);
  return data; // MeProfile
}
```

### `profile.queries.js`

- `meKeys = { me: ['me'] }`
- `useMe()` → `useQuery({ queryKey: meKeys.me, queryFn: api.getMe })`
- `useUpdateMe(options)` → `useMutation`으로 `updateMe` 호출, 성공 시
  `qc.invalidateQueries({ queryKey: meKeys.me })` 후 호출부 `onSuccess` 실행.
  (study.queries의 `useInvalidatingMutation`과 같은 패턴.)

### 검증 (`profile.validation.js`)

- `isUrl(x)`: 빈 문자열은 통과(선택 입력), 값이 있으면 `http(s)://` URL만 통과.
- `bio`: 최대 길이 제한(예: 500자) — 초과 시 필드 에러.

## 인증 가드 & 에러 처리

- `ProfilePage`에서 `useAuthStore`의 `isAuthenticated`가 false면
  `<Navigate to="/login" replace />`로 보낸다.
- **401:** 기존 axios 응답 인터셉터가 세션을 clear → 리렌더 시 가드가 `/login`으로.
- **422 (`fieldErrors`):** 응답의 `fieldErrors`를 폼 에러 맵에 매핑(login 페이지 방식).
- **그 외(5xx/네트워크):** 폼 레벨 에러 메시지.
- `name`은 수정 대상이 아니므로 auth store의 `user.name`은 변하지 않는다(동기화 불필요).

## OpenAPI 계약 추가 (`docs/api/openapi.yaml`)

### paths

```yaml
/api/me:
  get:
    summary: 내 정보 조회
    security: [{ bearerAuth: [] }]
    responses:
      '200':
        content:
          application/json:
            schema: { $ref: '#/components/schemas/MeProfile' }
      '401': { $ref: '#/components/responses/Unauthorized' }
      '5XX': { $ref: '#/components/responses/ServerError' }
  patch:
    summary: 내 정보 수정
    security: [{ bearerAuth: [] }]
    requestBody:
      required: true
      content:
        application/json:
          schema: { $ref: '#/components/schemas/MeUpdateRequest' }
    responses:
      '200':
        content:
          application/json:
            schema: { $ref: '#/components/schemas/MeProfile' }
      '401': { $ref: '#/components/responses/Unauthorized' }
      '422': { $ref: '#/components/responses/Validation' }
      '5XX': { $ref: '#/components/responses/ServerError' }
```

### schemas

```yaml
MeProfile:
  type: object
  required: [id, name, email, authority]
  properties:
    id: { type: string }
    name: { type: string }
    studentId: { type: string }
    email: { type: string, format: email }
    authority: { $ref: '#/components/schemas/Authority' }
    gen: { type: [string, 'null'], example: '41기' }
    bio: { type: [string, 'null'] }
    githubUrl: { type: [string, 'null'], format: uri }
    blogUrl: { type: [string, 'null'], format: uri }

MeUpdateRequest:
  type: object
  properties:
    bio: { type: [string, 'null'], maxLength: 500 }
    githubUrl: { type: [string, 'null'], format: uri }
    blogUrl: { type: [string, 'null'], format: uri }
```

## 디자인 (jaram-design)

- 종이 바탕 + 공용 `Header current` 미사용(별도 키 없음, 강조 없음).
- 본문은 `--container-max` 컨테이너, fluid 섹션 패딩.
- 프로필 카드: `Card accent="top"`(3px 빨강 상단 룰), 좌상단 `PROFILE` 아이라벨
  (ALL-CAPS, `--ls-label`). 이름은 `--font-display`, 기수/직책은 `--font-serif`.
- 필드는 헤어라인(`--line`)으로 구분된 행: 라벨(좌, `--text-muted`) + 값(우).
- 수정 모드 입력은 디자인시스템 `Input`, 버튼은 `Button`(저장=primary, 취소=outline).
- 토스트: study/seminar의 `Toast`와 동일 톤.
- 토큰·컴포넌트만 사용. 새 색/여백 임의 추가 금지. 이모지·그라데이션 금지.

## 검증(테스트) 방법

- `profile.validation.js`의 순수 함수는 단위 테스트 가능(있다면 동일 러너 사용).
- 백엔드 미구현이므로 통합 동작은 `/api/me` 목/스텁 또는 백엔드 연동 후 수동 확인.
- 빌드/타입 통과(`.jsx` + 필요한 `.d.ts`) 확인.

## 가정

- 백엔드(Spring) 레포가 `GET/PATCH /api/me`를 본 계약대로 구현한다.
- `MeProfile`은 people 페이지의 `PersonMember`와 필드명을 공유한다(bio/githubUrl/blogUrl/gen).
</content>
</invoke>
