import React, { useState, useRef, useCallback } from 'react';
import './seminar.css';
import { Button } from '@/design-system';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useForm } from './useForm';
import { ROSTER_TABS, MESSAGES, TOAST } from './seminar.data';
import { useSeminars, useRoster, useAttend, useCreateSeminar } from './seminar.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  TabButton,
  ListView,
  RosterView,
  AttendModal,
  CreateModal,
} from './views';

const SUB_NAV = [
  { key: 'list', label: '세미나 목록' },
  { key: 'roster', label: '출석 현황' },
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
 * JARAM seminar page — browse the schedule, check in with an attendance code,
 * create a seminar (officer), and review who attended, as a single-route view
 * machine (list | roster).
 *
 * Attendance and creation call the placeholder API in seminar.api.js; attended
 * seminars are tracked in local state so the demo flow is walkable. Wire the
 * API to the Spring backend (the code check belongs server-side) and replace
 * the demo navigation/toasts with real routing + server responses.
 */
export default function SeminarPage() {
  const isAdmin = useAuthStore((s) => s.user?.authority === 'ADMIN');
  const subNav = SUB_NAV.filter((t) => t.key !== 'roster' || isAdmin);

  const [view, setView] = useState('list'); // list | roster
  const [filter, setFilter] = useState('all'); // all | upcoming | ended
  const [attended, setAttended] = useState({}); // seminarId -> true
  const [rosterSel, setRosterSel] = useState(ROSTER_TABS[0].key);

  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm({ title: '', speaker: '', topic: '', startsAt: '', place: '', mode: '', attendanceCode: '', materialUrl: '' });

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // --- server state ---
  const seminarsQ = useSeminars();
  const rosterQ = useRoster(rosterSel);
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
  const createM = useCreateSeminar({
    onSuccess: () => {
      setCreateOpen(false);
      showToast(TOAST.created);
    },
    onError: () => {
      // 모달은 열어 둔 채(입력 보존) 토스트로 실패를 알린다.
      showToast(MESSAGES.createServer);
    },
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

  // --- create ---
  function openCreate() {
    createForm.reset();
    setCreateOpen(true);
  }
  function submitCreate() {
    const errs = {};
    if (!createForm.values.title.trim()) errs.title = MESSAGES.titleRequired;
    if (!createForm.values.startsAt) errs.startsAt = MESSAGES.startsAtRequired;
    if (Object.keys(errs).length) {
      createForm.setErrors(errs);
      return;
    }
    createM.mutate(createForm.values);
  }

  const roster = rosterQ.data;
  const seminars = seminarsQ.data ?? [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="seminar" />

      {/* page title + sub-nav */}
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
          {isAdmin && <Button onClick={openCreate}>＋ 세미나 개설하기</Button>}
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 34, borderBottom: '1px solid var(--border)' }}>
          {subNav.map((t) => (
            <TabButton key={t.key} active={view === t.key} onClick={() => setView(t.key)}>{t.label}</TabButton>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {view === 'list' && (
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
              onAttend={openAttend}
            />
          )
        )}
        {view === 'roster' && isAdmin && (
          <RosterView
            roster={roster}
            selected={rosterSel}
            onSelect={setRosterSel}
            loading={rosterQ.isLoading}
            error={rosterQ.isError}
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

      {createOpen && <CreateModal form={createForm} onClose={() => setCreateOpen(false)} onSubmit={submitCreate} pending={createM.isPending} />}

      <Toast message={toast} />
    </div>
  );
}
