import React from 'react';
import { Button, Tag } from '@/design-system';
import { TopicChip } from './parts';
import { STATUS_BADGE, ATTEND_LABEL } from '../seminar.data';

/**
 * One seminar in the list — date block · body · attend action.
 * `attended` marks a seminar the user has already checked into; the CTA is
 * enabled only while a seminar is `ongoing` and not yet attended.
 */
export function SeminarCard({ seminar, attended, onAttend }) {
  const badge = STATUS_BADGE[seminar.status];
  const canAttend = !attended && seminar.status === 'ONGOING';
  const label = attended ? ATTEND_LABEL.done : ATTEND_LABEL[seminar.status];

  return (
    <div
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
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
        {canAttend ? (
          <Button onClick={() => onAttend(seminar)}>출석하기</Button>
        ) : (
          <Button variant="secondary" disabled>{label}</Button>
        )}
      </div>
    </div>
  );
}
