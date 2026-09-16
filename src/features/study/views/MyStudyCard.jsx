import React from 'react';
import { Button, Tag } from '@/design-system';
import { FieldChip } from './parts';
import { STATUS_BADGE, RELATION_CHIP, RELATION_ACTION, relationLine } from '../study.data';

/** 이 카드에 버튼이 붙는 관계·상태인가. */
function actionOf(item) {
  const { relation, status } = item;
  if (relation === 'LEADER' && (status === 'RECRUITING' || status === 'ONGOING')) return 'manage';
  if (relation === 'MEMBER' && status === 'ONGOING') return 'attendance';
  if (relation === 'REJECTED') return 'delete';
  return null;
}

/**
 * '내 스터디'의 카드 한 장. 관계 칩(좌)과 상태 배지(우)가 머리에 있고,
 * 가운데 한 줄과 버튼이 관계 x 상태로 갈린다.
 */
export function MyStudyCard({ item, onManage, onAttendance, onDelete }) {
  const chip = RELATION_CHIP[item.relation];
  const badge = STATUS_BADGE[item.status];
  const action = actionOf(item);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Tag tone={chip.tone} size="sm" style={{ flex: 'none' }}>{chip.label}</Tag>
        {badge && <Tag tone={badge.tone} size="sm" style={{ flex: 'none' }}>{badge.label}</Tag>}
      </div>

      <h3 style={{ margin: '14px 0 0', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)', lineHeight: 1.3 }}>
        {item.title}
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {(item.fields ?? []).map((f) => <FieldChip key={f}>{f}</FieldChip>)}
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
          {relationLine(item)}
        </span>
        {action === 'manage' && (
          <Button size="sm" onClick={() => onManage(item)}>{RELATION_ACTION.LEADER}</Button>
        )}
        {action === 'attendance' && (
          <Button size="sm" variant="secondary" onClick={() => onAttendance(item)}>
            {RELATION_ACTION.MEMBER}
          </Button>
        )}
        {action === 'delete' && (
          <Button size="sm" variant="secondary" onClick={() => onDelete(item)}>
            {RELATION_ACTION.REJECTED}
          </Button>
        )}
      </div>
    </div>
  );
}
