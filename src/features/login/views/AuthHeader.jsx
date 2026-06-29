import React from 'react';
import { jaramMark } from '../login.assets';

/** Slim top bar for the auth screens — JR mark + wordmark + heritage label. */
export function AuthHeader() {
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
          height: 72,
          padding: '0 var(--container-pad)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <img src={jaramMark} alt="JARAM" style={{ height: 34 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-strong)', lineHeight: 1 }}>
          자람
        </span>
        <span
          style={{
            marginLeft: 14,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 'var(--w-semibold)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Hanyang ERICA · Since 1984
        </span>
      </div>
    </header>
  );
}
