'use client';

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './landing.css';
import {
  Header,
  Hero,
  Manifesto,
  Activities,
  Tracks,
  Alumni,
  Voices,
  History,
  CTA,
  Footer,
} from './sections';

/**
 * JARAM landing page — 나눌수록, 자란다.
 *
 * Composes the section components top to bottom. Each section owns its
 * markup + inline styles (design-system tokens); shared CSS that can't be
 * inline (marquee keyframes, hover descendants) lives in ./landing.css.
 *
 * Section order matches the editorial sequence:
 *   Header → Hero → Manifesto → Activities → Tracks → Alumni → Voices → History → CTA → Footer
 */
export default function LandingPage() {
  // 헤더·푸터의 '소개'는 /#about 으로 온다. 라우터는 해시까지 스크롤해 주지 않으므로
  // 그 몫을 이 페이지가 맡는다 — <a>로 두면 다른 페이지에서 올 때 전체 새로고침이 되어
  // SPA 상태와 캐시가 날아간다.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div style={{ background: 'var(--surface-page)', color: 'var(--text-body)', fontFamily: 'var(--font-sans)', WebkitFontSmoothing: 'antialiased' }}>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Activities />
        <Tracks />
        <Alumni />
        <Voices />
        <History />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
