import React from 'react';
import { Button, Input } from '@/design-system';
import { TOAST } from '../../admin.data';
import { validateSeminarCreate } from '../../admin.validation';
import { useCreateSeminar } from '../../admin.queries';

const EMPTY = { title: '', startsAt: '', speaker: '', topic: '', place: '', mode: '', description: '', materialUrl: '' };

/**
 * 세미나 개설 모달 — 일정(Schedule) 없이 임원이 직접 여는 세미나용입니다.
 * 슬롯에서 올라온 세미나와 달리 일시·장소를 여기서 정하고, 임원이 만든 것이라
 * 승인 절차 없이 바로 공개 목록에 오릅니다(서버가 개설과 함께 승인합니다).
 *
 * 표의 모아 저장과 달리 즉시 커밋합니다 — 개설은 모아 두었다 함께 낼 성질이 아닙니다.
 */
export function SeminarCreateModal({ onClose, onDone }) {
  const [values, setValues] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const field = (key) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((s) => ({ ...s, [key]: undefined }));
  };

  const create = useCreateSeminar({
    onSuccess: () => { onDone(TOAST.seminarCreated); onClose(); },
    onError: (err) => setErrors({ title: err.message }),
  });

  const submit = () => {
    const errs = validateSeminarCreate(values);
    if (errs) { setErrors(errs); return; }
    create.mutate(values);
  };

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>SEMINAR</p>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-strong)' }}>세미나 개설</h3>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>일정에 없는 세미나를 직접 엽니다. 만들면 바로 공개됩니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
          <Input label="세미나명" placeholder="예: 클린 아키텍처로 배우는 백엔드 설계" value={values.title} onChange={field('title')} error={errors.title} />
          {/* 일시는 한 줄을 통째로 쓴다. 날짜·시간 입력은 브라우저가 그리는 위젯이라
              필요한 폭이 브라우저·확대 배율·기본 글꼴에 따라 달라져, 반 칸에 넣으면
              어딘가에서는 반드시 옆 칸을 민다. 칸을 좁히는 대신 줄을 내주고,
              발표자는 주제와 짝지어 줄 수는 그대로 둔다. */}
          <Input label="일시" type="datetime-local" value={values.startsAt} onChange={field('startsAt')} error={errors.startsAt} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
            <Input label="발표자" placeholder="홍길동" value={values.speaker} onChange={field('speaker')} />
            <Input label="주제" placeholder="Backend" value={values.topic} onChange={field('topic')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
            <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={field('place')} />
            <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={field('mode')} />
          </div>
          <Input as="textarea" label="상세 설명" placeholder="세미나에서 다룰 내용을 적어 주세요." value={values.description} onChange={field('description')} />
          <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} error={errors.materialUrl} />
        </div>

        {/* 출석 코드는 여기서 받지 않는다 — 개설 후 상세 모달의 '출석' 탭에서 발급한다. */}
        <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>취소</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending ? '만드는 중…' : '만들기'}</Button>
        </div>
      </div>
    </div>
  );
}
