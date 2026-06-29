import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/design-system';
import { jaramMark } from '../landing.assets';
import { NAV } from '../landing.data';

/** Sticky translucent header — JR mark + wordmark, nav, apply CTA. */
export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(247, 241, 229, 0.86)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: 72,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src={jaramMark} alt="JARAM" style={{ height: 34 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-strong)' }}>자람</span>
        </Link>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            fontSize: 14,
            fontWeight: 'var(--w-semibold)',
            color: 'var(--text-body)',
          }}
        >
          {NAV.map((item) => {
            const style = { color: 'inherit', textDecoration: 'none' };
            return item.href.startsWith('/') ? (
              <Link key={item.label} to={item.href} style={style}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} style={style}>
                {item.label}
              </a>
            );
          })}
          <Button size="sm" href="/apply">지원하기</Button>
        </nav>
      </div>
    </header>
  );
}
