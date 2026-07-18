import React, { useState, useRef, useCallback } from 'react';
import './seminar.css';
import { useAuthStore } from '@/shared/auth/auth.store';
import { MESSAGES, TOAST } from './seminar.data';
import { SCHEDULE_MESSAGES, SCHEDULE_TOAST } from './schedule.data';
import { useSeminars, useAttend, useResubmitSeminar } from './seminar.queries';
import { useSchedules, useClaimSlot, useCancelSlot, useSubmitSlotSeminar } from './schedule.queries';
import { useForm } from './useForm';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  ListView,
  ScheduleView,
  AttendModal,
  DetailModal,
  ClaimModal,
  SlotSeminarModal,
} from './views';

const TABS = [
  { key: 'list', label: '목록' },
  { key: 'schedule', label: '일정' },
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
 * JARAM seminar page — browse the schedule and check in with an attendance code.
 *
 * Attendance calls the real Spring endpoint via seminar.api.js (path is a
 * proposed REST contract until the backend confirms it — see that file's
 * header; the code check is validated server-side). `attended` mirrors a
 * successful check-in in local state since the mutation doesn't invalidate
 * the seminar list query.
 *
 * Seminar creation lives in the admin page (`/admin/seminars`), not here —
 * officers add rows to the seminars table there instead of a page-level modal.
 */
export default function SeminarPage() {
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [view, setView] = useState('list'); // list | schedule
  const [filter, setFilter] = useState('upcoming'); // upcoming | ended | absent | all
  const [attended, setAttended] = useState({}); // seminarId -> true

  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');
  const [detailSeminar, setDetailSeminar] = useState(null);

  const [claimTarget, setClaimTarget] = useState(null); // { schedule, index }
  const [claimErr, setClaimErr] = useState('');
  const [seminarSlot, setSeminarSlot] = useState(null); // { schedule, slot, editing }
  const seminarSlotForm = useForm({ title: '', speaker: '', topic: '', description: '', materialUrl: '', target: [] });

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // --- server state ---
  const seminarsQ = useSeminars();
  const schedulesQ = useSchedules();
  const attendM = useAttend({
    onSuccess: () => {
      setAttended((map) => ({ ...map, [attendSeminar.id]: true }));
      setAttendSeminar(null);
      showToast(TOAST.attended);
    },
    onError: (err) => {
      setAttendErr(err.code === 'INVALID_CODE' ? MESSAGES.codeWrong : MESSAGES.codeServer);
    },
  });
  const claimM = useClaimSlot({
    onSuccess: () => {
      setClaimTarget(null);
      showToast(SCHEDULE_TOAST.claimed);
    },
    onError: (err) => {
      setClaimErr(err.code === 'SLOT_TAKEN' ? SCHEDULE_MESSAGES.claimTaken : SCHEDULE_MESSAGES.claimServer);
    },
  });
  const cancelM = useCancelSlot({
    onSuccess: () => showToast(SCHEDULE_TOAST.canceled),
    onError: () => showToast(SCHEDULE_MESSAGES.cancelServer),
  });
  const submitSeminarM = useSubmitSlotSeminar({
    onSuccess: () => {
      setSeminarSlot(null);
      showToast(SCHEDULE_TOAST.seminarSubmitted);
    },
    onError: () => showToast(SCHEDULE_MESSAGES.seminarServer),
  });
  const resubmitSeminarM = useResubmitSeminar({
    onSuccess: () => {
      setSeminarSlot(null);
      showToast(SCHEDULE_TOAST.seminarResubmitted);
    },
    onError: () => showToast(SCHEDULE_MESSAGES.seminarServer),
  });

  // --- attend ---
  function openAttend(seminar) {
    setAttendSeminar(seminar);
    setAttendCode('');
    setAttendErr('');
  }
  function submitAttend() {
    const code = attendCode.trim();
    if (!code) {
      setAttendErr(MESSAGES.codeRequired);
      return;
    }
    // 코드 검증은 서버가 담당한다 — 실패 시 onError에서 메시지를 띄운다.
    setAttendErr('');
    attendM.mutate({ seminarId: attendSeminar.id, code });
  }

  // --- schedule slots ---
  function openClaim(scheduleId, index) {
    const schedule = (schedulesQ.data ?? []).find((s) => s.id === scheduleId);
    setClaimTarget({ schedule, index });
    setClaimErr('');
  }
  function confirmClaim() {
    claimM.mutate({ scheduleId: claimTarget.schedule.id, index: claimTarget.index });
  }
  function cancelSlot(scheduleId, index) {
    cancelM.mutate({ scheduleId, index });
  }
  function openCreateSeminar(schedule, slot) {
    seminarSlotForm.reset();
    setSeminarSlot({ schedule, slot, editing: false });
  }
  function openEditSeminar(schedule, slot) {
    seminarSlotForm.reset();
    setSeminarSlot({ schedule, slot, editing: true });
  }
  function submitSeminarSlot() {
    if (!seminarSlotForm.values.title.trim()) {
      seminarSlotForm.setErrors({ title: SCHEDULE_MESSAGES.seminarTitleRequired });
      return;
    }
    if (seminarSlot.editing) {
      resubmitSeminarM.mutate({ id: seminarSlot.slot.seminarId, form: seminarSlotForm.values });
    } else {
      submitSeminarM.mutate({ scheduleId: seminarSlot.schedule.id, index: seminarSlot.slot.index, form: seminarSlotForm.values });
    }
  }

  const seminars = seminarsQ.data ?? [];
  const schedules = schedulesQ.data ?? [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="seminar" />

      {/* page title */}
      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) var(--container-pad) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Seminar</Eyebrow>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--fs-title-1)', color: 'var(--text-strong)', lineHeight: 1.1 }}>
              세미나
            </h1>
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              자람에서 열리는 세미나를 확인하고 출석을 체크하세요.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '18px var(--container-pad) 0' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => (
            <TabButton key={t.key} active={view === t.key} onClick={() => setView(t.key)}>
              {t.label}
            </TabButton>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {view === 'list' ? (
          seminarsQ.isLoading ? (
            <Notice>불러오는 중…</Notice>
          ) : seminarsQ.isError ? (
            <Notice>세미나 목록을 불러오지 못했습니다.</Notice>
          ) : (
            <ListView
              seminars={seminars}
              filter={filter}
              onFilter={setFilter}
              attended={attended}
              isLoggedIn={isLoggedIn}
              onAttend={openAttend}
              onOpenDetail={setDetailSeminar}
            />
          )
        ) : schedulesQ.isLoading ? (
          <Notice>불러오는 중…</Notice>
        ) : schedulesQ.isError ? (
          <Notice>일정을 불러오지 못했습니다.</Notice>
        ) : (
          <ScheduleView
            schedules={schedules}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            onClaim={openClaim}
            onCancel={cancelSlot}
            onCreateSeminar={openCreateSeminar}
            onEditSeminar={openEditSeminar}
          />
        )}
      </section>

      {attendSeminar && (
        <AttendModal
          code={attendCode}
          error={attendErr}
          onCode={(e) => { setAttendCode(e.target.value); setAttendErr(''); }}
          onClose={() => setAttendSeminar(null)}
          onSubmit={submitAttend}
        />
      )}

      {detailSeminar && (
        <DetailModal
          seminar={detailSeminar}
          isLoggedIn={isLoggedIn}
          onClose={() => setDetailSeminar(null)}
        />
      )}

      {claimTarget && (
        <ClaimModal
          schedule={claimTarget.schedule}
          error={claimErr}
          onClose={() => setClaimTarget(null)}
          onConfirm={confirmClaim}
          pending={claimM.isPending}
        />
      )}

      {seminarSlot && (
        <SlotSeminarModal
          schedule={seminarSlot.schedule}
          slot={seminarSlot.slot}
          form={seminarSlotForm}
          editing={seminarSlot.editing}
          seminarId={seminarSlot.slot.seminarId}
          onClose={() => setSeminarSlot(null)}
          onSubmit={submitSeminarSlot}
          pending={submitSeminarM.isPending || resubmitSeminarM.isPending}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
