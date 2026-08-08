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
  memberDetail: (id) => ['admin', 'member', id],
  seminarAttendees: (id) => ['admin', 'seminarAttendees', id],
  attendanceCandidates: () => ['admin', 'attendanceCandidates'],
  gradDetail: (id) => ['admin', 'grad', id],
  assignable: () => ['admin', 'assignable'],
  contribCandidates: () => ['admin', 'contribCandidates'],
  dashboard: () => ['admin', 'dashboard'],
  settings: () => ['admin', 'settings'],
  schedules: () => ['admin', 'schedules'],
};

/** 리소스 목록. params = { q, filters, sort, page, size } (searchParams 에서 조립). */
export function useResourceList(resource, params, options = {}) {
  return useQuery({
    queryKey: adminKeys.list(resource, params),
    queryFn: () => api.fetchList(resource, params),
    // 페이지·필터 전환 시 이전 데이터 유지(keepPreviousData). 단, 이전 쿼리가 같은
    // resource 였을 때만 — 아니면 탭을 바꿀 때 이전 탭 데이터가 잠깐 비쳐 보인다.
    placeholderData: (prev, prevQuery) => (prevQuery?.queryKey[2] === resource ? prev : undefined),
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

export function useSchedulesAdmin(options = {}) {
  return useQuery({ queryKey: adminKeys.schedules(), queryFn: api.fetchSchedules, ...options });
}

export function useCreateSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSchedule,
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useLockSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.lockSchedule(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useUnlockSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.unlockSchedule(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useDeleteSchedule(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteSchedule(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

export function useForceUnassignSlot(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, index }) => api.forceUnassignSlot(scheduleId, index),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: adminKeys.schedules() });
      options.onSuccess?.(...a);
    },
  });
}

/* ── 세미나 상세 · 출석 관리 ────────────────────────────────────────────
 * 표의 모아 저장과 달리 모두 즉시 커밋된다. 출석 관련 응답은 갱신된 명단이라
 * 성공 시 명단 캐시를 그대로 갈아 끼우고(setQueryData) 다시 받지 않는다.
 */

/** 세미나 개설. 공개 목록에도 바로 오르므로 세미나 캐시를 함께 비운다. */
export function useCreateSeminar(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSeminar,
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'seminars'] });
      qc.invalidateQueries({ queryKey: ['seminars'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(...a);
    },
  });
}

/** 상세 모달의 내용 저장. 성공하면 목록을 다시 불러온다(버전이 올라간다). */
export function useSaveSeminarDetail(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveSeminarDetail,
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'seminars'] });
      options.onSuccess?.(...a);
    },
  });
}

export function useGenerateAttendanceCode(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.generateAttendanceCode(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'seminars'] });
      options.onSuccess?.(...a);
    },
  });
}

export function useCloseAttendance(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.closeSeminarAttendance(id),
    ...options,
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'seminars'] });
      options.onSuccess?.(...a);
    },
  });
}

/** 출석 명단. 모달이 열려 id 가 있을 때만 조회합니다. */
export function useSeminarAttendees(id, options = {}) {
  return useQuery({
    queryKey: adminKeys.seminarAttendees(id),
    queryFn: () => api.fetchSeminarAttendees(id),
    enabled: !!id,
    ...options,
  });
}

export function useAddSeminarAttendee(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addSeminarAttendee,
    ...options,
    onSuccess: (roster, vars, ctx) => {
      qc.setQueryData(adminKeys.seminarAttendees(vars.id), roster);
      options.onSuccess?.(roster, vars, ctx);
    },
  });
}

export function useRemoveSeminarAttendee(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.removeSeminarAttendee,
    ...options,
    onSuccess: (roster, vars, ctx) => {
      qc.setQueryData(adminKeys.seminarAttendees(vars.id), roster);
      options.onSuccess?.(roster, vars, ctx);
    },
  });
}

/** 수기 출석 처리 후보 (참석자 추가 목록). */
export function useAttendanceCandidates(options = {}) {
  return useQuery({
    queryKey: adminKeys.attendanceCandidates(),
    queryFn: api.fetchAttendanceCandidates,
    ...options,
  });
}

/** 임원으로 지정할 수 있는 회원 목록 (임원 지정 모달). */
export function useAssignableMembers(options = {}) {
  return useQuery({ queryKey: adminKeys.assignable(), queryFn: api.fetchAssignableMembers, ...options });
}

/**
 * 임원 지정. 성공하면 임원진·회원 목록과 지정 후보를 모두 다시 불러옵니다 —
 * 회장을 넘겼다면 내 임기도 끝나므로 내 상세(권한 판정 근거)까지 무효화합니다.
 */
export function useAssignExec(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.assignExec,
    ...options,
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list'] });
      qc.invalidateQueries({ queryKey: adminKeys.assignable() });
      qc.invalidateQueries({ queryKey: ['admin', 'member'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(data, vars, ctx);
    },
  });
}

/** 기여자로 등록할 수 있는 회원 목록 (기여자 추가 모달). */
export function useContribCandidates(options = {}) {
  return useQuery({ queryKey: adminKeys.contribCandidates(), queryFn: api.fetchContribCandidates, ...options });
}

/**
 * 기여자 등록. 성공하면 기여자 목록과 후보 목록을 함께 다시 불러옵니다 —
 * 방금 등록한 회원은 후보에서 빠지고 기여자 표에 나타나야 합니다.
 */
export function useAddContributor(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addContributor,
    ...options,
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list'] });
      qc.invalidateQueries({ queryKey: adminKeys.contribCandidates() });
      qc.invalidateQueries({ queryKey: ['admin', 'member'] });
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() });
      options.onSuccess?.(data, vars, ctx);
    },
  });
}

/** 회원 상세. 모달이 열려 id 가 있을 때만 조회합니다. */
export function useMemberDetail(id, options = {}) {
  return useQuery({
    queryKey: adminKeys.memberDetail(id),
    queryFn: () => api.fetchMemberDetail(id),
    enabled: !!id,
    ...options,
  });
}

/** 졸업생 상세. 모달이 열려 id 가 있을 때만 조회합니다. */
export function useGradDetail(id, options = {}) {
  return useQuery({
    queryKey: adminKeys.gradDetail(id),
    queryFn: () => api.fetchGradDetail(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * 졸업생 상세 저장(졸업연도·이력). 표의 모아 저장과 달리 즉시 커밋합니다 —
 * 성공하면 졸업생 목록의 '현재 소속·직무' 가 새 이력에서 다시 파생되어야 합니다.
 */
export function useSaveGradDetail(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveGradDetail,
    ...options,
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'list', 'grad'] });
      qc.invalidateQueries({ queryKey: adminKeys.gradDetail(vars.id) });
      options.onSuccess?.(data, vars, ctx);
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
