← [개발 가이드 목차](../DEVELOPMENT.md)

# 코드 규칙 요약

- 컴포넌트는 `.jsx`(필요 시 `.d.ts` 페어, 타입 자동 인식).
- 스타일시트 진입점 1회 import(`import '@/design-system/styles.css'`).
- import는 `@/` alias.
- UI는 디자인 시스템 토큰/컴포넌트만. 임의 색·폰트·여백 금지.
- 주석·문구는 한국어 존댓말 톤(브랜드 보이스). 이모지 금지.
