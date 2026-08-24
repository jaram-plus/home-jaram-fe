import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system';
import { Header } from '@/shared/ui/Header';
import jaramMark from '@/design-system/assets/logos/jaram-mark.png';
import { ERROR_COPY, FALLBACK_COPY } from './error.data';

/**
 * 오류 화면(404 · 403 …)의 단일 레이아웃.
 *
 * 종이 바탕 위에 JR 도장을 옅게 깔고, 오류 코드를 고운바탕 숫자로 크게 세웁니다.
 * 헤리티지 숫자(41 · 1984)와 같은 조판 장치를 오류 코드에 그대로 씁니다.
 * 문구는 `error.data.js` 에서만 가져오고, 코드가 없으면 기본 문구로 내려앉습니다.
 */
const markSrc = typeof jaramMark === 'string' ? jaramMark : jaramMark.src;

export default function ErrorPage({ code = 404 }) {
  const navigate = useNavigate();
  const copy = ERROR_COPY[code] ?? FALLBACK_COPY;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <Header />

      <main
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* 도장 워터마크 */}
        <img
          src={markSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 'calc(var(--container-pad) * -0.5)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'clamp(280px, 46vw, 620px)',
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: 'clamp(4rem, 9vw, 7rem) var(--container-pad)',
          }}
        >
          {/* 라틴 아이라벨 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ height: 1, width: 40, background: 'var(--brand)' }} />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 'var(--w-semibold)',
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--brand)',
              }}
            >
              {copy.label}
            </span>
          </div>

          {/* 오류 코드 */}
          <p
            style={{
              margin: '20px 0 0',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--fs-display-1)',
              lineHeight: 'var(--lh-tight)',
              letterSpacing: 'var(--ls-tight)',
              color: 'var(--brand-deep)',
            }}
          >
            {code}
          </p>

          <h1
            style={{
              margin: '18px 0 0',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              fontSize: 'var(--fs-title-1)',
              lineHeight: 'var(--lh-snug)',
              color: 'var(--text-strong)',
              wordBreak: 'keep-all',
            }}
          >
            {copy.title}
          </h1>

          <p
            style={{
              margin: '18px 0 0',
              maxWidth: 520,
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-lead)',
              lineHeight: 'var(--lh-normal)',
              color: 'var(--text-muted)',
              wordBreak: 'keep-all',
            }}
          >
            {copy.desc}
          </p>

          <div style={{ maxWidth: 520, height: 1, background: 'var(--border)', margin: 'var(--space-7) 0 var(--space-6)' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <Button href="/">홈으로 돌아가기</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              이전 페이지
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
