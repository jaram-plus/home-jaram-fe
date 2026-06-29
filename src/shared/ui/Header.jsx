import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system';
import { useAuthStore } from '@/shared/auth/auth.store';
import jaramMark from '@/design-system/assets/logos/jaram-mark.png';

/**
 * Sticky translucent app header — the single header used across every page.
 *
 * JR mark + wordmark, primary nav, and an auth-aware action (지원하기 CTA when
 * signed out, profile chip when signed in). Pass `current` to highlight the
 * active nav item by key; an unknown/omitted key highlights nothing.
 */
const NAV = [
  { key: 'about', label: '소개', href: '#' },
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
            return item.href.startsWith('/') ? (
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
            // TODO: /profile 페이지·라우트 미구현 (App.tsx). 추가되면 span→<Link to="/profile">로 교체.
            <span
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
            </span>
          ) : (
            <Button size="sm" href="/apply">지원하기</Button>
          )}
        </nav>
      </div>
    </header>
  );
}
