import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';

/**
 * 일정 관리 카드 — 슬롯별 맡은 회원 + 해제 버튼, 잠금 토글.
 * 빈 슬롯 문구('비어있음')는 회원용 ScheduleCard의 SLOT_EMPTY('미정')와 다른 단어를
 * 쓴다 — admin 표에서는 이 리소스가 "비어있는 자리"라는 관리 관점 문구가 자연스럽다.
 *
 * 삭제 버튼은 슬롯이 전부 비어 있을 때만 나온다. 누군가 맡고 있다면 그 슬롯을 먼저
 * 해제해야 하므로, 눌러도 막히는 버튼을 보여주는 대신 아예 감춘다.
 */
export function ScheduleAdminCard({ schedule, onLock, onUnlock, onForceUnassign, onDelete, locking, unlocking, deleting, unassigningIndex }) {
  const locked = schedule.status === 'LOCKED';
  const emptied = schedule.slots.every((slot) => !slot.member);

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
            {schedule.month} {schedule.day}일 ({schedule.weekday}) {schedule.time}
          </div>
          <div style={{ marginTop: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            {schedule.place || '장소 미정'} · 정원 {schedule.capacity}명
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
          {locked ? (
            <Button variant="secondary" size="sm" disabled={unlocking} onClick={() => onUnlock(schedule.id)}>
              {unlocking ? '해제하는 중…' : '잠금 해제'}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled={locking} onClick={() => onLock(schedule.id)}>
              {locking ? '잠그는 중…' : '잠금'}
            </Button>
          )}
          {emptied && (
            <Button variant="ghost" size="sm" disabled={deleting} onClick={() => onDelete(schedule.id)}>
              {deleting ? '삭제하는 중…' : '삭제'}
            </Button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        {schedule.slots.map((slot) => (
          <div
            key={slot.index}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
              {slot.member?.name ?? '비어있음'}
            </span>
            {slot.member && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!!slot.seminarId || unassigningIndex === slot.index}
                onClick={() => onForceUnassign(schedule.id, slot.index)}
              >
                {slot.seminarId ? '세미나 있음' : unassigningIndex === slot.index ? '해제 중…' : '해제'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
