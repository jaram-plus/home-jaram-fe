import { useQuery } from '@tanstack/react-query';
import * as api from './people.api';

/** react-query 훅 — 사람들 페이지. 탭별 그룹을 서버에서 한 번에 받아온다. */

export const peopleKeys = { all: ['people'] };

export function usePeople() {
  return useQuery({ queryKey: peopleKeys.all, queryFn: api.listPeople });
}
