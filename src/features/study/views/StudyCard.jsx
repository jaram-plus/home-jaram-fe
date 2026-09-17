import React from 'react';
import { Button, Tag } from '@/design-system';
import { FieldChip, DefList } from './parts';
import { STATUS_BADGE, APPLY_LABEL } from '../study.data';

/**
 * One study in the browse grid. `onOpen` opens the read-only detail modal,
 * `onApply` the application modal.
 *
 * 카드 전체가 상세로 가는 손잡이다. 안에 '신청하기'가 따로 있으므로 그 클릭은
 * 카드까지 올라가지 않게 막는다 — 신청을 누르려다 상세가 열리면 두 창이 겹친다.
 */
export function StudyCard({ study, onOpen, onApply }) {
  const badge = STATUS_BADGE[study.status];
  const canApply = study.apply === 'OPEN';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${study.title} 상세 보기`}
      onClick={() => onOpen(study)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(study);
        }
      }}
      className="jr-card-click"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 24,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)', lineHeight: 1.3 }}>
          {study.title}
        </h3>
        <Tag tone={badge.tone} size="sm" style={{ flex: 'none' }}>
          {badge.label}
        </Tag>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {study.fields.map((f) => (
          <FieldChip key={f}>{f}</FieldChip>
        ))}
      </div>

      <DefList
        rows={[
          ['스터디장', <strong style={{ fontWeight: 'var(--w-medium)' }}>{study.leader}</strong>],
          ['일정', study.schedule],
          ['진행', study.mode],
        ]}
      />

      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          모집 인원 <strong style={{ color: 'var(--text-strong)' }}>{study.cur}/{study.cap}명</strong>
        </span>
        {canApply ? (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onApply(study); }}>신청하기</Button>
        ) : (
          <Button size="sm" variant="secondary" disabled>{APPLY_LABEL[study.apply]}</Button>
        )}
      </div>
    </div>
  );
}
