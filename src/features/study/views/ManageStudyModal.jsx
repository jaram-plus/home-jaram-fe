import React, { useState } from 'react';
import { Button } from '@/design-system';
import { ModalShell } from './ModalShell';
import { Pill } from './parts';
import { ApplicantsPane, AttendancePane, CurriculumPane, InfoPane } from './panes';
import { useCloseRecruiting, useFinishStudy } from '../study.queries';

const LOCK_NOTE = '모집을 완료하면 더 이상 고칠 수 없습니다. 신청한 사람이 이 내용을 '
  + '보고 지원했기 때문입니다. 커리큘럼 주차는 모집 완료 뒤 \'정보\' 탭에서 늘리고 줄입니다.';

/**
 * 스터디장의 '관리하기'. 스터디 상태가 무엇을 열지 정한다.
 *
 * 모집 중이면 신청/정보 탭과 '모집 완료', 진행 중이면 출석/정보 탭과 '종료'.
 * 같은 '정보'라도 여는 것이 다르다 — 모집 중에는 개설 때 적은 여덟 칸을 고치고,
 * 진행 중에는 커리큘럼 주차를 늘리고 줄인다. 여덟 칸은 모집이 닫히는 순간 잠긴다.
 * 두 버튼 모두 확인을 한 단계 둔다 — 되돌릴 손잡이가 임원에게만 있고(D12),
 * '종료'는 이 스터디를 '내 스터디'에서 사라지게 한다.
 *
 * 패널 자체는 views/panes 에 있다. 관리자 콘솔의 스터디 '상세' 모달이 같은 것을
 * 쓰기 때문이다 — 여기서 갈라 두면 스터디장 쪽만 고쳐지는 날이 온다.
 */
export function ManageStudyModal({ study, onClose, onToast }) {
  const recruiting = study.status === 'RECRUITING';
  // 첫 탭은 그 상태에서 제일 할 일이 많은 쪽이다 — 모집 중이면 쌓인 신청, 진행 중이면 출석.
  const [tab, setTab] = useState(recruiting ? 'applicants' : 'attendance');
  const [confirming, setConfirming] = useState(false);

  const closeM = useCloseRecruiting({
    onSuccess: () => { onClose(); onToast('모집을 완료했습니다. 이제 진행 중입니다.'); },
  });
  const finishM = useFinishStudy({
    onSuccess: () => { onClose(); onToast('스터디를 종료했습니다.'); },
  });

  const confirmText = recruiting
    ? '모집을 완료하면 더 이상 신청을 받지 않고 진행 중으로 넘어갑니다. 되돌리려면 임원에게 요청해야 합니다.'
    : '종료하면 이 스터디가 \'내 스터디\'에서 사라집니다. 출석 기록도 더 이상 고칠 수 없습니다.';

  return (
    <ModalShell title={study.title} lead={recruiting ? '신청 관리와 정보 수정' : '출석과 커리큘럼'}
      onClose={onClose} maxWidth={720} align="top">

      <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
        {recruiting ? (
          <>
            <Pill active={tab === 'applicants'} onClick={() => setTab('applicants')}>신청</Pill>
            <Pill active={tab === 'edit'} onClick={() => setTab('edit')}>정보</Pill>
          </>
        ) : (
          <>
            <Pill active={tab === 'attendance'} onClick={() => setTab('attendance')}>출석</Pill>
            <Pill active={tab === 'info'} onClick={() => setTab('info')}>정보</Pill>
          </>
        )}
      </div>

      {recruiting && tab === 'applicants' && <ApplicantsPane study={study} onToast={onToast} />}
      {recruiting && tab === 'edit' && <InfoPane study={study} onToast={onToast} note={LOCK_NOTE} />}
      {!recruiting && tab === 'attendance' && <AttendancePane study={study} onToast={onToast} />}
      {!recruiting && tab === 'info' && <CurriculumPane study={study} onToast={onToast} />}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-soft)' }}>
        {confirming ? (
          <>
            <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              {confirmText}
            </span>
            <Button variant="secondary" onClick={() => setConfirming(false)}>취소</Button>
            <Button
              disabled={closeM.isPending || finishM.isPending}
              onClick={() => (recruiting ? closeM : finishM).mutate({ studyId: study.id })}
            >
              {recruiting ? '모집 완료' : '종료'}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            {recruiting ? '모집 완료' : '종료'}
          </Button>
        )}
      </div>
    </ModalShell>
  );
}
