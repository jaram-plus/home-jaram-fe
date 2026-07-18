import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';
import { SLOT_EMPTY, SLOT_ACTION_LABEL } from '../schedule.data';
import { SEMINAR_APPROVAL_CHIP } from '../seminar.data';

/**
 * 일정 카드 — 날짜 블록(SeminarCard와 같은 스타일) + 슬롯별 줄.
 *
 * 슬롯 액션은 소유권·잠금 상태로 갈린다:
 *   - 빈 슬롯 + OPEN + 로그인   → "등록하기"
 *   - 내 슬롯 + OPEN            → "포기하기"
 *   - 내 슬롯 + LOCKED + 세미나 없음 → "세미나 만들기"
 *   - 내 슬롯 + LOCKED + REJECTED    → 칩 + "수정하기"
 *   - 내 슬롯 + LOCKED + PENDING     → 칩만
 *   - 남의 슬롯                 → 이름만
 *   - 빈 슬롯 + LOCKED           → "잠김"
 */
export function ScheduleCard({ schedule, currentUserId, isLoggedIn, onClaim, onCancel, onCreateSeminar, onEditSeminar }) {
  const locked = schedule.status === 'LOCKED';

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
      {/* date block — SeminarCard와 동일 스타일 */}
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
          {schedule.day}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
          {schedule.month} · {schedule.weekday}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', marginTop: 6 }}>
          {schedule.time}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
          {schedule.place && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              {schedule.place}
            </span>
          )}
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {schedule.slots.map((slot) => {
            const isMine = isLoggedIn && slot.member?.id === currentUserId;
            const name = slot.member?.name ?? SLOT_EMPTY;
            const chip = isMine && slot.seminarApprovalStatus ? SEMINAR_APPROVAL_CHIP[slot.seminarApprovalStatus] : null;

            return (
              <div
                key={slot.index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
                  {name}
                  {chip && <Tag tone={chip.tone} size="sm">{chip.label}</Tag>}
                </span>

                {!slot.member && !locked && isLoggedIn && (
                  <Button variant="secondary" size="sm" onClick={() => onClaim(schedule.id, slot.index)}>
                    {SLOT_ACTION_LABEL.claim}
                  </Button>
                )}
                {!slot.member && locked && (
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
                    {SLOT_ACTION_LABEL.locked}
                  </span>
                )}
                {isMine && !locked && (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(schedule.id, slot.index)}>
                    {SLOT_ACTION_LABEL.cancel}
                  </Button>
                )}
                {isMine && locked && !slot.seminarId && (
                  <Button variant="secondary" size="sm" onClick={() => onCreateSeminar(schedule, slot)}>
                    {SLOT_ACTION_LABEL.createSeminar}
                  </Button>
                )}
                {isMine && locked && slot.seminarApprovalStatus === 'REJECTED' && (
                  <Button variant="secondary" size="sm" onClick={() => onEditSeminar(schedule, slot)}>
                    {SLOT_ACTION_LABEL.editSeminar}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
