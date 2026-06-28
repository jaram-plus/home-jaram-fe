'use client';

import React from 'react';
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
