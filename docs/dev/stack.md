← [개발 가이드 목차](../DEVELOPMENT.md)

# 기술 스택

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

## 스크립트
```bash
pnpm dev        # vite 개발 서버
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 결과 미리보기
pnpm typecheck  # tsc --noEmit (allowJs=true, strict)
pnpm lint       # eslint
```

## 설정 요점
- **경로 alias**: `@/* → src/*` (vite.config.ts + tsconfig.json 양쪽 등록). import는 항상 `@/...` 사용.
- **tsconfig**: `allowJs`, `strict`, `noEmit`, `jsx: react-jsx`, `moduleResolution: bundler`.
- **환경변수**: `VITE_API_BASE_URL` (미설정 시 `http://localhost:8080`). `.env.example` 참조.
