import React, { useState } from 'react';
import { Button } from '@/design-system';
import {
  useStudyApplicants, useApproveApplicant, useRejectApplicant, useRemoveMember,
} from '../../study.queries';
import { GroupTitle, Note, PersonLine } from './common';
import { inputStyle, rowStyle } from './styles';

/**
 * 신청과 인원을 한 화면에 둔다 — 대기 중인 신청(승인·반려)과 참여가 확정된
 * 스터디원(삭제).
 *
 * 두 묶음 모두 학번 · 기수 · 이름으로 그린다. 확정 인원을 칩으로 두었을 때는 이름과
 * 기수만 보였는데, 동명이인을 가를 수 없고 삭제 같은 손잡이를 붙일 자리도 없었다.
 * 칩은 '몇 명인가'를 보여 주는 모양이지 '누구인가'를 다루는 모양이 아니다.
 */
export function ApplicantsPane({ study, onToast }) {
  const q = useStudyApplicants(study.id);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [removing, setRemoving] = useState(null);

  const approveM = useApproveApplicant(study.id, {
    onSuccess: (_d, vars) => onToast(`${vars.name} 님을 승인했습니다.`),
  });
  const rejectM = useRejectApplicant(study.id, {
    onSuccess: () => { setRejecting(null); setReason(''); onToast('신청을 반려했습니다.'); },
  });
  const removeM = useRemoveMember(study.id, {
    onSuccess: (_d, vars) => { setRemoving(null); onToast(`${vars.name} 님을 내보냈습니다.`); },
    onError: (e) => onToast(removeErrorMessage(e)),
  });

  if (q.isLoading) return <Note>불러오는 중…</Note>;
  if (q.isError) return <Note>신청 목록을 불러오지 못했습니다.</Note>;

  const { pending = [], approved = [] } = q.data ?? {};

  return (
    <div style={{ display: 'grid', gap: 28, marginTop: 24 }}>
      <div>
        <GroupTitle>대기 중인 신청 {pending.length}건</GroupTitle>
        {pending.length === 0 ? (
          <Note>새 신청이 없습니다.</Note>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {pending.map((a) => (
              <div key={a.applicationId} style={rowStyle}>
                <div style={{ minWidth: 0 }}>
                  <PersonLine entry={a} />
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)' }}>
                    {a.motive}
                  </p>
                  {rejecting === a.applicationId && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input
                        id={`reject-reason-${a.applicationId}`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="반려 사유"
                        style={inputStyle}
                      />
                      <Button size="sm" onClick={() =>
                        rejectM.mutate({ applicantId: a.applicationId, reason })}>보내기</Button>
                      <Button size="sm" variant="secondary"
                        onClick={() => { setRejecting(null); setReason(''); }}>취소</Button>
                    </div>
                  )}
                </div>
                {rejecting !== a.applicationId && (
                  <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                    <Button size="sm" onClick={() =>
                      approveM.mutate({ applicantId: a.applicationId, name: a.name })}>승인</Button>
                    <Button size="sm" variant="secondary"
                      onClick={() => setRejecting(a.applicationId)}>반려</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <GroupTitle>참여 확정 {approved.length}명</GroupTitle>
        {approved.length === 0 ? (
          <Note>아직 확정된 참여자가 없습니다.</Note>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {approved.map((a) => (
              <div key={a.applicationId} style={rowStyle}>
                {removing === a.applicationId ? (
                  <>
                    <span style={{ minWidth: 0, color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
                      {a.name} 님을 명단에서 뺍니다. 그동안의 출석 기록도 함께 지워집니다.
                    </span>
                    <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                      <Button
                        size="sm"
                        disabled={removeM.isPending}
                        onClick={() => removeM.mutate({
                          studyId: study.id, applicationId: a.applicationId, name: a.name,
                        })}
                      >
                        삭제
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setRemoving(null)}>취소</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <PersonLine entry={a} />
                    <Button size="sm" variant="secondary" style={{ flex: 'none' }}
                      onClick={() => setRemoving(a.applicationId)}>삭제</Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 서버가 거절하는 두 경우를 따로 적는다. 포괄 문구로 두면 "왜 안 되지"를 묻게 되고,
 * 종료된 스터디는 임원에게 요청해도 열리지 않는다는 것이 특히 안 보인다.
 */
function removeErrorMessage(error) {
  const code = error?.response?.data?.code;
  if (code === 'STUDY_FINISHED') return '종료된 스터디의 명단은 바꿀 수 없습니다.';
  if (code === 'NOT_APPROVED') return '참여가 확정된 사람만 삭제할 수 있습니다.';
  return error?.response?.data?.message || '삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
