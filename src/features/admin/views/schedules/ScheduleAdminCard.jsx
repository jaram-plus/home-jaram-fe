import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';

/**
 * 일정 관리 카드 — 회원용 ScheduleCard와 같은 세로 카드다. 같은 일정을 보는 화면이라
 * 임원이 회원 화면과 눈으로 대조하기 쉬워야 한다. 짜임새도 그쪽을 따른다:
 * 날짜 머리 → 상태·장소 → 슬롯 줄. 관리 화면에만 있는 액션(잠금·삭제)은 맨 아래 줄로 뺀다.
 *
 * ScheduleAdminView의 그리드 한 칸을 채우므로 높이는 형제 카드에 맞춰 늘어난다.
 * 액션 줄에 marginTop:'auto'를 줘 슬롯 수가 달라도 버튼은 카드 바닥에 나란히 선다.
 *
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
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
      }}
    >
      {/* date head */}
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--brand-deep)', lineHeight: 'var(--lh-snug)', letterSpacing: 'var(--ls-tight)' }}>
        {schedule.month} {schedule.day}일
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        <span>({schedule.weekday})</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--w-medium)', color: 'var(--text-body)' }}>{schedule.time}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }}>
        <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          {schedule.place || '장소 미정'} · 정원 {schedule.capacity}명
        </span>
      </div>

      {/* slots */}
      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {schedule.slots.map((slot) => (
          <div
            key={slot.index}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
              // 해제 버튼이 붙는 줄과 '비어있음'만 있는 줄의 높이를 맞춘다.
              minHeight: 40, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: slot.member ? 'var(--w-medium)' : 'var(--w-regular)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
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

      {/* actions */}
      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
  );
}
