/**
 * 프로필 API — 공유 axios client로 Spring 백엔드의 /api/me 와 통신.
 * 백엔드 미구현 상태 — 경로는 docs/api/openapi.yaml 계약 기준.
 */
import { client } from '@/shared/api/client';

export async function getMe() {
  const { data } = await client.get('/api/me');
  return data; // MeProfile
}

export async function updateMe(payload) {
  // payload: { bio, githubUrl, blogUrl }
  const { data } = await client.patch('/api/me', payload);
  return data; // MeProfile
}
