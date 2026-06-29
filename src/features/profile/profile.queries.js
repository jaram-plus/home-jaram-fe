import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './profile.api';

/**
 * react-query 훅 — 프로필 페이지. 내 정보는 useQuery, 수정은 useMutation.
 * 수정 성공 시 ['me']를 무효화해 다시 불러오고, 호출부 onSuccess를 실행한다.
 */
export const meKeys = { me: ['me'] };

export function useMe() {
  return useQuery({ queryKey: meKeys.me, queryFn: api.getMe });
}

export function useUpdateMe(options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateMe,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: meKeys.me });
      options?.onSuccess?.(...args);
    },
  });
}
