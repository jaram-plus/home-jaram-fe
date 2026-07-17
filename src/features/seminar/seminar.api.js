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

/**
 * 참석자 미리보기 — 로그인한 회원 누구나 조회한다. officer 전용 roster와 달리
 * 학번(sid)이 없다. 응답: { count, list: [{ name, at }] }.
 */
export async function getAttendeePreview(seminarId) {
  const { data } = await client.get(`/api/seminars/${seminarId}/attendees`);
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

/**
 * 폼 값을 SeminarCreateRequest(openapi)에 맞춰 정제해 보낸다.
 * - 빈 문자열 옵션 필드는 null 로 (스펙은 nullable).
 * - startsAt: datetime-local("2026-06-30T19:00") → ISO-8601(UTC).
 */
export async function createSeminar(form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    startsAt: new Date(form.startsAt).toISOString(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    place: opt(form.place),
    mode: opt(form.mode),
    attendanceCode: opt(form.attendanceCode),
    materialUrl: opt(form.materialUrl),
    description: opt(form.description),
    target: form.target || [],
  };
  const { data } = await client.post('/api/seminars', payload);
  return data;
}
