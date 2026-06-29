# 프로필 페이지(`/profile`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인한 회원이 `/profile`에서 자기 정보를 보고 `bio`/`githubUrl`/`blogUrl`을 수정·저장하면 백엔드(`PATCH /api/me`)에 반영되는 페이지를 추가한다.

**Architecture:** 기존 feature 패턴(`study`/`login`)을 그대로 복제한다 — `*.api.js`(axios) + `*.queries.js`(react-query) + `useForm.js`(컨트롤드 폼) + `views/`(읽기/수정 뷰). `ProfilePage`가 인증 가드와 보기↔수정 모드 상태를 들고, 데이터는 react-query로 캐시한다.

**Tech Stack:** React 19, react-router-dom 7, @tanstack/react-query 5, axios, zustand(auth store), Vite. 디자인은 `@/design-system` 토큰·컴포넌트만. **테스트 러너 없음** — 검증은 `npm run typecheck` + `npm run lint` + `npm run build` + 순수 함수는 throwaway `node` 스크립트.

## Global Constraints

- UI는 `@/design-system`의 토큰(`var(--*)`)·컴포넌트(`Button`, `Card`, `Input`)만 사용. 새 색/여백 임의 추가 금지. **이모지·그라데이션 금지**.
- 보이스: 한국어·존댓말·따뜻하고 차분함. 라틴 문자는 ALL-CAPS 아이라벨로만.
- 컴포넌트는 `.jsx`. 경로 alias `@/* → src/*`.
- 수정 필드: `bio`, `githubUrl`, `blogUrl`만. 읽기 전용: `name`, `gen`, `email`, `studentId`, `authority`.
- `name`은 수정 대상 아님 → auth store `user.name` 동기화 불필요.
- 스타일시트 import 추가 금지(진입점에서 1회만). 페이지 전용 스타일은 인라인 스타일 + CSS 변수, 또는 `profile.css` 1개.

---

## File Structure

```
src/features/profile/
  ProfilePage.jsx        # 인증 가드 + 보기/수정 모드 상태·핸들러
  profile.api.js         # getMe(), updateMe(payload)
  profile.queries.js     # meKeys, useMe(), useUpdateMe()
  profile.validation.js  # isUrl(빈값 허용), validateProfile()
  profile.data.js        # 필드 라벨·안내·메시지·토스트 상수
  useForm.js             # login/study useForm 복사(동일 형태)
  profile.css            # 페이지 전용(필요 시; 본 계획은 인라인 스타일 위주)
  views/
    index.js             # 배럴 export
    ProfileView.jsx      # 읽기 모드 카드
    EditView.jsx         # 수정 폼
    parts.jsx            # Eyebrow, FieldRow
    Toast.jsx            # 저장 완료 토스트(study Toast 복사)
docs/api/openapi.yaml    # /api/me path + MeProfile/MeUpdateRequest schema 추가
src/App.tsx              # <Route path="/profile" …> 추가
src/shared/ui/Header.jsx # 프로필 칩 span → <Link to="/profile">
```

각 파일 책임 1개. `profile.api.js`는 HTTP만, `profile.queries.js`는 캐시/무효화만, `profile.validation.js`는 순수 검증만, `views/*`는 표시만, `ProfilePage.jsx`는 상태 오케스트레이션만.

---

### Task 1: OpenAPI 계약 추가

**Files:**
- Modify: `docs/api/openapi.yaml` (paths 블록은 27–449행 사이, schemas는 `Authority:`(538행) 뒤)

**Interfaces:**
- Produces: `MeProfile`, `MeUpdateRequest` 스키마 — 프론트 `getMe()`/`updateMe()`가 이 형태를 소비.

- [ ] **Step 1: `/api/me` path 추가**

`paths:` 블록 끝(다른 `/api/...` path들과 같은 들여쓰기, `components:` 줄 바로 위)에 추가:

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

- [ ] **Step 2: 스키마 추가**

`components.schemas`의 `Authority:` 정의 블록 뒤(같은 들여쓰기 `  schemas:` 아래 항목)로 추가:

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

- [ ] **Step 3: YAML 유효성 확인**

Run: `node -e "const y=require('fs').readFileSync('docs/api/openapi.yaml','utf8'); console.log(/MeProfile:|MeUpdateRequest:|\/api\/me:/g.test(y)?'OK':'MISSING')"`
Expected: `OK`. (정식 YAML 린터가 있으면 그걸로 파싱 통과 확인.)

- [ ] **Step 4: Commit**

```bash
git add docs/api/openapi.yaml
git commit -m "docs(api): add GET/PATCH /api/me contract for profile page"
```

---

### Task 2: 검증 모듈 (`profile.validation.js`)

**Files:**
- Create: `src/features/profile/profile.validation.js`
- Test: `src/features/profile/profile.validation.check.mjs` (throwaway, 커밋 안 함)

**Interfaces:**
- Produces:
  - `isUrl(x: string): boolean` — 빈 문자열 통과, 값 있으면 `http(s)://` URL만 통과.
  - `BIO_MAX = 500`
  - `validateProfile(values: {bio,githubUrl,blogUrl}): Record<string,string>` — 에러 맵(필드명→메시지), 통과 시 `{}`.

- [ ] **Step 1: 검증 스크립트 작성(실패 확인용)**

Create `src/features/profile/profile.validation.check.mjs`:

```js
import assert from 'node:assert';
import { isUrl, validateProfile, BIO_MAX } from './profile.validation.js';

// isUrl: 빈값 통과
assert.equal(isUrl(''), true);
assert.equal(isUrl('https://github.com/me'), true);
assert.equal(isUrl('http://blog.io'), true);
assert.equal(isUrl('github.com/me'), false);
assert.equal(isUrl('ftp://x'), false);

// validateProfile: 정상 → 빈 맵
assert.deepEqual(validateProfile({ bio: '안녕하세요', githubUrl: '', blogUrl: '' }), {});

// validateProfile: 잘못된 url → 필드 에러
const e1 = validateProfile({ bio: '', githubUrl: 'nope', blogUrl: '' });
assert.ok(e1.githubUrl, 'githubUrl error expected');

// validateProfile: bio 길이 초과
const e2 = validateProfile({ bio: 'a'.repeat(BIO_MAX + 1), githubUrl: '', blogUrl: '' });
assert.ok(e2.bio, 'bio length error expected');

console.log('profile.validation: all assertions passed');
```

- [ ] **Step 2: 실패 확인**

Run: `node src/features/profile/profile.validation.check.mjs`
Expected: FAIL — `Cannot find module './profile.validation.js'`.

- [ ] **Step 3: 구현 작성**

Create `src/features/profile/profile.validation.js`:

```js
/**
 * 프로필 수정 폼 순수 검증. URL은 선택 입력(빈값 통과), 값이 있으면
 * http(s) URL만 허용. bio는 최대 길이 제한. 에러 맵(필드명→메시지)을 반환하며
 * 통과하면 빈 객체.
 */
export const BIO_MAX = 500;

export function isUrl(x) {
  if (!x) return true; // 선택 입력 — 빈값 통과
  try {
    const u = new URL(x);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProfile(values) {
  const errors = {};
  if (values.bio && values.bio.length > BIO_MAX) {
    errors.bio = `자기소개는 ${BIO_MAX}자 이내로 작성해 주세요.`;
  }
  if (!isUrl(values.githubUrl)) {
    errors.githubUrl = 'http(s):// 로 시작하는 주소를 입력해 주세요.';
  }
  if (!isUrl(values.blogUrl)) {
    errors.blogUrl = 'http(s):// 로 시작하는 주소를 입력해 주세요.';
  }
  return errors;
}
```

- [ ] **Step 4: 통과 확인**

Run: `node src/features/profile/profile.validation.check.mjs`
Expected: PASS — `profile.validation: all assertions passed`.

- [ ] **Step 5: throwaway 스크립트 삭제 후 commit**

```bash
rm src/features/profile/profile.validation.check.mjs
git add src/features/profile/profile.validation.js
git commit -m "feat(profile): add profile form validation (isUrl, validateProfile)"
```

---

### Task 3: 데이터 계층 (api + queries + data 상수 + useForm)

**Files:**
- Create: `src/features/profile/profile.api.js`
- Create: `src/features/profile/profile.queries.js`
- Create: `src/features/profile/profile.data.js`
- Create: `src/features/profile/useForm.js`

**Interfaces:**
- Consumes: `@/shared/api/client` 의 `client` (axios 인스턴스).
- Produces:
  - `getMe(): Promise<MeProfile>`, `updateMe(payload: {bio,githubUrl,blogUrl}): Promise<MeProfile>`
  - `meKeys = { me: ['me'] }`
  - `useMe()` → react-query `{ data, isLoading, isError }`
  - `useUpdateMe(options)` → react-query mutation, 성공 시 `['me']` 무효화 후 `options.onSuccess` 실행
  - `useForm(initial)` → `{ values, setValues, errors, setErrors, field, reset }`
  - `LABELS`, `MESSAGES`, `TOAST` 상수

- [ ] **Step 1: `profile.api.js` 작성**

```js
/**
 * 프로필 API — 공유 axios client로 Spring 백엔드의 /api/me 와 통신.
 * 백엔드 미구현 상태 — 경로는 docs/api/openapi.yaml 계약 기준.
 */
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

- [ ] **Step 2: `profile.queries.js` 작성**

study.queries의 `useInvalidatingMutation` 패턴을 그대로 따른다.

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './profile.api';

/**
 * react-query 훅 — 프로필 페이지. 내 정보는 useQuery, 수정은 useMutation.
 * 수정 성공 시 ['me']를 무효화해 다시 불러오고, 호출부 onSuccess를 실행한다.
 */
export const meKeys = { me: ['me'] };

export function useMe() {
  return useQuery({ queryKey: meKeys.me, queryFn: api.getMe });
}

export function useUpdateMe(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateMe,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: meKeys.me });
      options?.onSuccess?.(...args);
    },
  });
}
```

- [ ] **Step 3: `profile.data.js` 작성**

```js
/**
 * 프로필 페이지 표시 문자열 — 필드 라벨, 안내 문구, 메시지, 토스트.
 * 한국어·존댓말. 라틴 아이라벨은 ALL-CAPS.
 */
export const EYEBROW = 'PROFILE';

// 읽기 전용 필드 라벨(표시 순서대로)
export const READONLY_LABELS = [
  ['gen', '기수'],
  ['email', '이메일'],
  ['studentId', '학번'],
  ['authority', '권한'],
];

// 수정 가능 필드 라벨
export const LABELS = {
  bio: '자기소개',
  githubUrl: 'GitHub',
  blogUrl: '블로그',
};

export const PLACEHOLDERS = {
  bio: '간단한 자기소개를 적어 주세요.',
  githubUrl: 'https://github.com/username',
  blogUrl: 'https://your.blog',
};

export const MESSAGES = {
  loading: '프로필을 불러오는 중입니다.',
  loadError: '프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  saveError: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  empty: '아직 입력하지 않았습니다.',
};

export const TOAST = { saved: '프로필을 저장했습니다.' };
```

- [ ] **Step 4: `useForm.js` 복사**

`src/features/study/useForm.js`의 내용을 `src/features/profile/useForm.js`로 그대로 복사한다(동일 형태 — `values/setValues/errors/setErrors/field/reset`). 파일 내용:

```js
import { useState, useCallback } from 'react';

/**
 * Minimal controlled-form helper (shared shape with login/study).
 * field(name) → value 갱신 + 해당 필드 에러 제거. setErrors는 검증 후 에러 맵 교체.
 * reset()은 초기값 복원 + 에러 제거.
 */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const field = useCallback(
    (name) => (e) => {
      const v = e && e.target ? e.target.value : e;
      setValues((s) => ({ ...s, [name]: v }));
      setErrors((s) => {
        if (!s[name]) return s;
        const next = { ...s };
        delete next[name];
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
  }, [initial]);

  return { values, setValues, errors, setErrors, field, reset };
}
```

- [ ] **Step 5: 타입 통과 확인**

Run: `npm run typecheck`
Expected: PASS(에러 없음). 아직 어디서도 import 안 하므로 미사용 경고만 없으면 OK.

- [ ] **Step 6: Commit**

```bash
git add src/features/profile/profile.api.js src/features/profile/profile.queries.js src/features/profile/profile.data.js src/features/profile/useForm.js
git commit -m "feat(profile): add data layer (api, queries, data, useForm)"
```

---

### Task 4: 뷰 조각 (Toast, parts, ProfileView, EditView, index)

**Files:**
- Create: `src/features/profile/views/Toast.jsx`
- Create: `src/features/profile/views/parts.jsx`
- Create: `src/features/profile/views/ProfileView.jsx`
- Create: `src/features/profile/views/EditView.jsx`
- Create: `src/features/profile/views/index.js`

**Interfaces:**
- Consumes: `@/design-system`(`Card`, `Input`, `Button`), `./profile.data`.
- Produces (배럴 export):
  - `Toast({ message })`
  - `Eyebrow({ children })`, `FieldRow({ label, children })`
  - `ProfileView({ me })` — 읽기 카드
  - `EditView({ me, values, errors, field, onSave, onCancel, saving })` — 수정 폼
- `me`는 `MeProfile`(`name, gen, email, studentId, authority, bio, githubUrl, blogUrl`).
- `field`는 useForm의 `field(name)`(onChange 핸들러 팩토리).

- [ ] **Step 1: `Toast.jsx` 작성**

`src/features/study/views/Toast.jsx`를 그대로 복사:

```jsx
import React from 'react';

/** Bottom-center pill toast. message 비면 아무것도 렌더하지 않음. */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="jr-toast"
      role="status"
      style={{
        position: 'fixed', left: '50%', bottom: 32, transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface-ink)', color: 'var(--text-on-ink)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)',
        padding: '13px 22px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-lg)',
        animation: 'jrToastIn 0.24s cubic-bezier(0.2, 0.7, 0.2, 1)',
      }}
    >
      <span style={{ flex: 'none', width: 7, height: 7, borderRadius: '50%', background: 'var(--red-300)', display: 'inline-block' }} />
      {message}
    </div>
  );
}
```

- [ ] **Step 2: `parts.jsx` 작성**

```jsx
import React from 'react';

/** ALL-CAPS 아이라벨(빨강). 카드 좌상단 PROFILE 표시용. */
export function Eyebrow({ children }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--w-bold)', letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase', color: 'var(--brand)',
      }}
    >
      {children}
    </span>
  );
}

/** 헤어라인으로 구분된 라벨(좌)+값(우) 행. */
export function FieldRow({ label, children }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 'var(--space-4)', padding: 'var(--space-4) 0',
        borderTop: '1px solid var(--line)',
      }}
    >
      <span style={{ flex: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', wordBreak: 'break-word' }}>
        {children}
      </span>
    </div>
  );
}
```

> 참고: 사용한 토큰(`--fs-xs`, `--ls-label`, `--line`, `--space-4`, `--text-muted`, `--brand` 등)은 study/people 페이지에서 이미 쓰는 토큰이다. 누락된 토큰이 있으면 `tokens/*.css`에서 가장 가까운 기존 토큰으로 교체(임의 값 금지).

- [ ] **Step 3: `ProfileView.jsx`(읽기 카드) 작성**

```jsx
import React from 'react';
import { Card, Button } from '@/design-system';
import { Eyebrow, FieldRow } from './parts';
import { EYEBROW, READONLY_LABELS, LABELS, MESSAGES } from '../profile.data';

/**
 * 읽기 모드 카드. 상단 빨강 룰(accent="top") + PROFILE 아이라벨, 이름(디스플레이),
 * 기수/권한 등 읽기 전용 행, 그리고 bio/github/blog 값. 우상단 "수정" 버튼.
 */
export function ProfileView({ me, onEdit }) {
  const link = (url) =>
    url ? (
      <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
        {url}
      </a>
    ) : (
      <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>
    );

  return (
    <Card accent="top">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <Eyebrow>{EYEBROW}</Eyebrow>
          <h1 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}>
            {me.name}
          </h1>
          {me.gen && (
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
              {me.gen}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}>수정</Button>
      </div>

      <div style={{ marginTop: 'var(--space-5)' }}>
        {READONLY_LABELS.map(([key, label]) => (
          <FieldRow key={key} label={label}>
            {me[key] ?? <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>}
          </FieldRow>
        ))}
        <FieldRow label={LABELS.bio}>
          {me.bio || <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>}
        </FieldRow>
        <FieldRow label={LABELS.githubUrl}>{link(me.githubUrl)}</FieldRow>
        <FieldRow label={LABELS.blogUrl}>{link(me.blogUrl)}</FieldRow>
      </div>
    </Card>
  );
}
```

> `Card`의 `accent`/`Button`의 `variant`/`size` prop은 디자인시스템 정의를 따른다. prop 이름이 다르면(`accent="top"` 미지원 등) `src/design-system/components/core/Card`·`Button`의 실제 prop에 맞춘다. 지원 안 하면 인라인 `borderTop: '3px solid var(--brand)'`로 동등 표현.

- [ ] **Step 4: `EditView.jsx`(수정 폼) 작성**

```jsx
import React from 'react';
import { Card, Input, Button } from '@/design-system';
import { Eyebrow, FieldRow } from './parts';
import { EYEBROW, READONLY_LABELS, LABELS, PLACEHOLDERS } from '../profile.data';

/**
 * 수정 모드. 읽기 전용 필드는 그대로 보여 주고 bio/githubUrl/blogUrl만 입력 가능.
 * 저장(primary)/취소(outline) 버튼. 검증 에러는 각 Input의 error로 표시.
 */
export function EditView({ me, values, errors, field, onSave, onCancel, saving, formError }) {
  return (
    <Card accent="top">
      <Eyebrow>{EYEBROW}</Eyebrow>
      <h1 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}>
        {me.name}
      </h1>
      {me.gen && (
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
          {me.gen}
        </p>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        {READONLY_LABELS.map(([key, label]) => (
          <FieldRow key={key} label={label}>{me[key] ?? '—'}</FieldRow>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <Input
          label={LABELS.bio}
          as="textarea"
          rows={4}
          placeholder={PLACEHOLDERS.bio}
          value={values.bio}
          onChange={field('bio')}
          error={errors.bio}
        />
        <Input
          label={LABELS.githubUrl}
          placeholder={PLACEHOLDERS.githubUrl}
          value={values.githubUrl}
          onChange={field('githubUrl')}
          error={errors.githubUrl}
        />
        <Input
          label={LABELS.blogUrl}
          placeholder={PLACEHOLDERS.blogUrl}
          value={values.blogUrl}
          onChange={field('blogUrl')}
          error={errors.blogUrl}
        />
      </div>

      {formError && (
        <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--brand)' }}>
          {formError}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        <Button onClick={onSave} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>취소</Button>
      </div>
    </Card>
  );
}
```

> `Input`의 `as="textarea"`/`rows`/`label`/`error` prop은 `src/design-system/components/forms/Input`의 실제 API에 맞춘다. textarea 미지원이면 일반 `Input`으로 두고 후속 정리한다(임의 신규 스타일 금지).

- [ ] **Step 5: `index.js` 배럴 작성**

```js
export { Toast } from './Toast';
export { Eyebrow, FieldRow } from './parts';
export { ProfileView } from './ProfileView';
export { EditView } from './EditView';
```

- [ ] **Step 6: 타입/린트 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS. (아직 ProfilePage에서 import 안 함 — 미사용 export는 lint 무경고.)

- [ ] **Step 7: Commit**

```bash
git add src/features/profile/views/
git commit -m "feat(profile): add read/edit views and toast"
```

---

### Task 5: `ProfilePage.jsx` (가드 + 모드 상태)

**Files:**
- Create: `src/features/profile/ProfilePage.jsx`

**Interfaces:**
- Consumes: `@/shared/auth/auth.store`(`useAuthStore`), `@/shared/ui/Header`(`Header`), `react-router-dom`(`Navigate`), `./profile.queries`(`useMe`, `useUpdateMe`), `./useForm`(`useForm`), `./profile.validation`(`validateProfile`), `./profile.data`(`MESSAGES`, `TOAST`), `./views`.
- Produces: default export `ProfilePage` (라우트 element).

- [ ] **Step 1: `ProfilePage.jsx` 작성**

```jsx
import React, { useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/shared/ui/Header';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useForm } from './useForm';
import { useMe, useUpdateMe } from './profile.queries';
import { validateProfile } from './profile.validation';
import { MESSAGES, TOAST } from './profile.data';
import { ProfileView, EditView, Toast } from './views';

/**
 * /profile — 로그인한 회원의 개인 정보 보기/수정.
 * 미인증이면 /login으로 보낸다(가드). 진입 시 GET /api/me로 읽기 모드,
 * "수정"으로 수정 모드 전환, "저장"은 PATCH /api/me → 토스트 + 읽기 모드 복귀.
 * 422 fieldErrors는 폼 에러 맵으로, 그 외 오류는 폼 레벨 메시지로 표시.
 */
export default function ProfilePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <ProfileInner />;
}

function ProfileInner() {
  const { data: me, isLoading, isError } = useMe();
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const form = useForm({ bio: '', githubUrl: '', blogUrl: '' });

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const update = useUpdateMe({
    onSuccess: () => {
      setEditing(false);
      setFormError('');
      showToast(TOAST.saved);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const fieldErrors = err?.response?.data?.fieldErrors;
      if (status === 422 && fieldErrors) form.setErrors(fieldErrors);
      else setFormError(MESSAGES.saveError);
    },
  });

  const startEdit = () => {
    form.setValues({
      bio: me.bio ?? '',
      githubUrl: me.githubUrl ?? '',
      blogUrl: me.blogUrl ?? '',
    });
    form.setErrors({});
    setFormError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    form.reset();
    setFormError('');
    setEditing(false);
  };

  const save = () => {
    const errors = validateProfile(form.values);
    if (Object.keys(errors).length) {
      form.setErrors(errors);
      return;
    }
    setFormError('');
    update.mutate(form.values);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <Header />
      <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-9) var(--container-pad)' }}>
        {isLoading && (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>{MESSAGES.loading}</p>
        )}
        {isError && (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--brand)' }}>{MESSAGES.loadError}</p>
        )}
        {me && !editing && <ProfileView me={me} onEdit={startEdit} />}
        {me && editing && (
          <EditView
            me={me}
            values={form.values}
            errors={form.errors}
            field={form.field}
            onSave={save}
            onCancel={cancelEdit}
            saving={update.isPending}
            formError={formError}
          />
        )}
      </main>
      <Toast message={toast} />
    </div>
  );
}
```

> 가드를 `ProfilePage`(useMe 호출 전)에서 처리하고 실제 화면은 `ProfileInner`로 분리 — 미인증일 때 `/api/me` 쿼리가 아예 안 뜨도록. `--space-9`/`--container-pad` 등 토큰은 study/people에서 쓰는 것과 동일; 없으면 가장 가까운 기존 토큰으로.

- [ ] **Step 2: 타입/린트 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/ProfilePage.jsx
git commit -m "feat(profile): add ProfilePage with auth guard and view/edit toggle"
```

---

### Task 6: 라우팅 + 헤더 네비 연결

**Files:**
- Modify: `src/App.tsx` (import 블록 + `<Routes>` 내부)
- Modify: `src/shared/ui/Header.jsx` (로그인 칩 `span` → `<Link to="/profile">`)

**Interfaces:**
- Consumes: Task 5의 `ProfilePage` default export.

- [ ] **Step 1: `App.tsx`에 import 추가**

`import AdminPage …` 줄 아래에 추가:

```tsx
import ProfilePage from '@/features/profile/ProfilePage';
```

- [ ] **Step 2: `App.tsx`에 라우트 추가**

`<Route path="/admin" element={<AdminPage />} />` 아래에 추가:

```tsx
        <Route path="/profile" element={<ProfilePage />} />
```

- [ ] **Step 3: `Header.jsx` import에 `Link` 확인**

`Header.jsx`는 이미 `import { Link } from 'react-router-dom';` 함 — 추가 불필요.

- [ ] **Step 4: 프로필 칩을 링크로 교체**

`Header.jsx`의 로그인 분기에서 TODO 주석과 `<span … 프로필 칩 …>`를 다음으로 교체한다. 기존 칩의 인라인 스타일을 그대로 옮기되 바깥 요소만 `span` → `Link to="/profile"`로 바꾸고 `textDecoration: 'none'`을 추가한다:

```jsx
          {isAuthenticated ? (
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px 7px 8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                background: 'var(--surface-card)',
                color: 'var(--text-strong)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--w-semibold)',
                textDecoration: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  color: 'var(--text-on-brand)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                }}
              >
                {(user?.name ?? '회').trim().charAt(0)}
              </span>
              {user?.name ?? '프로필'}
            </Link>
          ) : (
            <Button size="sm" href="/apply">지원하기</Button>
          )}
```

- [ ] **Step 5: 타입/린트/빌드 확인**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 모두 PASS, 빌드 성공.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/shared/ui/Header.jsx
git commit -m "feat(profile): wire /profile route and header profile link"
```

---

### Task 7: 최종 검증

**Files:** 없음(검증만).

- [ ] **Step 1: 전체 검증 명령**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 셋 다 PASS.

- [ ] **Step 2: 수동 워크스루(백엔드 없이 가드/네비)**

Run: `npm run dev` 후 브라우저에서:
- 로그아웃 상태로 `/profile` 접근 → `/login`으로 리다이렉트되는지.
- 로그인(데모/실 토큰) 후 헤더 프로필 칩 클릭 → `/profile`로 이동하는지.
- `/api/me` 미구현이면 로딩→에러 문구가 토큰 스타일로 표시되는지(레이아웃 깨짐 없음).

Expected: 가드·네비·읽기 모드 스켈레톤 정상. (저장/422 등 서버 동작은 백엔드 연동 후 확인 — 본 계획 범위 밖.)

- [ ] **Step 3: 디자인 규칙 점검**

확인: 새 색/여백 하드코드 없음(모두 `var(--*)`), 이모지·그라데이션 없음, 라틴 문자는 `PROFILE` 아이라벨뿐, 한국어 존댓말. 위반 있으면 토큰으로 교체.

---

## Self-Review

**Spec coverage:**
- 목표(보기/수정/저장, 헤더 칩 이동) → Task 5, 6 ✓
- 수정/읽기 전용 필드 구분 → Task 4(ProfileView/EditView), Task 3(data) ✓
- UX 보기↔수정 토글, 저장 토스트, 취소 복원 → Task 5 ✓
- 파일 구조(profile feature 트리) → Task 2–5 ✓
- 라우팅/네비 변경(App.tsx, Header.jsx) → Task 6 ✓
- 데이터 계층(api/queries) → Task 3 ✓
- 검증(isUrl, bio 길이) → Task 2 ✓
- 인증 가드 & 에러(401/422/5xx) → Task 5 (가드 + onError 분기) ✓
- OpenAPI 계약 → Task 1 ✓
- 디자인(Card accent, 아이라벨, 헤어라인, Input/Button, Toast) → Task 4 ✓
- 검증 방법(순수함수 테스트, 빌드/타입) → Task 2(node 스크립트), Task 7 ✓

**Placeholder scan:** 코드 스텝은 모두 실제 코드 포함. "디자인시스템 실제 prop에 맞춤" 류 주석은 placeholder가 아니라 기존 컴포넌트 API 확인 지시(해당 파일 1줄 grep으로 해소).

**Type consistency:** `meKeys.me`(['me']), `getMe/updateMe`, `useMe/useUpdateMe`, `validateProfile`, `useForm` 반환(`values/setValues/errors/setErrors/field/reset`), `me` 필드명(`name/gen/email/studentId/authority/bio/githubUrl/blogUrl`)이 Task 1·3·4·5 전반에서 일치.

**미해결 가정(실행자 확인 필요):**
- `Card`의 `accent="top"`, `Button`의 `variant`/`size`, `Input`의 `as="textarea"`/`label`/`error` prop이 실제 디자인시스템에 존재하는지 — Task 4 시작 시 `src/design-system/components/{core/Card,core/Button,forms/Input}` 1회 확인 후 맞춤. 없으면 인라인 토큰 스타일로 동등 표현(임의 신규 토큰 금지).
