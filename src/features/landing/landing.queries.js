import { useQuery } from '@tanstack/react-query';
import * as api from './landing.api';

/** react-query 훅 — 랜딩. */

export const landingKeys = { links: ['site', 'links'] };

/**
 * 푸터의 외부 링크. 아직 백엔드가 없어 실패할 수 있는데, 그렇다고 푸터가 비면 안 되므로
 * 호출부는 빈 값으로 폴백한다(필수 항목은 주소 없이 이름만 남는다).
 */
export function useSiteLinks() {
  return useQuery({ queryKey: landingKeys.links, queryFn: api.fetchSiteLinks });
}
