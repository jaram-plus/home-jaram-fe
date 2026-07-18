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

/** 단건 조회 — PENDING/REJECTED 재제출 폼 프리필용. 본인/임원 아니면 서버가 404. */
export async function getSeminar(id) {
  const { data } = await client.get(`/api/seminars/${id}`);
  return data;
}

/**
 * REJECTED 세미나를 본인이 수정해 재제출한다 — 같은 id, approvalStatus는 PENDING으로,
 * rejectReason은 null로 돌아간다. attendanceCode는 보내지 않는다 — 임원이 "세미나 관리"
 * 표에서 직접 설정하는 값이라 재제출로 건드리지 않는다.
 */
export async function resubmitSeminar(id, form) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    description: opt(form.description),
    materialUrl: opt(form.materialUrl),
    target: form.target || [],
  };
  const { data } = await client.patch(`/api/seminars/${id}`, payload);
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
