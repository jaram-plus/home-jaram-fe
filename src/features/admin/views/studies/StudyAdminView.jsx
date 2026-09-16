import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/design-system';
import { SCHEMAS, STUDY_TABS, STUDY_EMPTY, STUDY_RECRUITMENT, TOAST } from '../../admin.data';
import { useAdminStore } from '../../admin.store';
import {
  usePendingStudies,
  useStudyApplicants,
  useApproveStudy,
  useRejectStudy,
  useApproveStudyApplicant,
  useRejectStudyApplicant,
  useRecruitmentOpen,
  useSetRecruitmentOpen,
} from '../../admin.queries';
import { TableView } from '../table/TableView';
import { Toggle } from '../forms/Toggle';

const NO_REJECT = { kind: null, id: null };

/** 계약의 createdAt 은 date-time 입니다. 화면에는 날짜까지만 씁니다. */
const day = (iso) => (iso || '').slice(0, 10);

const CARD = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: 22,
};

function Chip({ children }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, background: 'var(--surface-sunken, var(--surface-tonal))', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
      {children}
    </span>
  );
}

function Row({ label, children }) {
  return (
    <>
      <dt style={{ color: 'var(--text-faint)' }}>{label}</dt>
      <dd style={{ margin: 0, color: 'var(--text-body)' }}>{children}</dd>
    </>
  );
}

/** 사유를 받아 확정하는 인라인 폼. 반려·거절이 같은 모양을 씁니다. */
function RejectForm({ confirmLabel, reason, onReason, onCancel, onConfirm, pending }) {
  return (
    <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
      <Input
        label={confirmLabel.includes('반려') ? '반려 사유' : '거절 사유'}
        as="textarea"
        placeholder="상대에게 전달할 사유를 적어 주세요."
        value={reason}
        onChange={onReason}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" onClick={onCancel}>취소</Button>
        <Button size="sm" variant="outline" onClick={onConfirm} disabled={pending}>{confirmLabel}</Button>
      </div>
    </div>
  );
}

/** 개설 승인을 기다리는 스터디 한 건 (계약 PendingStudy). */
function PendingCard({ item, rejecting, reason, onReason, onCancel, onApprove, onRejectStart, onRejectConfirm, pending }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {(item.fields || []).map((f) => <Chip key={f}>{f}</Chip>)}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>신청일 {day(item.createdAt)}</span>
      </div>
      <h3 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
        {item.title}
      </h3>
      <dl style={{ margin: '16px 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '9px 14px', fontSize: 14 }}>
        <Row label="개설자"><strong style={{ fontWeight: 600 }}>{item.creator}</strong></Row>
        <Row label="모집 인원">{item.capacity}명</Row>
        <Row label="일정">{item.schedule || '미정'}</Row>
      </dl>
      {item.intro && (
        <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.intro}</p>
      )}

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
        {rejecting ? (
          <RejectForm confirmLabel="반려 확정" reason={reason} onReason={onReason} onCancel={onCancel} onConfirm={onRejectConfirm} pending={pending} />
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button size="sm" variant="secondary" onClick={onRejectStart}>반려</Button>
            <Button size="sm" onClick={onApprove} disabled={pending}>공개 승인</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** 스터디 지원자 한 명과 그 지원 동기 (계약 Applicant). */
function ApplicantCard({ item, rejecting, reason, onReason, onCancel, onApprove, onRejectStart, onRejectConfirm, pending }) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>{item.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{item.studentId}</span>
        <Chip>{item.studyTitle}</Chip>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>신청일 {day(item.createdAt)}</span>
      </div>
      <div style={{ marginTop: 14, background: 'var(--surface-sunken, var(--surface-tonal))', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
          지원 동기
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6 }}>{item.motive}</p>
      </div>

      {rejecting ? (
        <RejectForm confirmLabel="거절 확정" reason={reason} onReason={onReason} onCancel={onCancel} onConfirm={onRejectConfirm} pending={pending} />
      ) : (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={onRejectStart}>거절</Button>
          <Button size="sm" onClick={onApprove} disabled={pending}>승인</Button>
        </div>
      )}
    </div>
  );
}

function Notice({ children }) {
  return (
    <div style={{ ...CARD, padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--surface-tonal, var(--border-strong))', lineHeight: 1 }}>空</div>
      <p style={{ margin: '16px 0 0', fontSize: 15, color: 'var(--text-muted)' }}>{children}</p>
    </div>
  );
}

/**
 * 스터디 관리 — 목록 표와 임원 승인을 한 화면의 탭으로 묶습니다.
 *
 * 목록은 기존 표(TableView)를 그대로 쓰고, 승인 대기·신청자는 각 액션이 즉시
 * 서버에 반영되는 단건 처리라 배치저장 모델에 맞지 않아 카드형으로 둡니다
 * (일정 관리와 같은 판단입니다).
 *
 * 이 화면은 회원용 스터디 페이지에 있던 '관리' 탭을 대신합니다. 거기서는 임원
 * 여부와 무관하게 목록 요청이 나가 일반 회원이 403 을 받았고, 탭 자체도 모두에게
 * 보였습니다. 콘솔은 RequireAdmin 이 이미 가르고 있습니다.
 */
export function StudyAdminView() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'list';
  const activeTab = STUDY_TABS.find((t) => t.key === tab) ?? STUDY_TABS[0];
  const schema = SCHEMAS.studies;
  const showToast = useAdminStore((s) => s.showToast);

  const [reject, setReject] = useState(NO_REJECT); // { kind: 'study'|'applicant', id }
  const [reason, setReason] = useState('');

  const cancelReject = () => { setReject(NO_REJECT); setReason(''); };
  const startReject = (kind, id) => { setReject({ kind, id }); setReason(''); };

  const goTab = (key) => {
    cancelReject();
    const next = new URLSearchParams(sp);
    if (key === 'list') next.delete('tab');
    else next.set('tab', key);
    setSp(next, { replace: true });
  };

  // 목록 탭에서는 승인 목록을 부르지 않는다 — 열지도 않은 탭 때문에 요청이 나갈 이유가 없다.
  const pendingQ = usePendingStudies({ enabled: tab === 'pending' });
  const applicantsQ = useStudyApplicants({ enabled: tab === 'applicants' });

  // 개설 신청 창은 탭과 무관하게 이 화면 머리에 늘 서 있으므로 항상 부른다.
  const recruitQ = useRecruitmentOpen();
  const recruitM = useSetRecruitmentOpen({
    onSuccess: (_d, vars) => showToast(vars.open ? TOAST.recruitmentOpened : TOAST.recruitmentClosed),
    onError: () => showToast('개설 신청 창을 바꾸지 못했습니다.'),
  });
  const recruiting = Boolean(recruitQ.data);

  const approveStudyM = useApproveStudy({
    onSuccess: (_d, vars) => { cancelReject(); showToast(TOAST.studyPublished(vars.title)); },
    onError: () => showToast('승인 처리 중 오류가 발생했습니다.'),
  });
  const rejectStudyM = useRejectStudy({
    onSuccess: () => { cancelReject(); showToast(TOAST.studyRejected); },
    onError: () => showToast('반려 처리 중 오류가 발생했습니다.'),
  });
  const approveApplicantM = useApproveStudyApplicant({
    onSuccess: (_d, vars) => { cancelReject(); showToast(TOAST.studyApplicantApproved(vars.name)); },
    onError: () => showToast('승인 처리 중 오류가 발생했습니다.'),
  });
  const rejectApplicantM = useRejectStudyApplicant({
    onSuccess: () => { cancelReject(); showToast(TOAST.studyApplicantRejected); },
    onError: () => showToast('거절 처리 중 오류가 발생했습니다.'),
  });

  const onReason = (e) => setReason(e.target.value);

  const activeQ = tab === 'pending' ? pendingQ : applicantsQ;
  const rows = activeQ.data ?? [];

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>{schema.eyebrow}</p>
      <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1.1, color: 'var(--text-strong)' }}>{schema.title}</h1>
      <p style={{ margin: '0 0 18px', fontSize: 15, color: 'var(--text-muted)' }}>{schema.desc}</p>

      {/* 개설 신청 창 — 회원이 스터디를 올릴 수 있는지 가르는 손잡이라 탭보다 위에 둔다. */}
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>{STUDY_RECRUITMENT.title}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {recruitQ.isLoading ? '상태를 불러오는 중…'
              : recruitQ.isError ? '상태를 불러오지 못했습니다.'
                : recruiting ? STUDY_RECRUITMENT.on : STUDY_RECRUITMENT.off}
          </p>
        </div>
        <Toggle
          on={recruiting}
          disabled={recruitQ.isLoading || recruitQ.isError || recruitM.isPending}
          label={STUDY_RECRUITMENT.title}
          onClick={() => recruitM.mutate({ open: !recruiting })}
        />
      </div>

      <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {STUDY_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => goTab(t.key)}
            style={{ padding: '10px 2px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', fontWeight: 600, color: tab === t.key ? 'var(--brand)' : 'var(--text-muted)', borderBottom: tab === t.key ? '2px solid var(--brand)' : '2px solid transparent', marginBottom: -1 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* '승인 대기'와 '신청자'는 이름이 비슷해 헷갈린다 — 무엇을 승인하는 자리인지 적어 둔다. */}
      {activeTab.desc && (
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '68ch' }}>
          {activeTab.desc}
        </p>
      )}

      {tab === 'list' && <TableView resource="studies" hideHeader />}

      {tab !== 'list' && (activeQ.isLoading || activeQ.isError) && (
        <Notice>{activeQ.isError ? '목록을 불러오지 못했습니다.' : '불러오는 중…'}</Notice>
      )}

      {tab === 'pending' && !pendingQ.isLoading && !pendingQ.isError && (
        rows.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {rows.map((p) => (
              <PendingCard
                key={p.id}
                item={p}
                rejecting={reject.kind === 'study' && reject.id === p.id}
                reason={reason}
                onReason={onReason}
                onCancel={cancelReject}
                onApprove={() => approveStudyM.mutate({ id: p.id, title: p.title })}
                onRejectStart={() => startReject('study', p.id)}
                onRejectConfirm={() => rejectStudyM.mutate({ id: p.id, reason })}
                pending={approveStudyM.isPending || rejectStudyM.isPending}
              />
            ))}
          </div>
        ) : (
          <Notice>{STUDY_EMPTY.pending}</Notice>
        )
      )}

      {tab === 'applicants' && !applicantsQ.isLoading && !applicantsQ.isError && (
        rows.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {rows.map((a) => (
              <ApplicantCard
                key={a.id}
                item={a}
                rejecting={reject.kind === 'applicant' && reject.id === a.id}
                reason={reason}
                onReason={onReason}
                onCancel={cancelReject}
                onApprove={() => approveApplicantM.mutate({ id: a.id, name: a.name })}
                onRejectStart={() => startReject('applicant', a.id)}
                onRejectConfirm={() => rejectApplicantM.mutate({ id: a.id, reason })}
                pending={approveApplicantM.isPending || rejectApplicantM.isPending}
              />
            ))}
          </div>
        ) : (
          <Notice>{STUDY_EMPTY.applicants}</Notice>
        )
      )}
    </div>
  );
}
