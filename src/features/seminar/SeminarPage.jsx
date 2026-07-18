import React, { useState, useRef, useCallback } from 'react';
import './seminar.css';
import { useAuthStore } from '@/shared/auth/auth.store';
import { MESSAGES, TOAST } from './seminar.data';
import { useSeminars, useAttend } from './seminar.queries';
import {
  AppHeader,
  Toast,
  Eyebrow,
  ListView,
  AttendModal,
  DetailModal,
} from './views';

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

  const [filter, setFilter] = useState('upcoming'); // upcoming | ended | absent | all
  const [attended, setAttended] = useState({}); // seminarId -> true

  const [attendSeminar, setAttendSeminar] = useState(null);
  const [attendCode, setAttendCode] = useState('');
  const [attendErr, setAttendErr] = useState('');
  const [detailSeminar, setDetailSeminar] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // --- server state ---
  const seminarsQ = useSeminars();
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

  const seminars = seminarsQ.data ?? [];

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

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '28px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {seminarsQ.isLoading ? (
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

      <Toast message={toast} />
    </div>
  );
}
