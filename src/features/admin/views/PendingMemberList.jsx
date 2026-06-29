import React from 'react';
import { Button, Input } from '@/design-system';
import { EmptyState } from './parts';
import { EMPTY } from '../admin.data';

/** Format an ISO date-time as YYYY.MM.DD; fall back to the raw value. */
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** Inline reject form (reason textarea + cancel/confirm). */
function RejectForm({ reason, onReason, onCancel, onConfirm }) {
  return (
    <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
      <Input
        label="거절 사유"
        as="textarea"
        placeholder="신청자에게 전달할 사유를 적어 주세요."
        value={reason}
        onChange={onReason}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" onClick={onCancel}>취소</Button>
        <Button size="sm" variant="outline" onClick={onConfirm}>거절 확정</Button>
      </div>
    </div>
  );
}

/** A membership applicant awaiting officer approval. */
function MemberCard({ item, rejecting, reason, onReason, onCancel, onApprove, onRejectStart, onRejectConfirm }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>{item.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{item.studentId}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>신청일 {formatDate(item.createdAt)}</span>
      </div>
      <div style={{ marginTop: 14, background: 'var(--surface-sunken)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--w-semibold)', letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6 }}>
          이메일
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>{item.email}</p>
      </div>

      {rejecting ? (
        <RejectForm reason={reason} onReason={onReason} onCancel={onCancel} onConfirm={onRejectConfirm} />
      ) : (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={onRejectStart}>거절</Button>
          <Button size="sm" onClick={onApprove}>가입 승인</Button>
        </div>
      )}
    </div>
  );
}

/**
 * Pending-member approval list. `rejectId` identifies the row whose inline
 * reject form is open (null when none).
 */
export function PendingMemberList({
  members, loading, error,
  rejectId, reason, onReason, onCancelReject, onStartReject,
  onApprove, onReject,
}) {
  if (loading || error) {
    return <EmptyState>{error ? '목록을 불러오지 못했습니다.' : '불러오는 중…'}</EmptyState>;
  }
  if (members.length === 0) {
    return <EmptyState>{EMPTY}</EmptyState>;
  }
  return (
    <div className="jr-anim" style={{ display: 'grid', gap: 16 }}>
      {members.map((m) => (
        <MemberCard
          key={m.id}
          item={m}
          rejecting={rejectId === m.id}
          reason={reason}
          onReason={onReason}
          onCancel={onCancelReject}
          onApprove={() => onApprove(m)}
          onRejectStart={() => onStartReject(m.id)}
          onRejectConfirm={() => onReject(m)}
        />
      ))}
    </div>
  );
}
