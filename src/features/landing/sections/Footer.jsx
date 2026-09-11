import React from 'react';
import { Link } from 'react-router-dom';
import { jaramMark } from '../landing.assets';
import { FOOT_MENU } from '../landing.data';
import { SITE_LINKS } from '@/shared/club/links';
import { useSiteLinks } from '../landing.queries';

/** Footer — brand block + menu columns + copyright. */
export function Footer() {
  // Connect 열의 주소는 관리자 '설정' 탭에서 관리한다. 못 받아오면 빈 값으로 두고,
  // 필수 항목(Instagram·Discord)만 주소 없는 이름으로 남긴다 — 푸터는 그려져야 한다.
  const { data: links } = useSiteLinks();
  const connect = SITE_LINKS
    .map((it) => ({ label: it.label, href: links?.[it.key] || '', always: it.always }))
    .filter((it) => it.href || it.always);

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-page)',
        padding: 'clamp(3.5rem, 7vw, 5.5rem) var(--container-pad) clamp(2.5rem, 4vw, 3.5rem)',
      }}
    >
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 6vw, 5rem)', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <img src={jaramMark} alt="JARAM" style={{ height: 30 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-strong)' }}>자람</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
              한양대학교 ERICA 컴퓨터학회. 1984년부터 나눔으로 자라온 사람들의 공동체입니다.
            </p>
            <a
              href="mailto:hyu.cse.jaram@gmail.com"
              className="jr-foot-link"
              style={{ display: 'inline-block', marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--text-body)' }}
            >
              hyu.cse.jaram@gmail.com
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            {FOOT_MENU.map((col) => (
              <FootColumn key={col.h} heading={col.h} items={col.items} />
            ))}
            <FootColumn heading="Connect" items={connect} />
          </div>
        </div>
        <div
          style={{
            marginTop: 'clamp(3rem, 6vw, 4.5rem)',
            paddingTop: 28,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2026 JARAM · 한양대학교 ERICA 컴퓨터학회</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--text-faint)' }}>나눌수록, 자란다 · Since 1984</span>
        </div>
      </div>
    </footer>
  );
}

/**
 * 메뉴 한 열. 주소가 없는 항목(아직 등록되지 않은 필수 채널)은 링크가 아니라
 * 흐린 글자로 둔다 — 눌러도 아무 데도 가지 않는 링크를 보여주지 않기 위해서다.
 */
function FootColumn({ heading, items }) {
  const linkStyle = { fontSize: '0.9375rem', color: 'var(--text-body)', whiteSpace: 'nowrap' };

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 'var(--w-semibold)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          marginBottom: 16,
        }}
      >
        {heading}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map((it) => {
          // 학회 밖으로 나가는 주소만 새 탭으로 연다 ('#' 자리표시 링크는 그대로).
          const external = /^https?:/.test(it.href);
          return (
            <li key={it.label}>
              {!it.href ? (
                <span style={{ ...linkStyle, color: 'var(--text-faint)' }}>{it.label}</span>
              ) : it.href.startsWith('/') ? (
                <Link to={it.href} className="jr-foot-link" style={linkStyle}>
                  {it.label}
                </Link>
              ) : (
                <a
                  href={it.href}
                  className="jr-foot-link"
                  style={linkStyle}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                >
                  {it.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
