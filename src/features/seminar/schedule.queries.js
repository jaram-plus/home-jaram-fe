import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './schedule.api';

/**
 * react-query 훅 모음 — 일정 탭. 목록은 useQuery, 등록/취소/세미나제출은 useMutation.
 * 셋 다 성공 시 일정 목록을 무효화한다(슬롯 상태가 바뀌므로).
 */

export const scheduleKeys = {
  all: ['schedules'],
};

export function useSchedules() {
  return useQuery({ queryKey: scheduleKeys.all, queryFn: api.listSchedules });
}

export function useClaimSlot(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.claimSlot,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

export function useCancelSlot(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelSlot,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSubmitSlotSeminar(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitSlotSeminar,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
      options?.onSuccess?.(...args);
    },
  });
}
