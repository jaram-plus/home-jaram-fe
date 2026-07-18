import React from 'react';
import { Button } from '@/design-system';
import { ModalShell } from './ModalShell';

/** 슬롯 자기등록 확인 — 본인 프로필로 슬롯을 채우는 것 외에 입력값이 없다. */
export function ClaimModal({ schedule, error, onClose, onConfirm, pending = false }) {
  return (
    <ModalShell
      title="슬롯 등록"
      lead={`${schedule.month} ${schedule.day}일 (${schedule.weekday}) ${schedule.time} 일정에 발표자로 등록하시겠어요?`}
      onClose={onClose}
      maxWidth={420}
    >
      {error && (
        <p style={{ margin: '18px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--brand)' }}>
          {error}
        </p>
      )}
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onConfirm} disabled={pending}>{pending ? '등록 중…' : '등록하기'}</Button>
      </div>
    </ModalShell>
  );
}
