/**
 * Landing API — 푸터 Connect 열의 외부 링크.
 *
 * 푸터는 비로그인 방문자도 보는 화면이라 관리자용 `/api/admin/settings`(bearer 필요)가
 * 아니라 공개 엔드포인트로 읽는다. 값을 고치는 쪽은 관리자 '설정' 탭 하나뿐이다.
 *
 * 백엔드 미완 — 경로는 제안 계약이다(`docs/api/openapi.yaml`의 SiteLinks).
 */
import { client } from '@/shared/api/client';

/** { github, instagram, blog, discord } — 설정되지 않은 채널은 null. */
export async function fetchSiteLinks() {
  const { data } = await client.get('/api/site/links');
  return data;
}
