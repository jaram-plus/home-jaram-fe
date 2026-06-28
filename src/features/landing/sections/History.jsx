import React from 'react';
import { Eyebrow } from './Eyebrow';
import { HISTORY } from '../landing.data';

/** History — vertical timeline of milestones. */
export function History() {
  return (
    <section
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-card)',
        padding: 'clamp(5rem, 11vw, 9.5rem) 32px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>History</Eyebrow>
        <h2
          style={{
            margin: '0 0 clamp(2.5rem, 5vw, 4.5rem)',
            maxWidth: 720,
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.9rem, 3.6vw, 3rem)',
            lineHeight: 1.32,
            color: 'var(--text-strong)',
            letterSpacing: '-0.01em',
            wordBreak: 'keep-all',
          }}
        >
          마흔한 해를 이어온 <span style={{ color: 'var(--brand)' }}>발자취</span>.
        </h2>
        <div>
          {HISTORY.map((h, i) => (
            <div key={h.year} style={{ display: 'grid', gridTemplateColumns: 'clamp(64px, 12vw, 120px) 1fr', gap: 'clamp(1.25rem, 4vw, 3rem)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
                  fontWeight: 500,
                  color: 'var(--brand)',
                  textAlign: 'right',
                  paddingTop: 24,
                }}
              >
                {h.year}
              </div>
              <div
                style={{
                  position: 'relative',
                  borderLeft: '1px solid var(--border-strong)',
                  paddingLeft: 'clamp(1.5rem, 3vw, 2.5rem)',
                  paddingTop: 24,
                  paddingBottom: i === HISTORY.length - 1 ? 0 : 'clamp(2.5rem, 5vw, 4rem)',
                }}
              >
                <span style={{ position: 'absolute', top: 28, left: -5, width: 9, height: 9, borderRadius: '50%', background: 'var(--brand)' }} />
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 400,
                    fontSize: 'clamp(1.35rem, 2.1vw, 1.75rem)',
                    color: 'var(--text-strong)',
                    letterSpacing: '-0.01em',
                    wordBreak: 'keep-all',
                  }}
                >
                  {h.title}
                </h3>
                <p style={{ margin: 0, maxWidth: 560, fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
                  {h.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
