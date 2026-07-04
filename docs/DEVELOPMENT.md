# JARAM 프론트엔드 개발 가이드

한양대 ERICA 컴퓨터학회 JARAM(자람) 웹 프론트엔드. 새 기능을 **기존 패턴 복붙 → 최소 수정**으로 붙일 수 있도록 구조·스택·관례를 정리한 문서.

> 브랜드/디자인 규칙은 이 문서 범위 밖. `CLAUDE.md`와 `.claude/skills/jaram-design/readme.md` 참조.

이 문서는 목차다. 각 항목은 독립된 문서이며, 필요한 항목만 열어 읽으면 된다.

## 목차

1. [기술 스택](dev/stack.md) — 프레임워크·언어·번들러·스크립트·경로 alias·환경변수
2. [디렉터리 구조](dev/directory-structure.md) — `src/` 트리와 feature-sliced 설계 원칙
3. [라우팅](dev/routing.md) — `App.tsx` 라우트 테이블
4. [Feature 폴더 관례](dev/feature-convention.md) — feature 파일 세트, 계층별 책임(Page/api/queries/views)
5. [데이터 흐름 & 백엔드 연동](dev/data-flow.md) — axios 클라이언트, 인증 스토어, API 계약, 도메인 enum
6. [새 기능 붙이는 체크리스트](dev/checklist.md) — 새 feature 추가 시 순서
7. [코드 규칙 요약](dev/code-rules.md) — 파일 페어링·import·스타일·톤 규칙
