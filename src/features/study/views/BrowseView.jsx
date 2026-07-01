import React from 'react';
import { Pill, EmptyState } from './parts';
import { StudyCard } from './StudyCard';
import { EMPTY } from '../study.data';

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'RECRUITING', label: '모집 중' },
  { key: 'ONGOING', label: '진행 중' },
];

/** Browse view — filter chips + responsive study grid. */
export function BrowseView({ studies, filter, onFilter, onApply }) {
  const shown = studies.filter((s) => (filter === 'all' ? true : s.status === filter));
  return (
    <div className="jr-anim">
      <div style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <Pill key={f.key} active={filter === f.key} onClick={() => onFilter(f.key)}>
            {f.label}
          </Pill>
        ))}
      </div>

      {shown.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 22 }}>
          {shown.map((s) => (
            <StudyCard key={s.id} study={s} onApply={onApply} />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.studies}</EmptyState>
      )}
    </div>
  );
}
