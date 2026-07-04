← [개발 가이드 목차](../DEVELOPMENT.md)

# 디렉터리 구조

```
src/
├─ main.tsx / App.tsx      # 엔트리 + 라우트 테이블
├─ app/                    # 전역 CSS(globals.css), favicon
├─ design-system/          # UI 토큰 + 공용 컴포넌트 (barrel: '@/design-system')
│  ├─ tokens/*.css         # colors·spacing·typography·fonts·effects
│  ├─ components/{core,forms,people}/
│  └─ assets/{logos,images,companies}/
├─ shared/                 # 기능 횡단 모듈
│  ├─ api/client.js        # axios 인스턴스 + 인터셉터
│  ├─ api/QueryProvider.jsx# react-query Provider
│  ├─ auth/auth.store.js   # zustand 인증 스토어 (persist)
│  ├─ member/enums.js      # 부서·직책 enum ↔ 한글 라벨
│  ├─ club/founding.js     # 창립연도 파생값(연차·기수·한글수사)
│  └─ ui/Header.jsx        # 공용 헤더
└─ features/               # 페이지 단위 기능 (→ feature-convention.md)
   ├─ landing/  login/  people/
   ├─ seminar/  study/  profile/  admin/
```

**설계 원칙**: feature-sliced. 페이지별로 폴더 하나. 기능 간 공유가 필요하면 `shared/` 또는 `design-system/`으로 올린다.
