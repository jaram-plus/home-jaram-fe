# Next.js → Vite 순수 React 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js를 들어내고 Vite + react-router 순수 React SPA로 전환해 로그인 페이지(`/login`, `/apply`)를 실제 진입 가능하게 만들고, 중단됐던 백엔드 연동(react-query 로그인 뮤테이션 + signup 에러 정밀화)을 마무리한다.

**Architecture:** 빌드 레이어만 교체한다. `src/features`·`src/design-system`는 무변경. 새 진입점 `index.html`→`src/main.tsx`→`<QueryProvider><BrowserRouter><App/>>`가 Next app router를 대체하고, `App.tsx`가 3개 라우트를 선언형으로 매핑한다.

**Tech Stack:** Vite, @vitejs/plugin-react, react-router-dom v7, TypeScript, Tailwind v4(postcss), React 19, axios, @tanstack/react-query, zustand.

## Global Constraints

- "구조 유지": `src/features`, `src/design-system` 무변경. 빌드/진입점/라우팅만 교체.
- design-system을 router에 결합하지 않는다(`Button href`는 `<a>` 전체 리로드 유지).
- alias `@` → `/src` (tsconfig `paths`와 Vite `resolve.alias` 일치).
- 전역 스타일은 진입점에서 한 번만 import: `./app/globals.css`, `@/design-system/styles.css`.
- API base: `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'`.
- 로그인 실패 코드 계약: `NOT_FOUND | PENDING | INVALID | SERVER`. signup: 409=`EMAIL_TAKEN`, 그 외=`SERVER`.
- UI 카피는 한국어 존댓말, 이모지 금지(CLAUDE.md / jaram-design).
- 검증은 단위테스트 대신 빌드/실행/lint로 한다(프로젝트에 테스트 러너 없음 — 인프라 전환 성격).

---

### Task 1: Vite + react-router 진입점 스캐폴딩

Next 파일은 남겨둔 채 Vite 진입점을 추가해 `/`, `/login`, `/apply`가 Vite dev로 렌더되게 한다.

**Files:**
- Create: `vite.config.ts`
- Create: `index.html` (저장소 루트)
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/shared/api/QueryProvider.jsx`
- Modify: `src/features/login/LoginPage.jsx:29-30` (initialView prop)

**Interfaces:**
- Produces: `QueryProvider({ children })` — `@/shared/api/QueryProvider`.
- Produces: `LoginPage({ initialView })` — `initialView?: 'login' | 'signup'`, 기본 `'login'`.
- Consumes: 기존 `LandingPage`(`@/features/landing/LandingPage`), `LoginPage`(`@/features/login/LoginPage`).

- [ ] **Step 1: Vite·router 의존성 설치**

```bash
npm install react-router-dom@^7
npm install -D vite@^7 @vitejs/plugin-react@^5
```

Expected: `package.json`에 추가, 에러 없이 완료.

- [ ] **Step 2: `vite.config.ts` 작성**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 3: 루트 `index.html` 작성**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JARAM · 자람 — 한양대 ERICA 컴퓨터학회</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: `src/shared/api/QueryProvider.jsx` 작성**

```jsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** App-root react-query provider. One QueryClient per app instance. */
export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 5: `src/App.tsx` 작성 (라우트 매핑)**

```tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/login/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply" element={<LoginPage initialView="signup" />} />
    </Routes>
  );
}
```

- [ ] **Step 6: `src/main.tsx` 작성 (진입점)**

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './app/globals.css';
import '@/design-system/styles.css';
import { QueryProvider } from '@/shared/api/QueryProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 7: `LoginPage`에 `initialView` prop 추가**

`src/features/login/LoginPage.jsx` line 29-30을 아래로 교체:

```jsx
export default function LoginPage({ initialView = 'login' }) {
  const [view, setView] = useState(initialView); // login | signup | signupDone | reset | resetSent | resetNew | resetDone
```

- [ ] **Step 8: Vite dev로 렌더 검증**

Run: `npx vite` (별도 터미널), 브라우저에서 `http://localhost:5173/`, `/login`, `/apply` 접속.
Expected: `/`=랜딩, `/login`=로그인 뷰, `/apply`=가입신청 뷰 렌더. 콘솔 에러 없음.

- [ ] **Step 9: Vite 빌드 검증**

Run: `npx vite build`
Expected: `dist/` 생성, 빌드 성공.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vite.config.ts index.html src/main.tsx src/App.tsx src/shared/api/QueryProvider.jsx src/features/login/LoginPage.jsx
git commit -m "feat: add Vite + react-router entry alongside Next"
```

---

### Task 2: Next.js 제거 및 설정 정리

Next 의존성·설정·app router 파일을 제거하고 스크립트/tsconfig/eslint/globals.css를 Vite 기준으로 정리한다.

**Files:**
- Delete: `src/app/layout.tsx`, `src/app/page.tsx`, `next.config.ts`, `next-env.d.ts`
- Modify: `package.json` (deps + scripts)
- Modify: `tsconfig.json`
- Modify: `eslint.config.mjs`
- Modify: `src/app/globals.css` (body 레이아웃 이전)

**Interfaces:**
- Consumes: Task 1의 진입점(`src/main.tsx`, `index.html`).
- Produces: `npm run dev` = `vite`, `npm run build` = `vite build`.

- [ ] **Step 1: Next app router 파일·설정 삭제**

```bash
git rm src/app/layout.tsx src/app/page.tsx next.config.ts next-env.d.ts
```

- [ ] **Step 2: `package.json` scripts·deps 정리**

scripts를 아래로 교체:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  },
```

dependencies에서 `"next": "16.2.9",` 줄 제거.

- [ ] **Step 3: Next 패키지 제거**

```bash
npm uninstall next eslint-config-next
```

- [ ] **Step 4: `src/app/globals.css` body 레이아웃 이전**

삭제된 layout.tsx의 `min-h-full flex flex-col`을 body 규칙에 흡수. `body` 블록을 아래로 교체:

```css
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-sans);
}
```

- [ ] **Step 5: `tsconfig.json` 정리**

`compilerOptions`에서 `"plugins": [{ "name": "next" }]` 제거하고 `"types": ["vite/client"]` 추가. `include`를 아래로 교체(next 항목 제거):

```json
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
```

- [ ] **Step 6: `eslint.config.mjs` 교체 (Next 의존 제거)**

추가 설치:

```bash
npm install -D @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

`eslint.config.mjs` 전체를 아래로 교체:

```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', '.next', 'out', 'build'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

- [ ] **Step 7: dev·build·lint 검증**

Run: `npm run dev` → `/`, `/login`, `/apply` 접속 확인 후 종료.
Run: `npm run build`
Run: `npm run lint`
Expected: dev 정상 렌더, build 성공(Next 잔재 에러 없음), lint 통과(또는 react-refresh warn만).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: remove Next.js, switch build to Vite"
```

---

### Task 3: API base URL을 env로 분리

**Files:**
- Modify: `src/shared/api/client.js:13` (`API_BASE_URL`)
- Create: `.env.example`

**Interfaces:**
- Consumes: `import.meta.env`(Vite, Task 1·2로 활성).
- Produces: `API_BASE_URL` — env 우선, 폴백 `http://localhost:8080`.

- [ ] **Step 1: `client.js`의 `API_BASE_URL` 교체**

`src/shared/api/client.js`의 아래 줄을:

```js
export const API_BASE_URL = 'http://localhost:8080';
```

다음으로 교체:

```js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
```

- [ ] **Step 2: `.env.example` 작성**

```bash
# 백엔드 API 베이스 URL. 미설정 시 http://localhost:8080 사용.
VITE_API_BASE_URL=http://localhost:8080
```

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: 성공. `import.meta.env` 타입 에러 없음(Task 2에서 `types: ["vite/client"]` 추가됨).

- [ ] **Step 4: Commit**

```bash
git add src/shared/api/client.js .env.example
git commit -m "feat: read API base URL from VITE_API_BASE_URL env"
```

---

### Task 4: 로그인 제출을 react-query 뮤테이션으로 전환

**Files:**
- Create: `src/features/login/useLoginMutation.js`
- Modify: `src/features/login/LoginPage.jsx` (login 경로)
- Modify: `src/features/login/views/LoginView.jsx:49` (loading prop 소스)

**Interfaces:**
- Consumes: `api.login`(`login.api.js`), `QueryProvider`(Task 1).
- Produces: `useLoginMutation(options)` → `useMutation` 결과(`mutate`, `isPending`, `reset`).

- [ ] **Step 1: `useLoginMutation.js` 작성**

```js
import { useMutation } from '@tanstack/react-query';
import * as api from './login.api';

/**
 * 로그인 뮤테이션. 성공 시 login.api.js가 토큰을 auth store에 저장한다.
 * 호출부에서 onSuccess/onError를 주입한다.
 *   const m = useLoginMutation({ onSuccess, onError });
 *   m.mutate({ email, password });
 */
export function useLoginMutation(options) {
  return useMutation({ mutationFn: api.login, ...options });
}
```

- [ ] **Step 2: `LoginPage` 임포트·뮤테이션 추가**

`src/features/login/LoginPage.jsx` 상단 import에 추가:

```js
import { useLoginMutation } from './useLoginMutation';
```

`showToast` 정의 직후에 뮤테이션 선언(showToast를 onSuccess가 참조하므로 순서 중요):

```js
  const loginMutation = useLoginMutation({
    onSuccess: () => {
      showToast(TOAST.login);
      // TODO: redirect into the authenticated area, e.g. navigate('/');
    },
    onError: (err) => setFormError(LOGIN_ERROR[err && err.code] || LOGIN_ERROR.SERVER),
  });
```

- [ ] **Step 3: `go()`에 뮤테이션 reset 추가**

`go` useCallback 본문에 `loginMutation.reset();`를 추가하고 deps 배열에 `loginMutation`을 추가:

```js
  const go = useCallback(
    (next) => {
      setView(next);
      setFormError('');
      setLoading(false);
      loginMutation.reset();
      login.setErrors({});
      signup.setErrors({});
      reset.setErrors({});
      newPw.setErrors({});
    },
    [login, signup, reset, newPw, loginMutation],
  );
```

- [ ] **Step 4: `submitLogin`을 뮤테이션 호출로 교체**

기존 `async function submitLogin()` 전체를 아래로 교체(검증은 유지, try/catch·setLoading 제거):

```js
  function submitLogin() {
    const v = login.values;
    const e = {};
    if (!v.email.trim()) e.email = MESSAGES.emailRequired;
    else if (!isEmail(v.email)) e.email = MESSAGES.emailFormat;
    else if (!isHanyang(v.email)) e.email = MESSAGES.emailHanyang;
    if (!v.pw) e.pw = MESSAGES.pwRequired;
    if (Object.keys(e).length) {
      login.setErrors(e);
      return;
    }
    login.setErrors({});
    setFormError('');
    loginMutation.mutate({ email: v.email, password: v.pw });
  }
```

- [ ] **Step 5: LoginView 로딩 소스 교체**

`LoginPage.jsx`의 LoginView 렌더에서 `loading={loading}`을 `loading={loginMutation.isPending}`로 교체:

```jsx
          {view === 'login' && (
            <LoginView form={login} loading={loginMutation.isPending} formError={formError} onSubmit={submitLogin} onSignup={() => go('signup')} onReset={() => go('reset')} />
          )}
```

- [ ] **Step 6: dev에서 로그인 실패 경로 검증**

Run: `npm run dev` → `/login`에서 유효한 한양 이메일+비번 입력 후 제출.
Expected: 백엔드 부재 → 네트워크 오류 → "확인 중…" 후 `LOGIN_ERROR.SERVER`("일시적인 오류…") 배너 표시. 버튼 다시 활성.

- [ ] **Step 7: Commit**

```bash
git add src/features/login/useLoginMutation.js src/features/login/LoginPage.jsx
git commit -m "feat: drive login submit through react-query mutation"
```

---

### Task 5: 가입신청 에러 정밀화 (409 vs 서버 오류)

**Files:**
- Modify: `src/features/login/login.api.js` (signup)
- Modify: `src/features/login/login.data.js` (SIGNUP_ERROR)
- Modify: `src/features/login/LoginPage.jsx` (submitSignup, SignupView 렌더)
- Modify: `src/features/login/views/SignupView.jsx` (formError prop)

**Interfaces:**
- Consumes: `client`(axios), `MESSAGES`·`SIGNUP_ERROR`(`login.data.js`).
- Produces: `signup` reject `{ code: 'EMAIL_TAKEN' | 'SERVER' }`; `SignupView({ formError })`.

- [ ] **Step 1: `login.api.js`의 signup에 에러 매핑 추가**

기존 signup 함수를 아래로 교체:

```js
export async function signup({ name, studentId, email, password }) {
  try {
    const { data } = await client.post('/api/auth/signup', {
      name,
      studentId,
      email,
      password,
    });
    return data;
  } catch (error) {
    // 409 = 이미 신청된 이메일(필드 레벨), 그 외 = 폼 레벨 서버 오류.
    const code = error.response?.status === 409 ? 'EMAIL_TAKEN' : 'SERVER';
    throw Object.assign(new Error(error.response?.data?.message || 'signup failed'), { code });
  }
}
```

- [ ] **Step 2: `login.data.js`에 `SIGNUP_ERROR` 추가**

`LOGIN_ERROR` 블록 다음에 추가:

```js
// 가입 신청 폼 레벨 실패 → 사용자 카피.
export const SIGNUP_ERROR = {
  SERVER: '가입 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};
```

- [ ] **Step 3: `LoginPage`에서 `SIGNUP_ERROR` 임포트**

`login.data.js` import 줄에 `SIGNUP_ERROR` 추가:

```js
import { MESSAGES, LOGIN_ERROR, SIGNUP_ERROR, TOAST } from './login.data';
```

- [ ] **Step 4: `submitSignup`의 catch를 코드 분기로 교체**

`submitSignup` 내부의 검증 통과 후 블록을 아래로 교체:

```js
    signup.setErrors({});
    setFormError('');
    setLoading(true);
    try {
      await api.signup({ name: v.name, studentId: v.sid, email: v.email, password: v.pw });
      setView('signupDone');
    } catch (err) {
      if (err && err.code === 'EMAIL_TAKEN') {
        signup.setErrors({ email: MESSAGES.emailTaken });
      } else {
        setFormError(SIGNUP_ERROR.SERVER);
      }
    } finally {
      setLoading(false);
    }
```

- [ ] **Step 5: SignupView 렌더에 formError 전달**

`LoginPage.jsx`의 SignupView 렌더를 교체:

```jsx
          {view === 'signup' && <SignupView form={signup} loading={loading} formError={formError} onSubmit={submitSignup} onLogin={() => go('login')} />}
```

- [ ] **Step 6: `SignupView`에 formError prop·배너 추가**

`src/features/login/views/SignupView.jsx` 시그니처에 `formError` 추가하고 `FormError` import:

```jsx
import { Eyebrow, Title, Lead, FormError, blockBtn } from './parts';

/** Apply for membership — submitted for officer approval before login. */
export function SignupView({ form, loading, formError, onSubmit, onLogin }) {
```

제출 버튼 `<div style={{ marginTop: 4 }}>` 바로 앞에 배너 추가:

```jsx
        {formError && <FormError message={formError} />}

        <div style={{ marginTop: 4 }}>
```

- [ ] **Step 7: dev에서 가입 실패 경로 검증**

Run: `npm run dev` → `/apply`에서 유효 입력 후 제출.
Expected: 백엔드 부재 → 그 외 오류 → 폼 레벨 배너 `SIGNUP_ERROR.SERVER`("가입 신청 중 오류…") 표시(이메일 필드 에러 아님).

- [ ] **Step 8: lint·build 검증**

Run: `npm run lint`
Run: `npm run build`
Expected: 통과.

- [ ] **Step 9: Commit**

```bash
git add src/features/login/login.api.js src/features/login/login.data.js src/features/login/LoginPage.jsx src/features/login/views/SignupView.jsx
git commit -m "feat: distinguish signup email-taken from server error"
```

---

## Self-Review

**Spec coverage:**
- 진입점 교체(index.html/main/App) → Task 1. ✓
- 앱 레벨 삭제(layout/page) + globals.css body → Task 2. ✓
- 빌드 설정(vite.config/package/tsconfig/eslint) → Task 1·2. ✓
- /apply→signup(initialView) → Task 1 Step 5·7. ✓
- client.js env + .env.example → Task 3. ✓
- useLoginMutation + QueryProvider + LoginPage 로그인 전환 → Task 1(Provider)·4. ✓
- signup 409 정밀화 + SignupView formError + SIGNUP_ERROR → Task 5. ✓
- 검증(dev/build/lint) → 각 Task 말미. ✓

**Placeholder scan:** 코드 단계 모두 실제 코드 포함. `// TODO: redirect`는 기존 코드의 의도적 후속 표식(범위 밖, 스펙 비목표). 통과.

**Type consistency:** `initialView`(Task1) → App에서 `"signup"` 전달(Task1). `QueryProvider`(Task1) → main.tsx 사용(Task1). `useLoginMutation`(Task4) → `mutate/isPending/reset` 일관. signup `code` `'EMAIL_TAKEN'|'SERVER'`(Task5 api) ↔ submitSignup 분기(Task5) 일치. `SIGNUP_ERROR.SERVER`(data) ↔ 참조부 일치. `FormError({ message })`(parts.jsx 기존) ↔ SignupView 사용 일치.

**Risk:** react-refresh 규칙이 `parts.jsx`(컴포넌트+상수 혼재) 등에 warn 낼 수 있음 — `allowConstantExport: true`로 완화, warn은 빌드 차단 아님.
