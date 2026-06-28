import React from 'react';
import { Eyebrow } from './Eyebrow';
import { ACTIVITIES } from '../landing.data';

/** Activities — numbered editorial list of the four core activities. */
export function Activities() {
  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(5rem, 11vw, 9.5rem) 32px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>What We Do</Eyebrow>
        <h2
          style={{
            margin: '0 0 clamp(2.5rem, 5vw, 4rem)',
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
          자람이 실제로 하는 <span style={{ color: 'var(--brand)' }}>네 가지</span> 일.
        </h2>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {ACTIVITIES.map((a) => (
            <div
              key={a.no}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(64px, 0.6fr) minmax(220px, 1.4fr) minmax(280px, 2.2fr)',
                gap: 'clamp(1.5rem, 4vw, 3.5rem)',
                alignItems: 'baseline',
                padding: 'clamp(1.8rem, 3.5vw, 2.8rem) 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: 'clamp(2.2rem, 3vw, 3rem)',
                  color: 'var(--brand)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {a.no}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 'var(--w-semibold)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: 8,
                  }}
                >
                  {a.en}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 400,
                    fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                    color: 'var(--text-strong)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {a.title}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.0625rem',
                  lineHeight: 1.8,
                  color: 'var(--text-muted)',
                  wordBreak: 'keep-all',
                  maxWidth: 480,
                }}
              >
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
