import React, { useState, useRef, useCallback, useMemo } from 'react';
import './study.css';
import { Button } from '@/design-system';
import { useForm } from './useForm';
import { MESSAGES, TOAST, toMyStudyItems } from './study.data';
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
  useDeleteApplication,
} from './study.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  BrowseView,
  MyStudyView,
  ManageView,
  ApplyModal,
  CreateModal,
  ManageStudyModal,
} from './views';
import { ModalShell } from './views/ModalShell';

const SUB_NAV = [
  { key: 'browse', label: '스터디' },
  { key: 'mine', label: '내 스터디' },
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
 * Submit/approve/reject handlers call the real Spring endpoints via
 * study.api.js (paths are a proposed REST contract until the backend confirms
 * them — see that file's header); success invalidates the affected queries
 * (study.queries.js) so the lists refresh from the server.
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

  const [managing, setManaging] = useState(null);                   // 관리하기 모달
  const [_viewingAttendance, setViewingAttendance] = useState(null); // Task 12 가 읽는다
  const [deleting, setDeleting] = useState(null);                   // 반려 신청 카드

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

  // 관계는 서버가 아니라 여기서 정한다 — /my 의 두 배열과 둘러보기 목록을 합친다.
  // 두 쿼리 다 이 페이지가 이미 부르므로 호출이 늘지 않는다.
  const myItems = useMemo(
    () => toMyStudyItems(myActivityQ.data, studiesQ.data?.items ?? []),
    [myActivityQ.data, studiesQ.data],
  );

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
  // 관리 탭은 임원용 전체 목록이라 스터디별 목록을 쓰지 않는다 — studyId 가 null 이다.
  const approveApplicantM = useApproveApplicant(null, {
    onSuccess: (_d, vars) => { setReject(NO_REJECT); showToast(TOAST.applicantApproved(vars.name)); },
  });
  const rejectApplicantM = useRejectApplicant(null, {
    onSuccess: () => { cancelReject(); showToast(TOAST.applicantRejected); },
  });
  const deleteApplicationM = useDeleteApplication({
    onSuccess: () => { setDeleting(null); showToast(TOAST.applicationDeleted); },
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
            <BrowseView studies={studiesQ.data?.items ?? []} filter={filter} onFilter={setFilter} onApply={openApply} />
          )
        )}
        {view === 'mine' && (
          myActivityQ.isLoading || studiesQ.isLoading ? (
            <Notice>불러오는 중…</Notice>
          ) : myActivityQ.isError ? (
            <Notice>내 스터디를 불러오지 못했습니다.</Notice>
          ) : (
            <MyStudyView
              items={myItems}
              onManage={setManaging}
              onAttendance={setViewingAttendance}
              onDelete={setDeleting}
              onBrowse={() => go('browse')}
            />
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

      {managing && (
        <ManageStudyModal
          study={managing}
          onClose={() => setManaging(null)}
          onToast={showToast}
        />
      )}

      {deleting && (
        <ModalShell
          title="신청 삭제"
          lead={`'${deleting.title}' 신청 기록을 지웁니다. 삭제하면 이 스터디에 다시 신청할 수 있습니다.`}
          onClose={() => setDeleting(null)}
        >
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 28 }}>
            <Button variant="secondary" onClick={() => setDeleting(null)}>취소</Button>
            <Button
              onClick={() => deleteApplicationM.mutate({ applicationId: deleting.applicationId })}
              disabled={deleteApplicationM.isPending}
            >
              삭제하기
            </Button>
          </div>
        </ModalShell>
      )}

      <Toast message={toast} />
    </div>
  );
}
