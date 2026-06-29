import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';

/** Application modal — required motivation statement. */
export function ApplyModal({ studyName, motive, error, onMotive, onClose, onSubmit }) {
  return (
    <ModalShell title="스터디 신청" lead={`‘${studyName}’에 신청합니다.`} onClose={onClose} maxWidth={480}>
      <div style={{ marginTop: 22 }}>
        <Input
          label="지원 동기 (필수)"
          as="textarea"
          placeholder="어떤 점이 끌렸는지, 무엇을 기대하는지 적어 주세요."
          value={motive}
          onChange={onMotive}
          error={error}
        />
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={onSubmit}>신청하기</Button>
      </div>
    </ModalShell>
  );
}
