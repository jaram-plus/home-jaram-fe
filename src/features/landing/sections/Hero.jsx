import React from 'react';
import { Button, Stat } from '@/design-system';
import { jaramMark } from '../landing.assets';
import { STATS } from '../landing.data';
import { clubYears, currentGen } from '@/shared/club/founding';
import { useAuthStore } from '@/shared/auth/auth.store';

/** Hero — oversized display headline, intro, primary CTAs, heritage stats. */
export function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '112px var(--container-pad) 80px' }}>
      <img
        src={jaramMark}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '6%',
          top: 120,
          height: 'clamp(300px, 32vw, 440px)',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <span style={{ height: 1, width: 40, background: 'var(--brand)' }} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 'var(--w-semibold)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--brand)',
            }}
          >
            Hanyang ERICA · Since 1984
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(4.5rem, 9vw, 8.5rem)',
            lineHeight: 1.02,
            color: 'var(--text-strong)',
            letterSpacing: '0.01em',
          }}
        >
          나눌수록,
          <br />
          <span style={{ color: 'var(--brand)' }}>자란다</span>
        </h1>
        <p
          style={{
            margin: '36px 0 0',
            maxWidth: 520,
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}
        >
          한양대학교 ERICA 컴퓨터학회 JARAM — 나눔이 실력이 되는 {clubYears()}년.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 40, flexWrap: 'wrap' }}>
          {!isAuthenticated && (
            <Button size="lg" href="/apply">{currentGen()}기 지원하기</Button>
          )}
          <Button size="lg" variant="outline" href="/about">학회 소개</Button>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 'clamp(2rem, 6vw, 5rem)',
            marginTop: 64,
            paddingTop: 40,
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((s) => (
            <Stat key={s.label} align="left" value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
