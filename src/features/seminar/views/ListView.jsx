import React from 'react';
import { Pill, EmptyState } from './parts';
import { SeminarCard } from './SeminarCard';
import { EMPTY } from '../seminar.data';

// 표시 순서: 예정 → 종료 → 전체. 최초 선택 탭은 SeminarPage의 useState('all') 그대로다.
const FILTERS = [
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
  { key: 'all', label: '전체' },
];

// 'upcoming' filter shows both upcoming and in-progress seminars.
// (filter keys are UI selectors; status values are wire enum SeminarStatus, UPPER.)
function pass(filter, status) {
  if (filter === 'all') return true;
  if (filter === 'upcoming') return status === 'UPCOMING' || status === 'ONGOING';
  return status === 'ENDED';
}

/** List view — filter chips + the seminar schedule. */
export function ListView({ seminars, filter, onFilter, attended, onAttend }) {
  const shown = seminars.filter((s) => pass(filter, s.status));
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
        <div style={{ display: 'grid', gap: 18 }}>
          {shown.map((s) => (
            <SeminarCard key={s.id} seminar={s} attended={!!attended[s.id]} onAttend={onAttend} />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.seminars}</EmptyState>
      )}
    </div>
  );
}
