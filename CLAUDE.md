# Frontend — JARAM (자람) 웹

한양대 ERICA 컴퓨터학회 JARAM의 React 프론트엔드입니다.

## UI / 디자인 규칙 (필수)
- 모든 UI는 **`src/design-system`의 토큰과 컴포넌트만** 사용한다.
  - 컴포넌트: `import { Button, Card, SectionHeader, Stat, Tag, Input, MemberCard } from '@/design-system'`
  - 색·여백·타이포·그림자·radius는 **`tokens/*.css`의 CSS 변수**(`var(--brand)`, `var(--paper-200)`, `var(--space-5)`, `var(--shadow-sm)` …)만 쓴다.
- 새 색·폰트·여백을 임의로 만들지 않는다. 필요한 토큰이 없으면 가장 가까운 기존 토큰을 쓰고, 정말 필요하면 토큰부터 추가한다.
- 컴포넌트가 부족하면 `src/design-system`의 시각 원칙과 토큰으로 **같은 방식**으로 새로 만든다(인라인 스타일 + CSS 변수).
- 전체 브랜드 규칙은 **`.claude/skills/jaram-design/readme.md`** 참조.

## 브랜드 핵심
- 포인트 컬러: 버밀리언 **#E50113** (`var(--brand)`). 바탕: 따뜻한 종이 **#F7F1E5**. 잉크: 따뜻한 먹색 **#1C1813** (순흑 금지).
- 타입: MapoGeumbitnaru(디스플레이/히어로) · Gowun Batang(세리프 숫자·에디토리얼) · Pretendard(본문/UI).
- 보이스: **한국어 · 존댓말 · 따뜻하고 차분한 자부심**. 과장보다 깊이(41년·1984·500+). **이모지 금지**. 라틴 문자는 소문자 대문자 아이라벨로만.
- 느낌: 명문·전통의 에디토리얼. 평평한 종이, 헤어라인 룰, 빨강 강조, 절제된 모서리, 따뜻한 낮은 그림자. **그라데이션 금지**.
- 아이콘: Heroicons(outline, 24px, stroke-2) 또는 Lucide. 단색 `currentColor`. 장식용 SVG·이모지 금지.

## 코드 규칙
- 컴포넌트는 `.jsx` + `.d.ts` 페어. 타입은 자동 인식된다.
- 스타일시트는 앱 진입점에서 **한 번만** `import './design-system/styles.css'`.
- 경로 alias `@/* → src/*` 사용 권장.

## 백엔드 연동
- API 베이스 URL: `<여기에 채우기>`
- API 스펙 위치: `<백엔드 레포 URL 또는 OpenAPI 문서 경로>`
- 백엔드(Spring Boot)는 별도 레포이며 JSON만 제공한다. DTO 네이밍·인증 방식은 해당 레포 CLAUDE.md를 따른다.
