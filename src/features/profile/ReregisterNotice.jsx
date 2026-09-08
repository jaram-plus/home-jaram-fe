import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/design-system';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useMe, meKeys } from './profile.queries';
import { requestReregistration } from './profile.api';
import { NOTICE } from './profile.data';

// 닫으면 그 세션 동안만 조용하다. 탭을 다시 열면 다시 뜬다 — 신청하지 않는 한
// 재등록해야 할 이유가 남아 있기 때문이다.
//
// 키에 회원 id 를 붙인다. 하나로 두면 같은 탭에서 로그아웃하고 다른 재등록 대상
// 계정으로 들어왔을 때 공지가 뜨지 않는다 (학회 공용 PC 에서 걸린다).
const dismissKey = (memberId) => `jaram-reregister-notice-dismissed:${memberId}`;

const readDismissed = (memberId) => {
  try {
    return sessionStorage.getItem(dismissKey(memberId)) === '1';
  } catch {
    return false;
  }
};

/**
 * 학기 전환으로 재등록 대상이 된 회원에게 띄우는 화면 중앙 공지.
 * 모든 페이지 위에 뜨도록 App 에서 라우트 밖에 단다. 로그인하지 않았으면
 * GET /api/me 를 부르지 않기 위해 바깥에서 한 번 걸러 낸다.
 */
export function ReregisterNotice() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return null;
  return <Notice />;
}

function Notice() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [dismissedId, setDismissedId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const panel = useRef(null);

  const memberId = me?.id;
  const dismissed = memberId != null
    && (dismissedId === memberId || readDismissed(memberId));
  const open = !dismissed && me?.status === 'REREGISTER';

  const close = () => {
    setDismissedId(memberId);
    try {
      sessionStorage.setItem(dismissKey(memberId), '1');
    } catch {
      // 저장이 막힌 브라우저에서도 닫히기는 해야 한다.
    }
  };

  // aria-modal 을 붙였으면 실제로도 막아야 한다. 열릴 때 포커스를 안으로 옮기고,
  // Escape 로 닫고, 뒤 페이지가 스크롤되지 않게 한다.
  useEffect(() => {
    if (!open) return undefined;
    panel.current?.focus();   // 다이얼로그 자체에 포커스를 준다 — 내용이 먼저 읽힌다
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, memberId]);

  if (!open) return null;

  // 신청해도 임원이 승인할 때까지 상태는 그대로다. 신청 시각이 그 둘을 가른다.
  const requested = Boolean(me.reregisterRequestedAt);

  const submit = async () => {
    setSending(true);
    setError('');
    try {
      await requestReregistration();
      await qc.invalidateQueries({ queryKey: meKeys.me });
    } catch (err) {
      // 409 는 '재등록 대상이 아니다' — 기다리는 사이 임원이 승인한 경우다. 다시
      // 시도해도 계속 409 이므로, 새 상태를 받아 팝업이 스스로 닫히게 한다.
      if (err?.response?.status === 409) {
        await qc.invalidateQueries({ queryKey: meKeys.me });
        return;
      }
      setError(NOTICE.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reregister-notice-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(28,24,19,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: 440,
          outline: 'none',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderTop: '3px solid var(--brand)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-7)',
        }}
      >
        <h2
          id="reregister-notice-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'var(--fs-title-3)',
            color: 'var(--text-strong)',
          }}
        >
          {requested ? NOTICE.pendingTitle : NOTICE.title}
        </h2>
        <p
          style={{
            margin: 'var(--space-3) 0 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-sm)',
            lineHeight: 'var(--lh-normal)',
            color: 'var(--text-muted)',
          }}
        >
          {requested ? NOTICE.pendingBody : NOTICE.body}
        </p>
        {error && (
          <p
            style={{
              margin: 'var(--space-3) 0 0',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-sm)',
              color: 'var(--brand)',
            }}
          >
            {error}
          </p>
        )}
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          {requested ? (
            <Button size="sm" onClick={close}>{NOTICE.confirm}</Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={close}>{NOTICE.later}</Button>
              <Button size="sm" onClick={submit} disabled={sending}>
                {sending ? NOTICE.sending : NOTICE.submit}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
