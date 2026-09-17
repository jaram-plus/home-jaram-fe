import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './study.css';
import { Button } from '@/design-system';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useForm } from './useForm';
import {
  MESSAGES,
  TOAST,
  toMyStudyItems,
  CREATE_BLANK,
  toCreatePayload,
  validateCreate,
  createErrorMessage,
} from './study.data';
import {
  useStudies,
  useMyActivity,
  useApplyStudy,
  useCreateStudy,
  useDeleteApplication,
} from './study.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  BrowseView,
  MyStudyView,
  StudyDetailModal,
  ApplyModal,
  CreateModal,
  ManageStudyModal,
  MyAttendanceModal,
} from './views';
import { ModalShell } from './views/ModalShell';
import { EmptyState } from './views/parts';

// 임원의 개설 승인·신청자 관리는 관리자 콘솔 '스터디 관리'(/admin/studies)가 맡는다.
// 회원용 페이지에 임원 탭을 두면 모두에게 보이고 모두가 403 을 받는다.
const SUB_NAV = [
  { key: 'browse', label: '스터디' },
  { key: 'mine', label: '내 스터디' },
];

/** 목록 영역의 로딩/에러 안내 한 줄. */
function Notice({ children }) {
  return (
    <p className="jr-anim" style={{ margin: 0, padding: '48px 4px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

/**
 * 로그인 전 '내 스터디'. 관계가 있어야 존재하는 탭이라 비어 있는 것이 아니라
 * 아직 볼 자격이 없는 것이고, 빈 목록과 같은 얼굴을 하면 거짓이 된다.
 * 비어 있을 때의 '스터디 둘러보기'와 같은 자리에 갈 곳을 하나 둔다.
 */
function SignInPrompt() {
  const navigate = useNavigate();
  return (
    <div className="jr-anim">
      <EmptyState>내 스터디는 가입 후 이용할 수 있습니다.</EmptyState>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={() => navigate('/login?redirect=/study')}>로그인하기</Button>
      </div>
    </div>
  );
}

/**
 * JARAM study page — browse the catalogue, apply (motivation required), create
 * a study (officer approval), and '내 스터디', as a single-route view machine.
 *
 * 임원의 개설 승인·신청자 관리는 여기 없다 — 관리자 콘솔이 맡는다.
 *
 * 제출 핸들러는 study.api.js 로 실 서버를 부른다 — 경로와 응답 모양의 단일 출처는
 * docs/api/openapi.yaml 이고, 백엔드가 그대로 구현하고 있다. 성공하면 영향받는
 * 쿼리를 무효화해(study.queries.js) 목록이 서버에서 다시 온다.
 */
export default function StudyPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [view, setView] = useState('browse'); // browse | mine
  const [filter, setFilter] = useState('all'); // all | recruiting | ongoing

  const [detailStudy, setDetailStudy] = useState(null);  // 읽기 전용 상세 모달
  const [applyStudy, setApplyStudy] = useState(null);
  const [applyMotive, setApplyMotive] = useState('');
  const [applyErr, setApplyErr] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm(CREATE_BLANK);

  const [managing, setManaging] = useState(null);                   // 관리하기 모달
  const [viewingAttendance, setViewingAttendance] = useState(null); // 멤버의 내 출석 모달
  const [deleting, setDeleting] = useState(null);                   // 반려 신청 카드

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const go = useCallback((next) => setView(next), []);

  // --- server state ---
  const studiesQ = useStudies();
  const myActivityQ = useMyActivity(isAuthenticated);

  // 개설 신청 창. 임원이 관리자 콘솔 '스터디 관리'에서 여닫고, 서버는 닫혀 있으면
  // POST /api/studies 를 409 RECRUIT_CLOSED 로 막는다. 닫힌 창 앞에 버튼만 세워 두면
  // 눌러 본 사람만 그 사실을 알게 되므로, 버튼 자체를 내린다.
  const recruiting = Boolean(studiesQ.data?.recruiting);

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
    createM.reset(); // 지난번 실패 문구를 빈 폼에 얹지 않는다.
    setCreateOpen(true);
  }
  function submitCreate() {
    const errors = validateCreate(createForm.values);
    if (Object.keys(errors).length > 0) {
      createForm.setErrors(errors);
      return;
    }
    createM.mutate(toCreatePayload(createForm.values));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="study" />

      {/* page title + sub-nav */}
      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) var(--container-pad) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Study</Eyebrow>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--fs-title-1)', color: 'var(--text-strong)', lineHeight: 1.1 }}>
              스터디
            </h1>
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              자람에서 함께 공부할 스터디를 찾아보세요.
            </p>
          </div>
          {recruiting && <Button onClick={openCreate}>＋ 스터디 개설하기</Button>}
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
            <BrowseView studies={studiesQ.data?.items ?? []} filter={filter} onFilter={setFilter}
              onOpen={setDetailStudy} onApply={openApply} />
          )
        )}
        {view === 'mine' && (
          !isAuthenticated ? (
            <SignInPrompt />
          ) : myActivityQ.isLoading || studiesQ.isLoading ? (
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
      </section>

      {detailStudy && (
        <StudyDetailModal
          study={detailStudy}
          authenticated={isAuthenticated}
          onClose={() => setDetailStudy(null)}
        />
      )}

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

      {createOpen && (
        <CreateModal
          form={createForm}
          onClose={() => setCreateOpen(false)}
          onSubmit={submitCreate}
          pending={createM.isPending}
          error={createErrorMessage(createM.error)}
        />
      )}

      {managing && (
        <ManageStudyModal
          study={managing}
          onClose={() => setManaging(null)}
          onToast={showToast}
        />
      )}

      {viewingAttendance && (
        <MyAttendanceModal
          study={viewingAttendance}
          onClose={() => setViewingAttendance(null)}
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
