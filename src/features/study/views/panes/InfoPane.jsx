import React from 'react';
import { Button, Input } from '@/design-system';
import { useForm } from '../../useForm';
import { toInfoForm, toUpdatePayload, validateInfo, updateErrorMessage } from '../../study.data';
import { useStudyDetail, useUpdateStudy } from '../../study.queries';
import { Note } from './common';

/**
 * 개설할 때 적은 여덟 칸을 다시 적는다.
 *
 * 상태 판정은 서버가 한다 — 스터디장은 RECRUITING 에서만 통과하고(409
 * INVALID_STATE), STUDY_EDIT 임원은 종료 전까지 통과한다. 그래서 이 폼은 누가
 * 열었는지를 따지지 않는다. 화면이 같은 판정을 한 벌 더 두면 권한이 늘 때마다
 * 두 곳을 고쳐야 하고, 한쪽만 고쳐지는 날이 온다.
 *
 * `note` 는 부르는 쪽이 붙이는 한 줄이다. 스터디장에게는 "모집을 완료하면 잠긴다"가
 * 필요하지만 임원에게는 틀린 말이라, 여기서 정하지 않는다.
 *
 * 폼을 상세 응답으로 초기화하려고 effect 를 쓰지 않는다. 불러온 뒤에야 InfoForm 이
 * 생기게 해서 useForm 의 초기값으로 넘긴다 — 빈 폼이 먼저 떴다가 값이 덮어쓰는
 * 순간이 없어야, 사용자가 그 사이에 친 글자를 잃지 않는다.
 */
export function InfoPane({ study, onToast, note }) {
  const q = useStudyDetail(study.id);
  if (q.isLoading) return <Note>불러오는 중…</Note>;
  if (q.isError) return <Note>스터디 정보를 불러오지 못했습니다.</Note>;
  return <InfoForm study={study} detail={q.data} onToast={onToast} note={note} />;
}

function InfoForm({ study, detail, onToast, note }) {
  const form = useForm(toInfoForm(detail));
  const saveM = useUpdateStudy(study.id, {
    onSuccess: () => onToast('스터디 정보를 수정했습니다.'),
  });

  function submit() {
    const errors = validateInfo(form.values);
    if (Object.keys(errors).length > 0) {
      form.setErrors(errors);
      return;
    }
    saveM.mutate({ studyId: study.id, ...toUpdatePayload(form.values) });
  }

  const error = updateErrorMessage(saveM.error);

  return (
    <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
      <Input label="제목" value={form.values.title} onChange={form.field('title')} error={form.errors.title} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Input label="카테고리" hint="쉼표로 구분합니다." value={form.values.fields}
          onChange={form.field('fields')} error={form.errors.fields} />
        <Input label="희망 인원" inputMode="numeric" value={form.values.capacity}
          onChange={form.field('capacity')} error={form.errors.capacity} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="일시" value={form.values.schedule} onChange={form.field('schedule')} error={form.errors.schedule} />
        <Input label="장소" value={form.values.place} onChange={form.field('place')} error={form.errors.place} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="진행 방식" value={form.values.mode} onChange={form.field('mode')} error={form.errors.mode} />
        <Input label="문의 연락처" value={form.values.contact} onChange={form.field('contact')} error={form.errors.contact} />
      </div>

      <Input as="textarea" label="소개" value={form.values.intro} onChange={form.field('intro')} error={form.errors.intro} />

      {note && (
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
          {note}
        </p>
      )}

      {error && (
        <p style={{
          margin: 0, padding: '11px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--brand-tint)', border: '1px solid var(--brand)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
          lineHeight: 'var(--lh-normal)',
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={submit} disabled={saveM.isPending}>
          {saveM.isPending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </div>
  );
}
