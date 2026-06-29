/**
 * People API for the people page — talks to the Spring backend via the shared
 * axios client.
 *
 * Backend not built yet — endpoint path is a proposed REST contract. Align it
 * with the Spring repo's CLAUDE.md when it lands.
 *
 * `listPeople` returns the per-tab structure the page consumes:
 *   { exec: { desc, empty, groups }, contrib: {…}, grad: {…} }
 * Each `groups[]` is `{ heading, members[] }` (see people.data.js for the seed
 * shape kept as a reference).
 */
import { client } from '@/shared/api/client';

export async function listPeople() {
  const { data } = await client.get('/api/people');
  return data;
}
