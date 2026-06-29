/**
 * Study API for the study page — talks to the Spring backend via the shared
 * axios client. Exposes the same function signatures the UI already consumes.
 *
 * Backend not built yet — endpoint paths are a proposed REST contract (see the
 * commented stubs that previously lived here). Align them with the Spring repo's
 * CLAUDE.md when it lands.
 */
import { client } from '@/shared/api/client';

export async function listStudies() {
  const { data } = await client.get('/api/studies');
  return data;
}

export async function listPending() {
  const { data } = await client.get('/api/studies/pending');
  return data;
}

export async function listApplicants() {
  const { data } = await client.get('/api/studies/applicants');
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

export async function approveStudy({ studyId }) {
  const { data } = await client.post(`/api/studies/${studyId}/approve`);
  return data;
}

export async function rejectStudy({ studyId, reason }) {
  const { data } = await client.post(`/api/studies/${studyId}/reject`, { reason });
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
