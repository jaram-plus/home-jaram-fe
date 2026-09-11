/**
 * 프로필 API — 공유 axios client로 Spring 백엔드의 /api/me 와 통신.
 * 경로·스키마는 docs/api/openapi.yaml 계약 기준.
 */
import { client } from '@/shared/api/client';

export async function getMe() {
  const { data } = await client.get('/api/me');
  return data; // MeProfile
}

/** 재등록 신청. 임원이 승인해야 활동이 풀린다. 두 번 눌러도 처음 시각이 남는다. */
export async function requestReregistration() {
  await client.post('/api/me/reregister');
}

/** 본인 탈퇴. 개인정보는 6개월 뒤 서버가 파기한다. */
export async function withdrawMe() {
  await client.post('/api/me/withdraw');
}

export async function updateMe(payload) {
  // payload: { phone, bio, githubUrl, blogUrl } — faculty는 읽기 전용이라 보내지 않는다.
  const { data } = await client.patch('/api/me', payload);
  return data; // MeProfile
}
