import React from 'react';
import { SocialLink } from './parts';

/**
 * A single person card: avatar (initial) + optional 기수 badge, name, role,
 * one-line bio, and social links. `person` shape: see people.data.js.
 */
export function PersonCard({ person }) {
  const { name, role, gen, bio, github, blog } = person;
  return (
    <div
      className="jr-person"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '28px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 16px' }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'var(--brand-tint)',
            border: '2px solid var(--paper-50)',
            boxShadow: '0 0 0 1px var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            color: 'var(--brand)',
          }}
        >
          {name.slice(0, 1)}
        </div>
        {gen != null && (
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 'var(--w-bold)',
              letterSpacing: '0.02em',
              padding: '3px 9px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--brand-deep)',
              color: '#fff',
              whiteSpace: 'nowrap',
            }}
          >
            {gen}기
          </span>
        )}
      </div>

      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)', marginTop: 6 }}>
        {name}
      </div>
      <div style={{ marginTop: 5, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--brand)' }}>
        {role}
      </div>
      <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', minHeight: 42 }}>
        {bio}
      </p>

      {(github || blog) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          {github && <SocialLink kind="github" label={`${name}님의 GitHub`} />}
          {blog && <SocialLink kind="blog" label={`${name}님의 블로그`} />}
        </div>
      )}
    </div>
  );
}
