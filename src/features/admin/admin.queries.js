import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './admin.api';

/**
 * react-query 훅 — 관리자 가입 승인 페이지.
 * 대기 목록은 useQuery, 승인/거절은 useMutation. 성공 시 대기 목록을 무효화해
 * 다시 불러온다. 호출부에서 onSuccess/onError를 주입한다.
 */

export const adminKeys = {
  pendingMembers: ['admin', 'members', 'pending'],
};

export function usePendingMembers() {
  return useQuery({ queryKey: adminKeys.pendingMembers, queryFn: api.listPendingMembers });
}

// 성공 후 무효화할 쿼리 키를 받아 useMutation을 만든다.
function useInvalidatingMutation(mutationFn, invalidate, options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(...args);
    },
  });
}

export function useApproveMember(options) {
  return useInvalidatingMutation(api.approveMember, [adminKeys.pendingMembers], options);
}

export function useRejectMember(options) {
  return useInvalidatingMutation(api.rejectMember, [adminKeys.pendingMembers], options);
}
