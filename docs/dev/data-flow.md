← [개발 가이드 목차](../DEVELOPMENT.md)

# 데이터 흐름 & 백엔드 연동

```
View ─(이벤트)→ Page ─(훅)→ queries.js ─(fn)→ api.js ─(client)→ Spring
                                                    │
                                        axios 인터셉터: JWT 부착 / 401 처리
```

## axios 클라이언트 (`shared/api/client.js`)
- baseURL = `VITE_API_BASE_URL ?? http://localhost:8080` (로컬 개발 기본값, env로 재정의), timeout 10s, JSON 헤더.
- **요청 인터셉터**: 스토어의 `accessToken` 있으면 `Authorization: Bearer <token>` 부착.
- **응답 인터셉터**: 토큰이 있는 상태에서 401 → 세션 클리어(만료/무효 토큰). 로그인 중 401은 토큰이 없으므로 영향 없음.

## 인증 스토어 (`shared/auth/auth.store.js`)
zustand + persist(localStorage 키 `jaram-auth`). `accessToken`·`user`·`isAuthenticated` 보관.
```js
useAuthStore.getState().accessToken   // React 밖 (인터셉터 등)
useAuthStore((s) => s.user)           // React 안
setAuth(token, user) / clear()
```

## API 계약
- 단일 계약 소스: **`docs/api/openapi.yaml`** (OpenAPI 3.1). 설계·usecase: `docs/superpowers/specs/2026-06-29-jaram-backend-design.md`.
- 백엔드(Spring Boot)는 별도 레포, JSON만 제공한다. DTO 네이밍·인증 방식은 백엔드 CLAUDE.md 기준.
- **주의**: 일부 엔드포인트 경로는 아직 제안 상태(백엔드 미완). 백엔드 확정 시 정렬.

## 도메인 enum
`shared/member/enums.js`가 부서(`MemberDepartment`)·직책(`MemberTitle`) 단일 소스. 와이어는 enum **키**, 화면은 한글 **라벨** 매핑. 새 부서/직책 추가는 여기 한 곳만 수정.
