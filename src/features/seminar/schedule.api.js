/**
 * Schedule API for the seminar page — talks to the Spring backend via the shared
 * axios client. Seminar와 별개 리소스라 seminar.api.js와 나란히 둔다.
 *
 * Failure contract:
 *   - `claimSlot` rejects with `Object.assign(new Error(msg), { code:'SLOT_TAKEN' })`
 *     when the server returns 409 (정원 초과·이미 참·잠김); other 4xx/5xx are 'SERVER'.
 */
import { client } from '@/shared/api/client';

export async function listSchedules() {
  const { data } = await client.get('/api/schedules');
  return data;
}

export async function claimSlot({ scheduleId, index }) {
  try {
    const { data } = await client.post(`/api/schedules/${scheduleId}/slots/${index}/claim`);
    return data;
  } catch (error) {
    const status = error.response?.status;
    const code = status === 409 ? 'SLOT_TAKEN' : 'SERVER';
    throw Object.assign(new Error(error.response?.data?.message || 'claim failed'), { code });
  }
}

export async function cancelSlot({ scheduleId, index }) {
  const { data } = await client.delete(`/api/schedules/${scheduleId}/slots/${index}`);
  return data;
}

/**
 * 슬롯에서 세미나 제출. SeminarCreateRequest와 같은 필드를 쓰되 startsAt/place/mode는
 * Schedule 값으로 서버가 채우므로 보내지 않는다. attendanceCode도 보내지 않는다 — 학회원이
 * 스스로 정하지 않고, 승인 후 임원이 "세미나 관리" 표에서 직접 설정한다.
 */
export async function submitSlotSeminar({ scheduleId, index, form }) {
  const opt = (v) => (v && v.trim() ? v.trim() : null);
  const payload = {
    title: form.title.trim(),
    speaker: opt(form.speaker),
    topic: opt(form.topic),
    description: opt(form.description),
    materialUrl: opt(form.materialUrl),
    target: form.target || [],
  };
  const { data } = await client.post(`/api/schedules/${scheduleId}/slots/${index}/seminar`, payload);
  return data;
}
