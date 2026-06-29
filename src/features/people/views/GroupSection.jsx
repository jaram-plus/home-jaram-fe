import React from 'react';
import { GroupHeading } from './parts';
import { PersonCard } from './PersonCard';

/**
 * One group of people: optional department heading + responsive grid of cards.
 * Used for 임원 (each 부서 a group) and the single unnamed group of 기여자/졸업자.
 */
export function GroupSection({ group }) {
  return (
    <div>
      {group.heading && <GroupHeading>{group.heading}</GroupHeading>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 22 }}>
        {group.members.map((m) => (
          <PersonCard key={m.name} person={m} />
        ))}
      </div>
    </div>
  );
}
