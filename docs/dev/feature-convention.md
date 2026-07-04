← [개발 가이드 목차](../DEVELOPMENT.md)

# Feature 폴더 관례 (핵심)

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

## 계층 책임
- **Page**: react-query 훅 호출 → 로딩/에러/데이터 상태 → view에 props로 내려줌. onSuccess/onError 주입.
- **api.js**: 순수 HTTP. 요청 payload를 OpenAPI DTO에 맞춰 정제(빈 문자열→null, datetime-local→ISO-8601 등). 실패는 `code` 붙인 Error로 던져 UI가 필드 에러/서버 에러 구분.
- **queries.js**: `xxxKeys` 객체로 쿼리키 중앙화. mutation 성공 시 관련 키 `invalidateQueries`. 호출부 옵션은 스프레드로 합성.
- **views/**: 상태 없는 표현 위주. 디자인 시스템 컴포넌트/토큰만 사용.
