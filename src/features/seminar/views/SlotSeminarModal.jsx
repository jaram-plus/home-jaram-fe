import React, { useEffect } from 'react';
import { Button, Input } from '@/design-system';
import { TARGET_GRADES, TARGET_GRADE_LABELS } from '@/shared/seminar/enums';
import { ModalShell } from './ModalShell';
import { useSeminar } from '../seminar.queries';

/**
 * 슬롯에서 세미나 내용을 채워 제출/재제출하는 폼. 일시·장소·진행방식은 Schedule 값으로
 * 고정되어 입력칸이 없다(CreateModal과 달리 발표 내용만 채운다).
 *
 * `editing`이면 `seminarId`로 기존 세미나를 조회해 값을 채운다 — 반려 사유도 함께 보여준다.
 *
 * 출석 코드는 여기서 받지 않는다 — 임원이 "세미나 관리" 표의 출석코드 셀에서 승인 후
 * 직접 설정한다(학회원이 스스로 코드를 정하지 않도록).
 */
export function SlotSeminarModal({ schedule, slot: _slot, form, editing, seminarId, onClose, onSubmit, pending = false }) {
  const { values, errors, field, setValues } = form;
  const existing = useSeminar(seminarId, { enabled: !!editing && !!seminarId });

  useEffect(() => {
    if (!existing.data) return;
    const s = existing.data;
    setValues({
      title: s.title || '',
      speaker: s.speaker || '',
      topic: s.topic || '',
      description: s.description || '',
      materialUrl: s.materialUrl || '',
      target: s.target || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  const toggleTarget = (key) => {
    const cur = values.target || [];
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    setValues((s) => ({ ...s, target: next }));
  };

  const loadingEdit = editing && existing.isLoading;

  return (
    <ModalShell
      title={editing ? '세미나 수정 제출' : '세미나 만들기'}
      lead={`${schedule.month} ${schedule.day}일 (${schedule.weekday}) ${schedule.time}${schedule.place ? ` · ${schedule.place}` : ''}`}
      onClose={onClose}
      maxWidth={540}
      align="top"
    >
      {editing && existing.data?.rejectReason && (
        <p style={{ margin: '18px 0 0', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          반려 사유: {existing.data.rejectReason}
        </p>
      )}
      <div style={{ marginTop: 22, display: 'grid', gap: 16, opacity: loadingEdit ? 0.5 : 1 }}>
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
        <Input
          as="textarea"
          label="상세 설명"
          placeholder="세미나에서 다룰 내용을 자유롭게 적어 주세요."
          value={values.description}
          onChange={field('description')}
        />
        <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} />
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
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
        <Button onClick={onSubmit} disabled={pending || loadingEdit}>{pending ? '제출 중…' : '제출'}</Button>
      </div>
    </ModalShell>
  );
}
