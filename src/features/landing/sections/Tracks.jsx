import React from 'react';
import { Eyebrow } from './Eyebrow';
import { TRACKS } from '../landing.data';

/** Tracks — the membership path, four nodes on a hairline grid. */
export function Tracks() {
  return (
    <section
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-card)',
        padding: 'clamp(5rem, 11vw, 9.5rem) var(--container-pad)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>The Path</Eyebrow>
        <h2
          style={{
            margin: '0 0 22px',
            maxWidth: 760,
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.9rem, 3.6vw, 3rem)',
            lineHeight: 1.32,
            color: 'var(--text-strong)',
            letterSpacing: '-0.01em',
            wordBreak: 'keep-all',
          }}
        >
          한 해 한 해, 우리는
          <br />
          이렇게 <span style={{ color: 'var(--brand)' }}>함께 자랍니다</span>.
        </h2>
        <p
          style={{
            margin: '0 0 clamp(2.5rem, 5vw, 3.5rem)',
            maxWidth: 600,
            fontSize: '1.0625rem',
            lineHeight: 1.8,
            color: 'var(--text-muted)',
            wordBreak: 'keep-all',
          }}
        >
          합류부터 나눔까지 — 받은 만큼 돌려주는 선순환이 한 사람의 성장 궤적이 됩니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
          {TRACKS.map((t) => (
            <div key={t.no} style={{ position: 'relative', paddingTop: 32, paddingRight: 28, borderTop: '1px solid var(--border-strong)' }}>
              <span style={{ position: 'absolute', top: -5, left: 0, width: 9, height: 9, borderRadius: '50%', background: 'var(--brand)' }} />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                  marginBottom: 14,
                }}
              >
                {t.no} · {t.en}
              </div>
              <h3
                style={{
                  margin: '0 0 14px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                  color: 'var(--text-strong)',
                  letterSpacing: '-0.01em',
                }}
              >
                {t.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
