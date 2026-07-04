import React from 'react';
import { Button, Input } from '@/design-system';
import { TARGET_GRADES, TARGET_GRADE_LABELS } from '@/shared/seminar/enums';
import { ModalShell } from './ModalShell';

/**
 * Seminar-creation modal. SeminarPage requires title and start time; the
 * other fields are optional but all are bound to `form` so the create
 * payload (seminar.api.js createSeminar) carries whatever the officer fills in.
 */
export function CreateModal({ form, onClose, onSubmit, pending = false }) {
  const { values, errors, field, setValues } = form;

  const toggleTarget = (key) => {
    const cur = values.target || [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    setValues((s) => ({ ...s, target: next }));
  };

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
        <div>
          <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>공개 대상</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {TARGET_GRADES.map((k) => (
              <label key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)', cursor: 'pointer' }}>
                <input type="checkbox" checked={(values.target || []).includes(k)} onChange={() => toggleTarget(k)} />
                {TARGET_GRADE_LABELS[k]}
              </label>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            아무것도 선택하지 않으면 전체 공개로 등록됩니다.
          </p>
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending}>{pending ? '등록 중…' : '등록'}</Button>
      </div>
    </ModalShell>
  );
}
