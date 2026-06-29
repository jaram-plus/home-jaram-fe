import React, { useState, useRef, useCallback } from 'react';
import './study.css';
import { Button } from '@/design-system';
import { useForm } from './useForm';
import { MESSAGES, TOAST } from './study.data';
import {
  useStudies,
  usePending,
  useApplicants,
  useMyActivity,
  useApplyStudy,
  useCreateStudy,
  useApproveStudy,
  useRejectStudy,
  useApproveApplicant,
  useRejectApplicant,
} from './study.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  BrowseView,
  MyActivityView,
  ManageView,
  ApplyModal,
  CreateModal,
} from './views';

const SUB_NAV = [
  { key: 'browse', label: '스터디' },
  { key: 'mine', label: '내 활동' },
  { key: 'manage', label: '관리' },
];

const NO_REJECT = { kind: null, id: null };

/** 목록 영역의 로딩/에러 안내 한 줄. */
function Notice({ children }) {
  return (
    <p className="jr-anim" style={{ margin: 0, padding: '48px 4px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

/**
 * JARAM study page — browse the catalogue, apply (motivation required), create
 * a study (officer approval), and the officer-side management of study
 * approvals and applicants, as a single-route view machine.
 *
 * Submit/approve/reject handlers call the placeholder API in study.api.js;
 * the management lists are kept in local state and filtered on approve/reject
 * so the flow is walkable. Wire the API to the Spring backend and replace the
 * demo navigation/toasts with real routing + server responses.
 */
export default function StudyPage() {
  const [view, setView] = useState('browse'); // browse | mine | manage
  const [filter, setFilter] = useState('all'); // all | recruiting | ongoing
  const [manageTab, setManageTab] = useState('studies'); // studies | applicants

  const [applyStudy, setApplyStudy] = useState(null);
  const [applyMotive, setApplyMotive] = useState('');
  const [applyErr, setApplyErr] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm({ title: '', fields: '', recruit: '', schedule: '', period: '', mode: '', intro: '' });

  const [reject, setReject] = useState(NO_REJECT); // { kind: 'study'|'applicant', id }
  const [reason, setReason] = useState('');

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const cancelReject = useCallback(() => {
    setReject(NO_REJECT);
    setReason('');
  }, []);

  const go = useCallback((next) => {
    setView(next);
    setReject(NO_REJECT);
    setReason('');
  }, []);

  // --- server state ---
  const studiesQ = useStudies();
  const pendingQ = usePending();
  const applicantsQ = useApplicants();
  const myActivityQ = useMyActivity();

  const applyM = useApplyStudy({
    onSuccess: () => { setApplyStudy(null); showToast(TOAST.applied); },
  });
  const createM = useCreateStudy({
    onSuccess: () => { setCreateOpen(false); showToast(TOAST.created); },
  });
  // 승인·거절 성공 시 관련 목록은 훅이 무효화한다 — 여기선 UI 상태만 정리.
  const approveStudyM = useApproveStudy({
    onSuccess: (_d, vars) => { setReject(NO_REJECT); showToast(TOAST.studyPublished(vars.title)); },
  });
  const rejectStudyM = useRejectStudy({
    onSuccess: () => { cancelReject(); showToast(TOAST.studyRejected); },
  });
  const approveApplicantM = useApproveApplicant({
    onSuccess: (_d, vars) => { setReject(NO_REJECT); showToast(TOAST.applicantApproved(vars.name)); },
  });
  const rejectApplicantM = useRejectApplicant({
    onSuccess: () => { cancelReject(); showToast(TOAST.applicantRejected); },
  });

  // --- apply ---
  function openApply(study) {
    setApplyStudy(study);
    setApplyMotive('');
    setApplyErr('');
  }
  function submitApply() {
    if (!applyMotive.trim()) {
      setApplyErr(MESSAGES.motiveRequired);
      return;
    }
    applyM.mutate({ studyId: applyStudy.id, motive: applyMotive });
  }

  // --- create ---
  function openCreate() {
    createForm.reset();
    setCreateOpen(true);
  }
  function submitCreate() {
    if (!createForm.values.title.trim()) {
      createForm.setErrors({ title: MESSAGES.titleRequired });
      return;
    }
    createM.mutate(createForm.values);
  }

  // --- manage ---
  const startReject = (kind, id) => {
    setReject({ kind, id });
    setReason('');
  };

  const approveStudy = (p) => approveStudyM.mutate({ studyId: p.id, title: p.title });
  const rejectStudy = (p) => rejectStudyM.mutate({ studyId: p.id, reason });
  const approveApplicant = (a) => approveApplicantM.mutate({ applicantId: a.id, name: a.name });
  const rejectApplicant = (a) => rejectApplicantM.mutate({ applicantId: a.id, reason });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="study" />

      {/* page title + sub-nav */}
      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) var(--container-pad) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Study</Eyebrow>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--fs-title-1)', color: 'var(--text-strong)', lineHeight: 1.1 }}>
              진행 중인 스터디
            </h1>
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              자람에서 함께 공부할 스터디를 찾아보세요.
            </p>
          </div>
          <Button onClick={openCreate}>＋ 스터디 개설하기</Button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 34, borderBottom: '1px solid var(--border)' }}>
          {SUB_NAV.map((t) => (
            <TabButton key={t.key} active={view === t.key} onClick={() => go(t.key)}>{t.label}</TabButton>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {view === 'browse' && (
          studiesQ.isLoading ? (
            <Notice>불러오는 중…</Notice>
          ) : studiesQ.isError ? (
            <Notice>스터디 목록을 불러오지 못했습니다.</Notice>
          ) : (
            <BrowseView studies={studiesQ.data ?? []} filter={filter} onFilter={setFilter} onApply={openApply} />
          )
        )}
        {view === 'mine' && (
          myActivityQ.isLoading ? (
            <Notice>불러오는 중…</Notice>
          ) : myActivityQ.isError ? (
            <Notice>내 활동을 불러오지 못했습니다.</Notice>
          ) : (
            <MyActivityView apps={myActivityQ.data?.apps ?? []} studies={myActivityQ.data?.studies ?? []} />
          )
        )}
        {view === 'manage' && (
          <ManageView
            tab={manageTab}
            onTab={(t) => { setManageTab(t); cancelReject(); }}
            pending={pendingQ.data ?? []}
            applicants={applicantsQ.data ?? []}
            loading={pendingQ.isLoading || applicantsQ.isLoading}
            error={pendingQ.isError || applicantsQ.isError}
            reject={reject}
            reason={reason}
            onReason={(e) => setReason(e.target.value)}
            onCancelReject={cancelReject}
            onStartReject={startReject}
            onApproveStudy={approveStudy}
            onRejectStudy={rejectStudy}
            onApproveApplicant={approveApplicant}
            onRejectApplicant={rejectApplicant}
          />
        )}
      </section>

      {applyStudy && (
        <ApplyModal
          studyName={applyStudy.title}
          motive={applyMotive}
          error={applyErr}
          onMotive={(e) => { setApplyMotive(e.target.value); setApplyErr(''); }}
          onClose={() => setApplyStudy(null)}
          onSubmit={submitApply}
        />
      )}

      {createOpen && <CreateModal form={createForm} onClose={() => setCreateOpen(false)} onSubmit={submitCreate} />}

      <Toast message={toast} />
    </div>
  );
}
