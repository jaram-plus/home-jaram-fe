import React, { useState, useRef, useCallback } from 'react';
import './admin.css';
import { MESSAGES, TOAST } from './admin.data';
import { usePendingMembers, useApproveMember, useRejectMember } from './admin.queries';
import { AppHeader, Toast, Eyebrow, PendingMemberList } from './views';

/**
 * JARAM admin page — officer-only membership approval (UC-A5). Lists members
 * awaiting approval and lets an officer approve (status=ACTIVE, 로그인 가능) or
 * reject with a reason (status=REJECTED). Approve/reject call the backend via
 * admin.queries; the pending list is invalidated by the mutation hooks.
 *
 * Officer-authority enforcement is server-side (403 on the endpoints). Route
 * guarding by authority can wrap this page once roles are wired client-side.
 */
export default function AdminPage() {
  const [rejectId, setRejectId] = useState(null); // member id whose reject form is open
  const [reason, setReason] = useState('');

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const cancelReject = useCallback(() => {
    setRejectId(null);
    setReason('');
  }, []);

  const pendingQ = usePendingMembers();

  const approveM = useApproveMember({
    onSuccess: (_d, vars) => { setRejectId(null); showToast(TOAST.approved(vars.name)); },
  });
  const rejectM = useRejectMember({
    onSuccess: () => { cancelReject(); showToast(TOAST.rejected); },
  });

  const approve = (m) => approveM.mutate({ memberId: m.id, name: m.name });
  const reject = (m) => {
    if (!reason.trim()) {
      showToast(MESSAGES.reasonRequired);
      return;
    }
    rejectM.mutate({ memberId: m.id, reason });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="admin" />

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) var(--container-pad) 0' }}>
        <Eyebrow>Admin</Eyebrow>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--fs-title-1)', color: 'var(--text-strong)', lineHeight: 1.1 }}>
          가입 승인 대기
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
          가입을 신청한 회원을 검토하고 승인하거나 거절합니다.
        </p>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        <PendingMemberList
          members={pendingQ.data ?? []}
          loading={pendingQ.isLoading}
          error={pendingQ.isError}
          rejectId={rejectId}
          reason={reason}
          onReason={(e) => setReason(e.target.value)}
          onCancelReject={cancelReject}
          onStartReject={(id) => { setRejectId(id); setReason(''); }}
          onApprove={approve}
          onReject={reject}
        />
      </section>

      <Toast message={toast} />
    </div>
  );
}
