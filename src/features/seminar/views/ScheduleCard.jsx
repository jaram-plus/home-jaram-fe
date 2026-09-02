import React from 'react';
import { Button, Tag } from '@/design-system';
import { SCHEDULE_STATUS_LABELS } from '@/shared/seminar/enums';
import { SLOT_EMPTY, SLOT_ACTION_LABEL } from '../schedule.data';
import { SEMINAR_APPROVAL_CHIP } from '../seminar.data';

/**
 * 일정 카드 — 세로 카드. 날짜 머리 + 상태·장소 + 슬롯 줄.
 * 그리드(.jr-schedule-grid) 한 칸을 채우므로 높이는 형제 카드에 맞춰 늘어난다.
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
        flexDirection: 'column',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
      }}
    >
      {/* date head — 카드를 훑을 때 먼저 찾는 건 '몇 월 며칠'이라 월·일을 한 덩어리로
          크게 두고, 요일과 시각은 그 아래 한 줄로 붙인다. 표기는 다른 화면
          (모달·관리 표)에서 쓰는 "6월 27일 (금) 19:00"과 같은 형식이다. */}
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--brand-deep)', lineHeight: 'var(--lh-snug)', letterSpacing: 'var(--ls-tight)' }}>
        {schedule.month} {schedule.day}일
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        <span>({schedule.weekday})</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--w-medium)', color: 'var(--text-body)' }}>{schedule.time}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }}>
        <Tag tone={locked ? 'neutral' : 'brand'} size="sm">{SCHEDULE_STATUS_LABELS[schedule.status]}</Tag>
        {schedule.place && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            {schedule.place}
          </span>
        )}
      </div>

      {/* slots */}
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
                gap: 8,
                flexWrap: 'wrap',
                // 버튼이 붙는 줄과 이름만 있는 줄의 높이를 맞춘다 — 안 맞추면
                // 슬롯 목록이 들쭉날쭉해 한눈에 세기 어렵다.
                minHeight: 40,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-sunken)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: slot.member ? 'var(--w-medium)' : 'var(--w-regular)', color: slot.member ? 'var(--text-body)' : 'var(--text-faint)' }}>
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
  );
}
