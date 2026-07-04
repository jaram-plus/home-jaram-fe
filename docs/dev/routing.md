← [개발 가이드 목차](../DEVELOPMENT.md)

# 라우팅

`src/App.tsx`의 단일 `<Routes>` 테이블에서 관리.

| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | LandingPage | |
| `/login` | LoginPage | |
| `/apply` | LoginPage | `initialView="signup"` prop |
| `/people` | PeoplePage | |
| `/seminar` | SeminarPage | |
| `/study` | StudyPage | |
| `/admin` | AdminPage | |
| `/profile` | ProfilePage | |

새 페이지 추가 = feature 폴더 만들고 `App.tsx`에 `<Route>` 한 줄 추가.
