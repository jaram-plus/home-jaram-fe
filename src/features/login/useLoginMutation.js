import { useMutation } from '@tanstack/react-query';
import * as api from './login.api';

/**
 * 로그인 뮤테이션. 성공 시 login.api.js가 토큰을 auth store에 저장한다.
 * 호출부에서 onSuccess/onError를 주입한다.
 *   const m = useLoginMutation({ onSuccess, onError });
 *   m.mutate({ email, password });
 */
export function useLoginMutation(options) {
  return useMutation({ mutationFn: api.login, ...options });
}
