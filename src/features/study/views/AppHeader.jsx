import React from 'react';
import { jaramMark } from '../study.assets';

/**
 * Sticky app header with primary nav. `current` highlights the active item.
 * Nav hrefs are placeholders — wire to real routes (router <Link>) in the app.
 */
const NAV = [
  { key: 'about', label: '소개', href: '/about' },
  { key: 'study', label: '스터디', href: '/study' },
  { key: 'seminar', label: '세미나', href: '/seminar' },
  { key: 'people', label: '사람들', href: '/people' },
];

export function AppHeader({ current = 'study' }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface-page) 86%, transparent)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          height: 68,
          padding: '0 var(--container-pad)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <img src={jaramMark} alt="JARAM" style={{ height: 30 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-strong)', lineHeight: 1 }}>자람</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {NAV.map((item) => {
            const on = item.key === current;
            return (
              <a
                key={item.key}
                href={item.href}
                style={{
                  padding: '8px 13px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: on ? 'var(--w-bold)' : 'var(--w-semibold)',
                  color: on ? 'var(--brand)' : 'var(--text-faint)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            );
          })}
          <span
            style={{
              marginLeft: 8,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--brand-tint)',
              border: '1px solid var(--red-100)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              color: 'var(--brand)',
              fontSize: 15,
            }}
          >
            자
          </span>
        </nav>
      </div>
    </header>
  );
}
