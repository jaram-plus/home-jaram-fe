import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './admin.css';
import { AdminShell } from './views';
import { DashboardView } from './views';
import { TableView } from './views';
import { SettingsView } from './views';
import { ScheduleAdminView } from './views';
import { StudyAdminView } from './views';

/**
 * /admin 기능 엔트리. App.tsx 에는 스플랫 라우트 한 줄만 추가합니다 (DEVELOPMENT.md §3).
 *
 *   <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
 *
 * 하위 화면은 여기 중첩 라우트로 나눠 URL 로 상태화합니다 (새로고침·공유·뒤로가기 보존).
 *   /admin/dashboard  /admin/members(?tab=member|exec|contrib|grad)
 *   /admin/seminars   /admin/studies   /admin/applications   /admin/settings
 *   /admin/schedules(세미나 일정)   /admin/seminar-approvals(세미나 승인)
 * 표의 검색·필터·정렬·페이지도 searchParams(?q=&sort=&page=…)로 직렬화됩니다 (TableView).
 * `schedules`와 `studies`는 예외 — 즉시 반영되는 단건 액션(슬롯 해제, 개설 승인)이
 * 배치저장 모델에 맞지 않아 커스텀 뷰다. `studies`는 목록 탭에서만 TableView를 품는다.
 *
 * AdminShell 은 <Outlet/> 을 감싸는 레이아웃 라우트라, 화면 전환 시 사이드바·헤더는
 * 리렌더되지 않고 main 만 교체됩니다.
 */
export default function AdminPage() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="members" element={<TableView />} />
        <Route path="seminars" element={<TableView resource="seminars" />} />
        <Route path="studies" element={<StudyAdminView />} />
        <Route path="applications" element={<TableView resource="applications" />} />
        <Route path="schedules" element={<ScheduleAdminView />} />
        <Route path="seminar-approvals" element={<TableView resource="seminarApprovals" />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
