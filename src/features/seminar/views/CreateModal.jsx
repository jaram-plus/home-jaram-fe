import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';

/**
 * Seminar-creation modal. Only the title is validated in this demo; the other
 * fields are bound to `form` so the create payload is ready when connecting
 * the backend.
 */
export function CreateModal({ form, onClose, onSubmit, pending = false }) {
  const { values, errors, field } = form;
  return (
    <ModalShell title="세미나 개설" onClose={onClose} maxWidth={540} align="top">
      <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
        <Input
          label="제목"
          placeholder="예: 클린 아키텍처로 배우는 백엔드 설계"
          value={values.title}
          onChange={field('title')}
          error={errors.title}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="발표자" placeholder="홍길동" value={values.speaker} onChange={field('speaker')} />
          <Input label="주제" placeholder="Backend" value={values.topic} onChange={field('topic')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="일시" type="datetime-local" className="jr-datetime" value={values.startsAt} onChange={field('startsAt')} error={errors.startsAt} />
          <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={field('place')} />
        </div>
        <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={field('mode')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="출석 코드" placeholder="참석자에게 공지할 코드를 설정하세요" value={values.attendanceCode} onChange={field('attendanceCode')} />
          <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} />
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending}>{pending ? '등록 중…' : '등록'}</Button>
      </div>
    </ModalShell>
  );
}
