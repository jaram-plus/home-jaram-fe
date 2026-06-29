import React from 'react';
import { Eyebrow } from './Eyebrow';
import { ALUMNI_LOGOS } from '../landing.assets';
import { ALUMNI } from '../landing.data';

/** Alumni — infinite right-to-left logo marquee (employer logos). */
export function Alumni() {
  // Duplicate the list so the -50% translate loops seamlessly.
  const reel = [...ALUMNI, ...ALUMNI];

  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(5rem, 11vw, 9.5rem) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <Eyebrow style={{ marginBottom: 18 }}>Alumni</Eyebrow>
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
          자람을 거쳐 간 사람들은
          <br />
          이런 곳에서 <span style={{ color: 'var(--brand)' }}>자신의 길</span>을 잇고 있습니다.
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
          네이버·카카오·토스를 비롯한 국내외 IT 기업과 명문 대학원에서, 선배들이 학회에서 다진 태도를 이어가고 있습니다.
        </p>
        <div className="jr-marquee" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="jr-marquee-track">
            {reel.map((c, i) => (
              <div
                key={i}
                className="jr-logo-cell"
                aria-hidden={i >= ALUMNI.length ? 'true' : undefined}
                style={{
                  flex: '0 0 auto',
                  width: 220,
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 36px',
                  borderRight: '1px solid var(--border)',
                  background: 'var(--surface-card)',
                }}
              >
                <img src={ALUMNI_LOGOS[c.logo]} alt={c.name} style={{ maxHeight: 46, maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
