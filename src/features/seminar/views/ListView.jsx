import React from 'react';
import { Pill, EmptyState } from './parts';
import { SeminarCard } from './SeminarCard';
import { EMPTY } from '../seminar.data';

// 표시 순서: 예정 → 종료 → 결석 → 전체. 최초 선택 탭은 SeminarPage의 useState('upcoming')다.
const FILTERS = [
  { key: 'upcoming', label: '예정' },
  { key: 'ended', label: '종료' },
  { key: 'absent', label: '결석' },
  { key: 'all', label: '전체' },
];

// 'upcoming' filter shows both upcoming and in-progress seminars.
// 'absent'는 로그인 회원이 결석한(종료 + attendedAt 없음) 세미나만 보여준다 — 비로그인은 판정 근거가 없어 항상 빈 목록이다.
// (filter keys are UI selectors; status values are wire enum SeminarStatus, UPPER.)
function pass(filter, seminar, isLoggedIn) {
  if (filter === 'all') return true;
  if (filter === 'upcoming') return seminar.status === 'UPCOMING' || seminar.status === 'ONGOING';
  if (filter === 'absent') return seminar.status === 'ENDED' && isLoggedIn && !seminar.attendedAt;
  return seminar.status === 'ENDED';
}

/** List view — filter chips + the seminar schedule. */
export function ListView({ seminars, filter, onFilter, attended, isLoggedIn, onAttend, onOpenDetail }) {
  const shown = seminars.filter((s) => pass(filter, s, isLoggedIn));
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
            <SeminarCard
              key={s.id}
              seminar={s}
              attended={!!attended[s.id]}
              isLoggedIn={isLoggedIn}
              onAttend={onAttend}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.seminars}</EmptyState>
      )}
    </div>
  );
}
