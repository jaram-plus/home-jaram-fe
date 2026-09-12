import React from 'react';
import { ScheduleCard } from './ScheduleCard';
import { EmptyState } from './parts';
import { EMPTY } from '../seminar.data';

/** 일정 대시보드 — 필터 없이 전체 일정을 startsAt 오름차순 카드로. */
export function ScheduleView({ schedules, currentUserId, isLoggedIn, onClaim, onCancel, onCreateSeminar, onEditSeminar }) {
  const sorted = [...schedules].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  return (
    <div className="jr-anim">
      {sorted.length > 0 ? (
        <div className="jr-schedule-grid">
          {sorted.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              onClaim={onClaim}
              onCancel={onCancel}
              onCreateSeminar={onCreateSeminar}
              onEditSeminar={onEditSeminar}
            />
          ))}
        </div>
      ) : (
        <EmptyState>{EMPTY.schedules}</EmptyState>
      )}
    </div>
  );
}
