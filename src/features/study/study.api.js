/**
 * Study API — talks to the Spring backend via the shared axios client.
 * 경로와 응답 모양은 docs/api/openapi.yaml 이 단일 출처다.
 */
import { client } from '@/shared/api/client';

export async function listStudies() {
  const { data } = await client.get('/api/studies');
  return data;
}

// 상세 — 커리큘럼과 참여 인원 명단이 붙는다. 명단 때문에 로그인 필수이고,
// 목록(GET /api/studies)과 달리 permitAll 이 아니다. 학번 마스킹은 서버가 한다.
export async function getStudy({ studyId }) {
  const { data } = await client.get(`/api/studies/${studyId}`);
  return data;
}

// 내 활동 — { apps, studies }
export async function listMyActivity() {
  const { data } = await client.get('/api/studies/my');
  return data;
}

export async function applyStudy({ studyId, motive }) {
  const { data } = await client.post(`/api/studies/${studyId}/apply`, { motive });
  return data;
}

export async function createStudy(payload) {
  const { data } = await client.post('/api/studies', payload);
  return data;
}

export async function approveApplicant({ applicantId }) {
  const { data } = await client.post(`/api/studies/applicants/${applicantId}/approve`);
  return data;
}

export async function rejectApplicant({ applicantId, reason }) {
  const { data } = await client.post(`/api/studies/applicants/${applicantId}/reject`, { reason });
  return data;
}

// 그 스터디의 신청 목록 — { pending, approved }
export async function listStudyApplicants({ studyId }) {
  const { data } = await client.get(`/api/studies/${studyId}/applicants`);
  return data;
}

// 출석 격자 — { weeks, members }
export async function attendanceBoard({ studyId }) {
  const { data } = await client.get(`/api/studies/${studyId}/attendance`);
  return data;
}

// 내 주차별 출석 — { attended, taken, weeks }
export async function myAttendance({ studyId }) {
  const { data } = await client.get(`/api/studies/${studyId}/attendance/me`);
  return data;
}

// 그 주차의 출석을 통째로 바꾼다. present 는 출석한 memberId 배열.
export async function saveAttendance({ studyId, weekNo, present }) {
  await client.put(`/api/studies/${studyId}/weeks/${weekNo}/attendance`, { present });
}

export async function addWeek({ studyId, title, content }) {
  const { data } = await client.post(`/api/studies/${studyId}/weeks`, { title, content });
  return data;
}

export async function editWeek({ studyId, weekNo, title, content }) {
  await client.put(`/api/studies/${studyId}/weeks/${weekNo}`, { title, content });
}

export async function deleteWeek({ studyId, weekNo }) {
  await client.delete(`/api/studies/${studyId}/weeks/${weekNo}`);
}

// 반려된 내 신청을 지운다. 지우면 그 스터디에 다시 신청할 수 있다.
export async function deleteApplication({ applicationId }) {
  await client.delete(`/api/studies/applicants/${applicationId}`);
}

export async function closeRecruiting({ studyId }) {
  await client.post(`/api/studies/${studyId}/close-recruiting`);
}

export async function finishStudy({ studyId }) {
  await client.post(`/api/studies/${studyId}/finish`);
}
