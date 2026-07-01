/**
 * admin 서버 상태 훅 (TanStack Query v5). (DEVELOPMENT.md §4·§5)
 *
 * adminKeys 로 쿼리키를 중앙화하고, 저장/승인 등 mutation 성공 시 관련 키를
 * invalidateQueries 합니다. 호출부는 옵션을 스프레드로 합성하세요.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './admin.api';

export const adminKeys = {
  all: ['admin'],
  list: (resource, params) => ['admin', 'list', resource, params],
  dashboard: () => ['admin', 'dashboard'],
  settings: () => ['admin', 'settings'],
};

/** 리소스 목록. params = { q, filters, sort, page, size } (searchParams 에서 조립). */
export function useResourceList(resource, params, options = {}) {
  return useQuery({
    queryKey: adminKeys.list(resource, params),
    queryFn: () => api.fetchList(resource, params),
    placeholderData: (prev) => prev, // 페이지·필터 전환 시 이전 데이터 유지 (keepPreviousData)
    ...options,
  });
}

/** 변경분 일괄 저장. onSuccess 에서 목록 invalidate. */
export function useBatchSave(resource, options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.saveBatch(resource, payload),
    ...options,
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', resource] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(data, vars, ctx);
    },
  });
}

export function useApproveApplication(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.approveApplication(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'applications'] });
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'member'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(...a);
    },
  });
}

export function useRejectApplication(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => api.rejectApplication(id, reason),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'applications'] });
      options.onSuccess?.(...a);
    },
  });
}

export function useDashboardStats(options = {}) {
  return useQuery({ queryKey: adminKeys.dashboard(), queryFn: api.fetchDashboardStats, ...options });
}

export function useSettings(options = {}) {
  return useQuery({ queryKey: adminKeys.settings(), queryFn: api.fetchSettings, ...options });
}
export function useSaveSettings(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveSettings,
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.settings() });
      options.onSuccess?.(...a);
    },
  });
}

export function useDriveExport(resource, options = {}) {
  return useMutation({ mutationFn: (args) => api.exportToDrive(resource, args), ...options });
}
