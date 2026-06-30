/**
 * Auth API for the login page — talks to the Spring backend via the shared
 * axios client. Exposes the same function signatures the UI already consumes.
 *
 * Failure contract (unchanged, see login.data.js → LOGIN_ERROR):
 *   - `login` rejects with `Object.assign(new Error(msg), { code })` where
 *     code ∈ 'NOT_FOUND' | 'PENDING' | 'INVALID' | 'SERVER'.
 *   - `signup` rejects when the email is already taken (HTTP 409); the view
 *     shows MESSAGES.emailTaken on the email field.
 *
 * Backend not built yet — endpoint paths and the login error `code` field are a
 * proposed contract. Align them with the Spring repo's CLAUDE.md when it lands.
 */
import { client } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/auth.store';

const LOGIN_CODES = ['NOT_FOUND', 'PENDING', 'INVALID', 'SERVER'];

// Map an axios error → a login error whose `.code` the UI maps to copy.
// Prefer an explicit `code` in the response body; fall back to HTTP status.
function toLoginError(error) {
  const res = error.response;
  const bodyCode = res?.data?.code;
  let code = LOGIN_CODES.includes(bodyCode) ? bodyCode : null;
  if (!code) {
    if (res?.status === 404) code = 'NOT_FOUND';
    else if (res?.status === 403) code = 'PENDING'; // membership awaiting approval
    else if (res?.status === 401) code = 'INVALID'; // bad email/password
    else code = 'SERVER'; // 5xx, network failure, timeout
  }
  return Object.assign(new Error(res?.data?.message || 'login failed'), { code });
}

export async function login({ email, password }) {
  try {
    const { data } = await client.post('/api/auth/login', { email, password });
    // Expected body: { accessToken, user }. Store the JWT for subsequent calls.
    useAuthStore.getState().setAuth(data.accessToken, data.user ?? null);
    return data;
  } catch (error) {
    throw toLoginError(error);
  }
}

// 추가 정보(studentType/gen/faculty/phone/enrolled)는 제안 계약을 앞선 필드다.
// 백엔드 SignupRequest 확정 시 docs/api/openapi.yaml 와 키 이름을 맞춘다.
export async function signup({ name, studentId, email, password, studentType, gen, faculty, phone, enrolled }) {
  try {
    const { data } = await client.post('/api/auth/signup', {
      name,
      studentId,
      email,
      password,
      studentType,
      gen,
      faculty,
      phone,
      enrolled,
    });
    return data;
  } catch (error) {
    // 409 = 이미 신청된 이메일(필드 레벨), 그 외 = 폼 레벨 서버 오류.
    const code = error.response?.status === 409 ? 'EMAIL_TAKEN' : 'SERVER';
    throw Object.assign(new Error(error.response?.data?.message || 'signup failed'), { code });
  }
}

export async function requestReset({ email }) {
  const { data } = await client.post('/api/auth/password/reset-request', { email });
  return data;
}

export async function resetPassword({ token, password }) {
  const { data } = await client.post('/api/auth/password/reset', { token, password });
  return data;
}
