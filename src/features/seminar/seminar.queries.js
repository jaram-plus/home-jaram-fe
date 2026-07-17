import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './seminar.api';

/**
 * react-query 훅 모음 — 세미나 페이지.
 * 목록/명단은 useQuery, 출석/개설은 useMutation. 개설 성공 시 목록을 무효화한다.
 * 호출부에서 onSuccess/onError를 주입한다.
 */

export const seminarKeys = {
  all: ['seminars'],
  roster: (key) => ['seminar-roster', key],
};

export function useSeminars() {
  return useQuery({ queryKey: seminarKeys.all, queryFn: api.listSeminars });
}

export function useRoster(rosterKey) {
  return useQuery({
    queryKey: seminarKeys.roster(rosterKey),
    queryFn: () => api.getRoster(rosterKey),
    enabled: !!rosterKey,
  });
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

export function useCreateSeminar(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSeminar,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: seminarKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}
