← [개발 가이드 목차](../DEVELOPMENT.md)

# 새 기능 붙이는 체크리스트

1. 가장 비슷한 기존 feature 폴더 복사 → 이름 치환.
2. `<name>.api.js`에 엔드포인트 함수 작성 (payload 정제·실패 계약). OpenAPI와 대조.
3. `<name>.queries.js`에 훅 + `xxxKeys` 정의. mutation 무효화 대상 지정.
4. `<Name>Page.jsx`에서 훅 조립, view에 props 전달.
5. `views/`에 화면 조각 작성 — **디자인 시스템 토큰/컴포넌트만** 사용.
6. `App.tsx`에 `<Route>` 추가.
7. 새 도메인 enum이면 `shared/member/enums.js`(또는 적절한 shared)에 반영.
8. `pnpm typecheck && pnpm lint`로 확인.
