import React from 'react';
import { Eyebrow } from './Eyebrow';
import { VOICES } from '../landing.data';

/** Voices — left-to-right marquee of member pull quotes. */
export function Voices() {
  const reel = [...VOICES, ...VOICES];

  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(5rem, 11vw, 9.5rem) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>Voices</Eyebrow>
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
          먼저 거쳤던 사람들의 <span style={{ color: 'var(--brand)' }}>목소리</span>.
        </h2>
      </div>
      <div className="jr-marquee">
        <div className="jr-marquee-track-ltr">
          {reel.map((v, i) => (
            <figure
              key={i}
              aria-hidden={i >= VOICES.length ? 'true' : undefined}
              style={{
                margin: 0,
                flex: '0 0 auto',
                width: 'clamp(320px, 32vw, 440px)',
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(2rem, 3vw, 2.75rem)',
                marginRight: 'clamp(1.5rem, 3vw, 2.5rem)',
                background: 'var(--surface-card)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 56, lineHeight: 0.6, color: 'var(--brand)', marginBottom: 18 }}
              >
                &ldquo;
              </span>
              <blockquote
                style={{
                  margin: 0,
                  flex: 1,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.2rem, 1.7vw, 1.45rem)',
                  lineHeight: 1.62,
                  color: 'var(--text-strong)',
                  letterSpacing: '-0.01em',
                  wordBreak: 'keep-all',
                }}
              >
                {v.quote}
              </blockquote>
              <figcaption
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12.5,
                  letterSpacing: '0.04em',
                  color: 'var(--text-faint)',
                }}
              >
                {v.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
