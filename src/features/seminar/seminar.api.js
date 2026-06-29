/**
 * Seminar API for the seminar page — talks to the Spring backend via the shared
 * axios client. Exposes the same function signatures the UI already consumes.
 *
 * Backend not built yet — endpoint paths are a proposed REST contract (see the
 * commented stubs that previously lived here). Align them with the Spring repo's
 * CLAUDE.md when it lands.
 *
 * Failure contract:
 *   - `checkAttendance` rejects with `Object.assign(new Error(msg), { code:'INVALID_CODE' })`
 *     when the server rejects the attendance code; the view shows MESSAGES.codeWrong.
 */
import { client } from '@/shared/api/client';

export async function listSeminars() {
  const { data } = await client.get('/api/seminars');
  return data;
}

export async function getRoster(rosterKey) {
  const { data } = await client.get(`/api/seminars/${rosterKey}/roster`);
  return data;
}

export async function checkAttendance({ seminarId, code }) {
  try {
    const { data } = await client.post(`/api/seminars/${seminarId}/attend`, { code });
    return data;
  } catch (error) {
    // 4xx = 잘못된 출석 코드(필드 레벨), 그 외 = 서버 오류.
    const status = error.response?.status;
    const code = status >= 400 && status < 500 ? 'INVALID_CODE' : 'SERVER';
    throw Object.assign(new Error(error.response?.data?.message || 'attendance failed'), { code });
  }
}

export async function createSeminar(payload) {
  const { data } = await client.post('/api/seminars', payload);
  return data;
}
