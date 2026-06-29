/**
 * Admin API — officer-only membership approval (UC-A5). Talks to the Spring
 * backend via the shared axios client; the JWT (officer authority) is attached
 * by the request interceptor in shared/api/client.js.
 *
 * Endpoints per docs/api/openapi.yaml:
 *   GET  /api/admin/members/pending      → PendingMember[]
 *   POST /api/admin/members/{id}/approve → status=ACTIVE (로그인 가능)
 *   POST /api/admin/members/{id}/reject  → status=REJECTED ({ reason } 필수)
 */
import { client } from '@/shared/api/client';

export async function listPendingMembers() {
  const { data } = await client.get('/api/admin/members/pending');
  return data;
}

export async function approveMember({ memberId }) {
  const { data } = await client.post(`/api/admin/members/${memberId}/approve`);
  return data;
}

export async function rejectMember({ memberId, reason }) {
  const { data } = await client.post(`/api/admin/members/${memberId}/reject`, { reason });
  return data;
}
