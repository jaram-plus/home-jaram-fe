import React from 'react';
import { clubYearsKorean } from '@/shared/club/founding';

/**
 * Manifesto — editorial asymmetric layout (meta column + large statement).
 *
 * 히어로의 '학회 소개' 버튼과 푸터의 '소개'가 가리키는 자리다. 학회 소개는 따로 페이지가 있지 않고
 * 히어로 아래 이 단락에서 시작하므로, 별도 라우트 대신 `#about` 앵커로 받는다.
 */
export function Manifesto() {
  return (
    <section id="about" style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-2%',
          bottom: '-8%',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 'clamp(11rem, 26vw, 26rem)',
          lineHeight: 1,
          color: 'var(--brand-deep)',
          opacity: 0.05,
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        1984
      </div>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'clamp(80px, 12vw, 150px) var(--container-pad)', position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
          <div style={{ flex: '0 0 200px', maxWidth: 240 }}>
            <span style={{ display: 'block', height: 1, width: 40, background: 'var(--brand)', marginBottom: 18 }} />
            <span
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 'var(--w-semibold)',
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--brand)',
              }}
            >
              About JARAM
            </span>
            <p style={{ margin: '22px 0 0', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-faint)', wordBreak: 'keep-all' }}>
              한양대학교 ERICA
              <br />
              컴퓨터학회
              <br />
              <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>Since 1984</span>
            </p>
          </div>
          <div style={{ flex: '1 1 460px', minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 'clamp(2.1rem, 4.4vw, 3.6rem)',
                lineHeight: 1.36,
                color: 'var(--text-strong)',
                letterSpacing: '-0.01em',
                wordBreak: 'keep-all',
              }}
            >
              함께 공부하고, 만들고, 나누며
              <br />
              우리는 그렇게 <span style={{ color: 'var(--brand)' }}>자라납니다.</span>
            </p>
            <p
              style={{
                margin: '40px 0 0',
                maxWidth: 600,
                fontSize: '1.125rem',
                lineHeight: 1.8,
                color: 'var(--text-muted)',
                wordBreak: 'keep-all',
              }}
            >
              자람은 1984년 한양대학교 ERICA에서 시작한 컴퓨터학회입니다. 받은 만큼 나누고, 나눈 만큼 성장하는 선순환 속에서
              {clubYearsKorean()} 해 동안 배움의 태도를 다음 세대로 이어왔습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
