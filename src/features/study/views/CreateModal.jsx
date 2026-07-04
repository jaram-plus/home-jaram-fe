import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';

/**
 * Study-creation modal. Only the title is validated; the other fields are
 * bound to `form` so the create payload (study.api.js createStudy) carries
 * whatever the officer fills in.
 */
export function CreateModal({ form, onClose, onSubmit }) {
  const { values, errors, field } = form;
  return (
    <ModalShell
      title="스터디 개설"
      lead="함께할 스터디를 만들어 보세요. 임원 승인 후 전체에 공개됩니다."
      onClose={onClose}
      maxWidth={520}
      align="top"
    >
      <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
        <Input
          label="제목"
          placeholder="예: React 심화 스터디"
          value={values.title}
          onChange={field('title')}
          error={errors.title}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="분야 태그" placeholder="Frontend, React" value={values.fields} onChange={field('fields')} />
          <Input label="모집 인원" inputMode="numeric" placeholder="6" value={values.recruit} onChange={field('recruit')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="일정" placeholder="매주 화 19:00" value={values.schedule} onChange={field('schedule')} />
          <Input label="기간" placeholder="8주 과정" value={values.period} onChange={field('period')} />
        </div>
        <Input label="진행 방식" placeholder="온라인 / 오프라인 / 온·오프라인 병행" value={values.mode} onChange={field('mode')} />
        <Input label="소개" as="textarea" placeholder="스터디 목표와 진행 방식을 소개해 주세요." value={values.intro} onChange={field('intro')} />
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={onSubmit}>개설 신청</Button>
      </div>
    </ModalShell>
  );
}
