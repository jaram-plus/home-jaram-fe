import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system';
import { useAuthStore } from '@/shared/auth/auth.store';
import jaramMark from '@/design-system/assets/logos/jaram-mark.png';

/**
 * Sticky translucent app header — the single header used across every page.
 *
 * JR mark + wordmark, primary nav, and an auth-aware action (로그인 CTA when
 * signed out, profile chip when signed in). Pass `current` to highlight the
 * active nav item by key; an unknown/omitted key highlights nothing.
 */
const NAV = [
  // 학회 소개는 별도 페이지가 아니라 랜딩의 Manifesto 단락이다 (sections/Manifesto.jsx).
  { key: 'about', label: '소개', href: '/#about' },
  { key: 'study', label: '스터디', href: '/study' },
  { key: 'seminar', label: '세미나', href: '/seminar' },
  { key: 'people', label: '사람들', href: '/people' },
];

const markSrc = typeof jaramMark === 'string' ? jaramMark : jaramMark.src;

export function Header({ current }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'color-mix(in srgb, var(--surface-page) 86%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          height: 72,
          padding: '0 var(--container-pad)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src={markSrc} alt="JARAM" style={{ height: 34 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-strong)', lineHeight: 1 }}>
            자람
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {NAV.map((item) => {
            const on = item.key === current;
            const style = {
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-sm)',
              fontWeight: on ? 'var(--w-bold)' : 'var(--w-semibold)',
              color: on ? 'var(--brand)' : 'var(--text-body)',
              textDecoration: 'none',
            };
            // 해시가 붙은 주소는 Link 대신 <a>로 둔다 — 라우터는 해시까지 스크롤해 주지
            // 않지만 브라우저는 해 준다. 랜딩에서는 그 자리로 바로 내려가고, 다른
            // 페이지에서는 랜딩을 열어 그 자리에서 멈춘다.
            return item.href.startsWith('/') && !item.href.includes('#') ? (
              <Link key={item.key} to={item.href} style={style}>
                {item.label}
              </Link>
            ) : (
              <a key={item.key} href={item.href} style={style}>
                {item.label}
              </a>
            );
          })}
          {isAuthenticated ? (
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px 7px 8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                background: 'var(--surface-card)',
                color: 'var(--text-strong)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--w-semibold)',
                textDecoration: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  color: 'var(--text-on-brand)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                }}
              >
                {(user?.name ?? '회').trim().charAt(0)}
              </span>
              {user?.name ?? '프로필'}
            </Link>
          ) : (
            <Button size="sm" href="/login">로그인</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
