import React from 'react';
import { jaramMark } from '../landing.assets';
import { FOOT_MENU } from '../landing.data';

/** Footer — brand block + menu columns + copyright. */
export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-page)',
        padding: 'clamp(3.5rem, 7vw, 5.5rem) 32px clamp(2.5rem, 4vw, 3.5rem)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 6vw, 5rem)', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <img src={jaramMark} alt="JARAM" style={{ height: 30 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-strong)' }}>자람</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
              한양대학교 ERICA 컴퓨터학회. 1984년부터 나눔으로 자라온 사람들의 공동체입니다.
            </p>
            <a
              href="mailto:contact@jaram.net"
              className="jr-foot-link"
              style={{ display: 'inline-block', marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--text-body)' }}
            >
              contact@jaram.net
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            {FOOT_MENU.map((col) => (
              <div key={col.h}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 'var(--w-semibold)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: 16,
                  }}
                >
                  {col.h}
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.items.map((it) => (
                    <li key={it}>
                      <a href="#" className="jr-foot-link" style={{ fontSize: '0.9375rem', color: 'var(--text-body)', whiteSpace: 'nowrap' }}>
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 'clamp(3rem, 6vw, 4.5rem)',
            paddingTop: 28,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2026 JARAM · 한양대학교 ERICA 컴퓨터학회</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--text-faint)' }}>나눌수록, 자란다 · Since 1984</span>
        </div>
      </div>
    </footer>
  );
}
