import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './seminar.api';

/**
 * react-query 훅 모음 — 세미나 페이지.
 * 목록/명단은 useQuery, 출석은 useMutation. 호출부에서 onSuccess/onError를 주입한다.
 */

export const seminarKeys = {
  all: ['seminars'],
};

export function useSeminars() {
  return useQuery({ queryKey: seminarKeys.all, queryFn: api.listSeminars });
}

export function useAttend(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.checkAttendance,
    ...options,
    onSuccess: (...args) => {
      // 출석하면 서버의 attendedAt이 바뀌므로 목록을 다시 받아 온다.
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

/** 단건 조회 — 재제출 폼이 열릴 때만 조회한다(`options.enabled`). */
export function useSeminar(id, options) {
  return useQuery({
    queryKey: ['seminar', id],
    queryFn: () => api.getSeminar(id),
    enabled: !!id,
    ...options,
  });
}

export function useResubmitSeminar(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form, startsAt }) => api.resubmitSeminar(id, form, startsAt),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      qc.invalidateQueries({ queryKey: ['schedules'] });
      options?.onSuccess?.(...args);
    },
  });
}
