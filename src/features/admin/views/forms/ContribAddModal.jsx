import React from 'react';
import { MESSAGES, TOAST } from '../../admin.data';
import { useAddContributor, useContribCandidates } from '../../admin.queries';
import { PickerModal, PickerHeader, MemberPicker, PickerFooter } from './PickerModal';

/**
 * 기여자 추가 모달 (2단계). 임원 지정 모달과 같은 셸을 씁니다.
 *   1) 아직 기여자가 아닌 회원 목록 — 검색으로 좁힙니다.
 *   2) 고른 회원을 확인하고 등록 — 표의 모아 저장과 달리 즉시 커밋합니다.
 *
 * 임원 지정과 달리 권한 판정이 없습니다. /admin 자체가 임원만 들어오므로
 * 그 안에서는 누구나 기여자를 관리합니다.
 */
export function ContribAddModal({ onClose, onDone }) {
  const [picked, setPicked] = React.useState(null);
  const candidates = useContribCandidates();

  return (
    <PickerModal onClose={onClose}>
      {picked ? (
        <ConfirmStep member={picked} onBack={() => setPicked(null)} onClose={onClose} onDone={onDone} />
      ) : (
        <>
          <PickerHeader eyebrow="CONTRIB" title="기여자 추가" desc="아직 기여자가 아닌 회원 중에서 고르세요." onClose={onClose} />
          <MemberPicker query={candidates} onPick={setPicked} emptyMessage={MESSAGES.noContribCandidate} />
        </>
      )}
    </PickerModal>
  );
}

/* ── 2단계: 확인하고 등록 ───────────────────────────────────────────── */

function ConfirmStep({ member, onBack, onClose, onDone }) {
  const add = useAddContributor({
    onSuccess: () => { onDone(TOAST.contribAdded(member.name)); onClose(); },
  });

  const submit = () => {
    if (add.isPending) return;
    add.mutate({ member });
  };

  return (
    <>
      <PickerHeader eyebrow="CONTRIB" title="기여자로 등록" desc="아래 회원을 기여자 명단에 올립니다." onClose={onClose} />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 20 }}>
        <Row label="이름">{member.name}</Row>
        <Row label="기수">{member.gen || '—'}</Row>
        <Row label="학번">{member.studentId}</Row>
        <Row label="학부">{member.faculty || '—'}</Row>

        <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          등록하면 공개 인원 소개의 기여자 명단에도 함께 오릅니다. 기여자 표에서 언제든 해제할 수 있습니다.
        </p>

        {add.error && (
          <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>{add.error.message}</p>
        )}
      </div>

      <PickerFooter onBack={onBack} onSubmit={submit} submitLabel="기여자로 추가" busy={add.isPending} />
    </>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)' }}>{children}</span>
    </div>
  );
}

export default ContribAddModal;
