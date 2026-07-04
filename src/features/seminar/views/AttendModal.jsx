import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';

/**
 * Attendance-code modal. SeminarPage only checks the field isn't empty; the
 * code itself is validated server-side. `error` surfaces the failure under
 * the field.
 */
export function AttendModal({ code, error, onCode, onClose, onSubmit }) {
  return (
    <ModalShell
      title="출석 체크"
      lead="발표자가 공지한 출석 코드를 입력하세요."
      onClose={onClose}
      maxWidth={420}
    >
      <div style={{ marginTop: 22 }}>
        <Input
          label="출석 코드"
          placeholder="코드를 입력하세요"
          value={code}
          onChange={onCode}
          error={error}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontSize: 'var(--fs-lead)' }}
        />
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={onSubmit}>출석 확인</Button>
      </div>
    </ModalShell>
  );
}
