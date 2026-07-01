# JARAM 프론트엔드 개발 가이드

한양대 ERICA 컴퓨터학회 JARAM(자람) 웹 프론트엔드. 새 기능을 **기존 패턴 복붙 → 최소 수정**으로 붙일 수 있도록 구조·스택·관례를 정리한 문서.

> 브랜드/디자인 규칙은 이 문서 범위 밖. `CLAUDE.md`와 `.claude/skills/jaram-design/readme.md` 참조.

---

## 1. 기술 스택

| 영역 | 채택 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.2 |
| 언어 | JavaScript(`.jsx`) + TypeScript(엔트리·설정) | TS 5 |
| 번들러 | Vite | 7 |
| 라우팅 | react-router-dom | 7 |
| 서버 상태 | @tanstack/react-query | 5 |
| 클라이언트 전역 상태 | zustand (+ persist) | 5 |
| HTTP | axios | 1 |
| 폼 | react-hook-form + @hookform/resolvers | 7 / 5 |
| 스키마 검증 | zod | 4 |
| 스타일 | 디자인 시스템(인라인 스타일 + CSS 변수 토큰). tailwind는 devDep에 있으나 UI 규칙상 토큰만 사용 |
| 패키지 매니저 | pnpm (`pnpm-lock.yaml`) |

**엔트리**: `index.html` → `src/main.tsx` → `src/App.tsx`. 컴포넌트 본문은 `.jsx`, 앱 뼈대·설정만 `.tsx`.

### 스크립트
```bash
pnpm dev        # vite 개발 서버
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 결과 미리보기
pnpm typecheck  # tsc --noEmit (allowJs=true, strict)
pnpm lint       # eslint
```

### 설정 요점
- **경로 alias**: `@/* → src/*` (vite.config.ts + tsconfig.json 양쪽 등록). import는 항상 `@/...` 사용.
- **tsconfig**: `allowJs`, `strict`, `noEmit`, `jsx: react-jsx`, `moduleResolution: bundler`.
- **환경변수**: `VITE_API_BASE_URL` (미설정 시 `http://localhost:8080`). `.env.example` 참조.

---

## 2. 디렉터리 구조

```
src/
├─ main.tsx / App.tsx      # 엔트리 + 라우트 테이블
├─ app/                    # 전역 CSS(globals.css), favicon
├─ design-system/          # UI 토큰 + 공용 컴포넌트 (barrel: '@/design-system')
│  ├─ tokens/*.css         # colors·spacing·typography·fonts·effects
│  ├─ components/{core,forms,people}/
│  └─ assets/{logos,images,companies}/
├─ shared/                 # 기능 횡단 모듈
│  ├─ api/client.js        # axios 인스턴스 + 인터셉터
│  ├─ api/QueryProvider.jsx# react-query Provider
│  ├─ auth/auth.store.js   # zustand 인증 스토어 (persist)
│  ├─ member/enums.js      # 부서·직책 enum ↔ 한글 라벨
│  ├─ club/founding.js     # 창립연도 파생값(연차·기수·한글수사)
│  └─ ui/Header.jsx        # 공용 헤더
└─ features/               # 페이지 단위 기능 (아래 §4)
   ├─ landing/  login/  people/
   ├─ seminar/  study/  profile/  admin/
```

**설계 원칙**: feature-sliced. 페이지별로 폴더 하나. 기능 간 공유가 필요하면 `shared/` 또는 `design-system/`으로 올린다.

---

## 3. 라우팅

`src/App.tsx`의 단일 `<Routes>` 테이블에서 관리.

| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | LandingPage | |
| `/login` | LoginPage | |
| `/apply` | LoginPage | `initialView="signup"` prop |
| `/people` | PeoplePage | |
| `/seminar` | SeminarPage | |
| `/study` | StudyPage | |
| `/admin` | AdminPage | |
| `/profile` | ProfilePage | |

새 페이지 추가 = feature 폴더 만들고 `App.tsx`에 `<Route>` 한 줄 추가.

---

## 4. Feature 폴더 관례 (핵심)

각 feature는 **일관된 파일 세트**로 구성. 새 기능은 가장 가까운 기존 feature(예: `seminar`)를 통째로 복사해 시작하는 게 가장 싸다.

```
features/<name>/
├─ <Name>Page.jsx          # 라우트 진입 컴포넌트. 상태 오케스트레이션 + view 조립
├─ <name>.api.js           # axios 호출 함수 (client 사용). 폼→DTO 정제, 실패 계약
├─ <name>.queries.js       # react-query 훅 (useXxx) + queryKeys 객체
├─ <name>.data.js          # 정적 문구/상수/MESSAGES
├─ <name>.assets.js        # 이미지·아이콘 import 모음
├─ <name>.css              # 페이지 전용 스타일
├─ <name>.validation.js    # zod 스키마 (폼 있는 경우)
├─ useForm.js              # react-hook-form 래퍼 (폼 있는 경우)
└─ views/                  # 프레젠테이션 조각
   ├─ index.js             # barrel export
   ├─ parts.jsx            # 작은 공용 조각
   ├─ <Xxx>View.jsx        # 화면 상태별 뷰
   ├─ <Xxx>Modal.jsx       # 모달 (ModalShell 위)
   ├─ <Xxx>Card.jsx        # 카드
   └─ Toast.jsx            # 토스트
```

파일 전부가 항상 있는 건 아님. 폼·모달 없으면 해당 파일 생략(예: `people`은 폼 파일 없음).

### 계층 책임
- **Page**: react-query 훅 호출 → 로딩/에러/데이터 상태 → view에 props로 내려줌. onSuccess/onError 주입.
- **api.js**: 순수 HTTP. 요청 payload를 OpenAPI DTO에 맞춰 정제(빈 문자열→null, datetime-local→ISO-8601 등). 실패는 `code` 붙인 Error로 던져 UI가 필드 에러/서버 에러 구분.
- **queries.js**: `xxxKeys` 객체로 쿼리키 중앙화. mutation 성공 시 관련 키 `invalidateQueries`. 호출부 옵션은 스프레드로 합성.
- **views/**: 상태 없는 표현 위주. 디자인 시스템 컴포넌트/토큰만 사용.

---

## 5. 데이터 흐름 & 백엔드 연동

```
View ─(이벤트)→ Page ─(훅)→ queries.js ─(fn)→ api.js ─(client)→ Spring
                                                    │
                                        axios 인터셉터: JWT 부착 / 401 처리
```

### axios 클라이언트 (`shared/api/client.js`)
- baseURL = `VITE_API_BASE_URL ?? http://localhost:8080`, timeout 10s, JSON 헤더.
- **요청 인터셉터**: 스토어의 `accessToken` 있으면 `Authorization: Bearer <token>` 부착.
- **응답 인터셉터**: 토큰이 있는 상태에서 401 → 세션 클리어(만료/무효 토큰). 로그인 중 401은 토큰이 없으므로 영향 없음.

### 인증 스토어 (`shared/auth/auth.store.js`)
zustand + persist(localStorage 키 `jaram-auth`). `accessToken`·`user`·`isAuthenticated` 보관.
```js
useAuthStore.getState().accessToken   // React 밖 (인터셉터 등)
useAuthStore((s) => s.user)           // React 안
setAuth(token, user) / clear()
```

### API 계약
- 단일 계약 소스: **`docs/api/openapi.yaml`** (OpenAPI 3.1). 설계·usecase: `docs/superpowers/specs/2026-06-29-jaram-backend-design.md`.
- 백엔드(Spring Boot)는 별도 레포, JSON만 제공. DTO 네이밍은 백엔드 CLAUDE.md 기준.
- **주의**: 일부 엔드포인트 경로는 아직 제안 상태(백엔드 미완). 백엔드 확정 시 정렬.

### 도메인 enum
`shared/member/enums.js`가 부서(`MemberDepartment`)·직책(`MemberTitle`) 단일 소스. 와이어는 enum **키**, 화면은 한글 **라벨** 매핑. 새 부서/직책 추가는 여기 한 곳만 수정.

---

## 6. 새 기능 붙이는 체크리스트

1. 가장 비슷한 기존 feature 폴더 복사 → 이름 치환.
2. `<name>.api.js`에 엔드포인트 함수 작성 (payload 정제·실패 계약). OpenAPI와 대조.
3. `<name>.queries.js`에 훅 + `xxxKeys` 정의. mutation 무효화 대상 지정.
4. `<Name>Page.jsx`에서 훅 조립, view에 props 전달.
5. `views/`에 화면 조각 작성 — **디자인 시스템 토큰/컴포넌트만** 사용.
6. `App.tsx`에 `<Route>` 추가.
7. 새 도메인 enum이면 `shared/member/enums.js`(또는 적절한 shared)에 반영.
8. `pnpm typecheck && pnpm lint`로 확인.

---

## 7. 코드 규칙 요약

- 컴포넌트는 `.jsx`(필요 시 `.d.ts` 페어, 타입 자동 인식).
- 스타일시트 진입점 1회 import(`import '@/design-system/styles.css'`).
- import는 `@/` alias.
- UI는 디자인 시스템 토큰/컴포넌트만. 임의 색·폰트·여백 금지.
- 주석·문구는 한국어 존댓말 톤(브랜드 보이스). 이모지 금지.
