import React from 'react';
import { Button, Input } from '@/design-system';
import { Pill, FieldChip, DefList, EmptyState } from './parts';
import { EMPTY } from '../study.data';

/** Inline reject form (reason textarea + cancel/confirm). */
function RejectForm({ confirmLabel, reason, onReason, onCancel, onConfirm }) {
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
        <Button size="sm" variant="outline" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  );
}

/** Pending study-creation request awaiting officer approval. */
function PendingCard({ item, rejecting, reason, onReason, onCancel, onApprove, onRejectStart, onRejectConfirm }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24 }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FieldChip>{item.field}</FieldChip>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>신청일 {item.date}</span>
        </div>
        <h3 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>
          {item.title}
        </h3>
        <DefList
          rows={[
            ['개설자', <strong style={{ fontWeight: 'var(--w-medium)' }}>{item.creator}</strong>],
            ['모집 인원', item.recruit],
            ['일정', item.schedule],
          ]}
        />
        <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
          {item.intro}
        </p>
      </div>

      {rejecting ? (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-soft)' }}>
          <RejectForm confirmLabel="반려 확정" reason={reason} onReason={onReason} onCancel={onCancel} onConfirm={onRejectConfirm} />
        </div>
      ) : (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={onRejectStart}>반려</Button>
          <Button size="sm" onClick={onApprove}>공개 승인</Button>
        </div>
      )}
    </div>
  );
}

/** A study applicant with their motivation statement. */
function ApplicantCard({ item, rejecting, reason, onReason, onCancel, onApprove, onRejectStart, onRejectConfirm }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>{item.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{item.sid}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>신청일 {item.date}</span>
      </div>
      <div style={{ marginTop: 14, background: 'var(--surface-sunken)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--w-semibold)', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
          지원 동기
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)', lineHeight: 'var(--lh-normal)' }}>{item.motive}</p>
      </div>

      {rejecting ? (
        <RejectForm confirmLabel="거절 확정" reason={reason} onReason={onReason} onCancel={onCancel} onConfirm={onRejectConfirm} />
      ) : (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={onRejectStart}>거절</Button>
          <Button size="sm" onClick={onApprove}>승인</Button>
        </div>
      )}
    </div>
  );
}

const MANAGE_TABS = [
  { key: 'studies', label: '스터디 승인 관리' },
  { key: 'applicants', label: '신청자 관리' },
];

/**
 * Officer management — study-creation approvals and applicant approvals.
 * `reject` is { kind, id } identifying the row whose inline reject form is open.
 */
export function ManageView({
  tab, onTab, pending, applicants, loading, error,
  reject, reason, onReason, onCancelReject, onStartReject,
  onApproveStudy, onRejectStudy, onApproveApplicant, onRejectApplicant,
}) {
  return (
    <div className="jr-anim">
      <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
        {MANAGE_TABS.map((t) => (
          <Pill key={t.key} active={tab === t.key} onClick={() => onTab(t.key)}>{t.label}</Pill>
        ))}
      </div>

      {(loading || error) && (
        <EmptyState>{error ? '목록을 불러오지 못했습니다.' : '불러오는 중…'}</EmptyState>
      )}

      {!loading && !error && tab === 'studies' &&
        (pending.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {pending.map((p) => (
              <PendingCard
                key={p.id}
                item={p}
                rejecting={reject.kind === 'study' && reject.id === p.id}
                reason={reason}
                onReason={onReason}
                onCancel={onCancelReject}
                onApprove={() => onApproveStudy(p)}
                onRejectStart={() => onStartReject('study', p.id)}
                onRejectConfirm={() => onRejectStudy(p)}
              />
            ))}
          </div>
        ) : (
          <EmptyState>{EMPTY.pending}</EmptyState>
        ))}

      {!loading && !error && tab === 'applicants' &&
        (applicants.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {applicants.map((a) => (
              <ApplicantCard
                key={a.id}
                item={a}
                rejecting={reject.kind === 'applicant' && reject.id === a.id}
                reason={reason}
                onReason={onReason}
                onCancel={onCancelReject}
                onApprove={() => onApproveApplicant(a)}
                onRejectStart={() => onStartReject('applicant', a.id)}
                onRejectConfirm={() => onRejectApplicant(a)}
              />
            ))}
          </div>
        ) : (
          <EmptyState>{EMPTY.applicants}</EmptyState>
        ))}
    </div>
  );
}
