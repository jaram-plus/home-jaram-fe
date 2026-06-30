import React from 'react';
import { jaramMark } from '../landing.assets';
import { currentGen } from '@/shared/club/founding';
import { useAuthStore } from '@/shared/auth/auth.store';

/** CTA — the single vermilion-field section (paper text + JR watermark). */
export function CTA() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--brand)',
        padding: 'clamp(6rem, 13vw, 11rem) var(--container-pad)',
        textAlign: 'center',
      }}
    >
      <img
        src={jaramMark}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-3%',
          bottom: '-12%',
          height: 'clamp(260px, 30vw, 420px)',
          opacity: 0.08,
          filter: 'brightness(0) invert(1)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 13,
            fontWeight: 'var(--w-semibold)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(252, 248, 240, 0.75)',
            marginBottom: 28,
          }}
        >
          Join JARAM · {currentGen()}기
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(2.6rem, 6vw, 5rem)',
            lineHeight: 1.12,
            color: 'var(--text-on-ink)',
            letterSpacing: '0.01em',
            wordBreak: 'keep-all',
          }}
        >
          함께 자랄 사람을
          <br />
          기다립니다.
        </h2>
        <p
          style={{
            margin: '32px auto 0',
            maxWidth: 480,
            fontSize: '1.1875rem',
            lineHeight: 1.7,
            color: 'rgba(252, 248, 240, 0.88)',
            wordBreak: 'keep-all',
          }}
        >
          받은 만큼 나누고, 나눈 만큼 성장하는 자리. 다음 한 해를 함께 채워갈 당신을 기다립니다.
        </p>
        <div style={{ display: 'flex', gap: 26, marginTop: 44, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isAuthenticated && (
            <a
              href="/apply"
              className="jr-cta-btn"
              style={{
                display: 'inline-block',
                padding: '17px 38px',
                borderRadius: 4,
                background: 'var(--surface-card)',
                color: 'var(--text-strong)',
                fontSize: '1.0625rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 22px rgba(0, 0, 0, 0.18)',
              }}
            >
              {currentGen()}기 지원하기
            </a>
          )}
          <a href="/about" className="jr-cta-more" style={{ color: 'var(--text-on-ink)', fontSize: '1.0625rem', fontWeight: 600 }}>
            자람 더 알아보기 →
          </a>
        </div>
        <p
          style={{
            margin: '40px 0 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            letterSpacing: '0.04em',
            color: 'rgba(252, 248, 240, 0.65)',
          }}
        >
          모집은 매 학기 초에 진행됩니다.
        </p>
      </div>
    </section>
  );
}
