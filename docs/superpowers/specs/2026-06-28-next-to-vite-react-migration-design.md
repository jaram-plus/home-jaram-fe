# Next.js → Vite 순수 React 전환 + 로그인 라우팅 연동

작성일: 2026-06-28
상태: 승인 대기

## 배경 / 목적

JARAM 프론트엔드는 Next.js 16(app router)로 스캐폴딩됐으나, 운영 방향을
**Next 없이 순수 React(SPA)** 로 정했다. 동시에 `src/features/login`의
`LoginPage`는 완성됐지만 어떤 라우트에도 연결되지 않은 고아 상태다.

이 작업은 빌드 레이어를 Next → Vite로 교체하고 `react-router-dom`으로
클라이언트 라우팅을 도입해 로그인 페이지를 실제 진입 가능하게 만든다.
앞선 작업에서 시작했다 중단된 백엔드 연동 마무리(react-query 로그인 뮤테이션,
signup 에러 정밀화)도 같은 범위에 포함한다.

**원칙:** "구조 유지" — `src/features`, `src/design-system`는 무변경.
빌드/진입점/라우팅 레이어만 교체한다. 불필요한 리팩터링 금지(YAGNI).

## 성공 기준

- `npm run dev`가 Vite로 뜨고 `/`, `/login`, `/apply`가 렌더된다.
- `/` → 랜딩, `/login` → 로그인 뷰, `/apply` → 로그인의 가입신청(signup) 뷰.
- 랜딩의 `/apply`·`/login`·`/` 버튼/링크로 해당 페이지 이동.
- `npm run build`가 Next 의존 없이 성공한다.
- 로그인 제출이 react-query 뮤테이션으로 `login.api.js`(axios)를 호출하고,
  성공 시 토스트, 실패 시 `LOGIN_ERROR` 코드별 메시지를 띄운다.
- 가입신청 실패가 409(이메일 중복)와 그 외(서버 오류)로 구분돼 표시된다.
- `next`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`가 제거됐다.

## 스택 결정

- **빌드:** Vite + `@vitejs/plugin-react`. (Next 제거)
- **라우팅:** `react-router-dom` v7, `<BrowserRouter>` + `<Routes>` JSX 방식.
  라우트 3개뿐이라 data-router(`createBrowserRouter`)보다 단순한 선언형 선택.
- **유지:** TypeScript, Tailwind v4(postcss, Vite가 `postcss.config.mjs` 자동 인식),
  React 19, axios·@tanstack/react-query·zustand.
- **alias:** `@` → `/src` (tsconfig `paths`와 일치하도록 Vite에도 설정).

## 아키텍처 / 변경 단위

각 단위는 독립적으로 이해·검증 가능하도록 분리한다.

### 1. 진입점 (신규)

- **`index.html`** (저장소 루트) — `<div id="root">`, `<script type="module"
  src="/src/main.tsx">`. 기존 `layout.tsx`의 `<title>`/`lang="ko"`를 정적 이식.
- **`src/main.tsx`** — `createRoot(#root)`. 트리:
  `<QueryProvider><BrowserRouter><App/></BrowserRouter></QueryProvider>`.
  전역 스타일을 여기서 **한 번만** import: `./app/globals.css`,
  `@/design-system/styles.css`.
- **`src/App.tsx`** — `<Routes>` 정의:
  - `/` → `<LandingPage/>`
  - `/login` → `<LoginPage/>`
  - `/apply` → `<LoginPage initialView="signup"/>`

### 2. 앱 레벨 정리 (삭제/이전)

- `src/app/layout.tsx` 삭제 — 역할은 `index.html`(html lang, title) +
  `main.tsx`(스타일 import) + `globals.css`(body 레이아웃)로 분산.
- `src/app/page.tsx` 삭제 — 라우팅은 `App.tsx`가 담당.
- `src/app/globals.css` 유지하되 body 규칙에 레이아웃 이전:
  삭제되는 `min-h-full flex flex-col` 대신 `min-height:100vh; display:flex;
  flex-direction:column;`를 body에 추가.

### 3. 빌드/설정

- **`vite.config.ts`** 신규 — `react()` 플러그인, `resolve.alias['@']`→`/src`.
- **`package.json`**:
  - 제거: `next`.
  - 추가: `vite`, `@vitejs/plugin-react`, `react-router-dom`.
  - scripts: `dev: vite`, `build: vite build`, `preview: vite preview`,
    `typecheck: tsc --noEmit`(현 tsconfig는 `noEmit`이라 별도 타입체크 스크립트로 분리).
- 삭제: `next.config.ts`, `next-env.d.ts`.
- **`tsconfig.json`**: `next` 플러그인 제거, `moduleResolution: bundler` 유지,
  `types: ["vite/client"]` 추가(`import.meta.env` 타입), `include`에서 next 항목 정리.
- **`eslint.config.mjs`**: `eslint-config-next` 의존 제거(또는 react/vite 기본으로 대체).

### 4. 로그인 라우팅 연동

- **`LoginPage`**에 `initialView?: 'login' | 'signup'` prop 추가.
  `useState('login')` → `useState(initialView ?? 'login')`. 그 외 무변경.
- 랜딩의 `<a href="/apply">`, `Button href="/apply|/login|/about"`는 그대로 둠.
  design-system `Button`은 `href` 시 `<a>` 렌더 → **전체 페이지 리로드 네비**로
  동작(허용). design-system을 router에 결합하지 않는다.
  (클라이언트 사이드 네비는 후속 개선 항목으로 명시.)

### 5. 백엔드 연동 마무리 (앞 작업 연속)

- **`src/shared/api/client.js`** — `API_BASE_URL`을
  `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'`로 변경.
  `.env.example`에 `VITE_API_BASE_URL=` 추가.
- **`src/features/login/useLoginMutation.js`** 신규 —
  `useMutation({ mutationFn: api.login })` 래퍼.
- **`src/shared/api/QueryProvider.jsx`** 신규 — `QueryClient`(useState 싱글턴) +
  `QueryClientProvider`.
- **`LoginPage`** — 로그인 제출을 `useLoginMutation`으로 전환:
  - 로딩은 `mutation.isPending`(signup/reset의 `loading` state는 유지).
  - `onSuccess` → 토스트, `onError` → `setFormError(LOGIN_ERROR[code] ?? SERVER)`.
  - `go()`에서 `mutation.reset()` 호출.
- **`login.api.js` signup** — 실패 매핑: HTTP 409 → `code:'EMAIL_TAKEN'`,
  그 외 → `code:'SERVER'`.
- **`LoginPage` submitSignup** — `EMAIL_TAKEN` → 이메일 필드 에러
  (`MESSAGES.emailTaken`), 그 외 → 폼 레벨 에러(`SIGNUP_ERROR.SERVER`).
- **`login.data.js`** — `SIGNUP_ERROR = { SERVER: '...' }` 추가.
- **`SignupView`** — `formError` prop + `<FormError>` 렌더 추가.

## 데이터 흐름 (로그인)

```
LoginView 제출
  → submitLogin: 로컬 검증 → loginMutation.mutate({email,password})
  → useLoginMutation → api.login (axios POST /api/auth/login)
  → 성공: useAuthStore.setAuth(accessToken,user) → onSuccess 토스트
  → 실패: toLoginError → {code} → onError → LOGIN_ERROR[code] 표시
```

## 에러 처리

- axios 응답 인터셉터: 토큰 보유 중 401 → `useAuthStore.clear()`(세션 만료).
- 로그인 실패 코드: body `.code` 우선, 없으면 status(404/403/401/그외) 매핑.
- 가입 실패: 409=필드(이메일 중복), 그 외=폼(서버 오류).
- 비밀번호 재설정 요청: 성공/실패 무관 동일 확인 화면(이메일 존재 여부 비노출).

## 검증

- `npm run dev` 후 수동: `/`, `/login`, `/apply` 렌더 및 상호 이동.
- `npm run build` 성공(Next 잔재 없음).
- 로그인 제출 → 백엔드 부재 시 네트워크 오류 → `LOGIN_ERROR.SERVER` 표시 확인.
- 가입 제출 → 동일 오류 경로에서 폼 레벨 메시지 확인.
- eslint 통과.

## 범위 밖 (비목표)

- `/about` 등 신규 페이지 콘텐츠 제작.
- 클라이언트 사이드(`<Link>`) 네비 — design-system Button 미결합 유지.
- 인증 보호 라우트/리다이렉트.
- Tailwind 제거(현재 무해, 유지).
- SSR/SSG.

## 리스크 / 메모

- React 19 + Vite + react-router v7 호환은 안정적(현행 버전 지원).
- `next/font` 등 Next 전용 API 미사용 확인됨(폰트는 design-system CDN import).
- `'use client'` 지시어가 코드에 남아도 Vite에선 무해(문자열 리터럴).
