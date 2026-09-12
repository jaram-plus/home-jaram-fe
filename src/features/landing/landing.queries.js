import { useQuery } from '@tanstack/react-query';
import * as api from './landing.api';

/** react-query 훅 — 랜딩. */

export const landingKeys = { links: ['site', 'links'] };

/**
 * 푸터의 외부 링크. 아직 백엔드가 없어 실패할 수 있는데, 그렇다고 푸터가 비면 안 되므로
 * 호출부는 빈 값으로 폴백한다(필수 항목은 주소 없이 이름만 남는다).
 *
 * 폴백이 있으므로 재시도하지 않는다 — 서버가 아직 없는 동안 랜딩을 열 때마다 실패
 * 요청이 세 번씩 나가고 푸터는 어차피 같은 모습이다. 주소는 임원이 '설정' 탭에서
 * 고칠 때만 바뀌므로 한 번 받으면 다시 받지 않는다.
 */
export function useSiteLinks() {
  return useQuery({
    queryKey: landingKeys.links,
    queryFn: api.fetchSiteLinks,
    retry: false,
    staleTime: Infinity,
  });
}
