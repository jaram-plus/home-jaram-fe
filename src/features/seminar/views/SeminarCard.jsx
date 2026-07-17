import React from 'react';
import { Button, Tag } from '@/design-system';
import { TopicChip } from './parts';
import { STATUS_BADGE, ATTEND_LABEL, ENDED_CHIP, COUNTDOWN_LABEL } from '../seminar.data';
import { useAttendanceCountdown } from '../useAttendanceCountdown';

/**
 * One seminar in the list — date block · body · attend action.
 *
 * 출석 여부의 진실원은 서버가 준 `seminar.attendedAt`(호출자 기준, 비로그인이면 null)이다.
 * `attended` prop은 출석 직후 목록 refetch가 도착하기 전까지만 쓰이는 낙관적 오버레이다.
 * ENDED 칩만 로그인 상태로 개인화된다 — 비로그인은 개인화할 근거가 없어 '종료'로 폴백한다.
 */
export function SeminarCard({ seminar, attended, isLoggedIn, onAttend, onOpenDetail }) {
  const minsLeft = useAttendanceCountdown(seminar.attendanceClosesAt);
  const isAttended = attended || Boolean(seminar.attendedAt);
  const canAttend = !isAttended && seminar.status === 'ONGOING';
  const label = isAttended ? ATTEND_LABEL.done : ATTEND_LABEL[seminar.status];

  const endedChip = !isLoggedIn
    ? STATUS_BADGE.ENDED
    : seminar.attendedAt
      ? ENDED_CHIP.attended
      : ENDED_CHIP.absent;
  const badge = seminar.status === 'ENDED' ? endedChip : STATUS_BADGE[seminar.status];

  return (
    <div
      onClick={() => onOpenDetail(seminar)}
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'stretch',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px 26px',
        flexWrap: 'wrap',
        cursor: 'pointer',
      }}
    >
      {/* date block */}
      <div
        style={{
          flex: 'none',
          width: 96,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: 24,
          borderRight: '1px solid var(--border-soft)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 700, color: 'var(--brand-deep)', lineHeight: 1 }}>
          {seminar.day}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
          {seminar.month} · {seminar.weekday}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', marginTop: 6 }}>
          {seminar.time}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <TopicChip>{seminar.topic}</TopicChip>
          <Tag tone={badge.tone} size="sm">{badge.label}</Tag>
        </div>
        <h3 style={{ margin: '12px 0 0', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)', lineHeight: 1.3 }}>
          {seminar.title}
        </h3>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          <span>발표 <strong style={{ color: 'var(--text-body)', fontWeight: 'var(--w-medium)' }}>{seminar.speaker}</strong></span>
          <span>장소 <strong style={{ color: 'var(--text-body)', fontWeight: 'var(--w-medium)' }}>{seminar.place}</strong></span>
        </div>
        {seminar.material && (
          <a href="#" className="jr-mat" style={{ marginTop: 14, fontSize: 'var(--fs-sm)' }}>
            발표 자료 보기 <span aria-hidden="true">→</span>
          </a>
        )}
      </div>

      {/* action */}
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        {canAttend ? (
          <Button onClick={(e) => { e.stopPropagation(); onAttend(seminar); }}>출석하기</Button>
        ) : (
          <Button variant="secondary" disabled>{label}</Button>
        )}
        {/* 이미 출석했으면 남은 시간은 의미가 없다. 0분이면 다음 refetch에서 ENDED로 넘어간다. */}
        {canAttend && minsLeft > 0 && (
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            {COUNTDOWN_LABEL(minsLeft)}
          </p>
        )}
      </div>
    </div>
  );
}
