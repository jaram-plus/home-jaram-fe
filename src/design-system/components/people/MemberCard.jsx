import React from 'react';

/**
 * JARAM MemberCard — a member's portrait, name, role and one-line bio.
 * Used across People / Featured surfaces. Initials fall back when no photo.
 */
export function MemberCard({ name, role, bio, photo, tags = [], style, ...rest }) {
  const initial = typeof name === 'string' ? name.trim().slice(0, 1) : '';
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: '28px 24px',
        textAlign: 'center',
        transition: 'transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
        transform: hover ? 'translateY(-3px)' : 'none',
        ...style,
      }}
      {...rest}
    >
      <div style={{
        width: '84px', height: '84px', margin: '0 auto 16px',
        borderRadius: 'var(--radius-pill)',
        background: photo ? `center/cover url(${photo})` : 'var(--brand-tint)',
        border: '2px solid var(--paper-50)',
        boxShadow: '0 0 0 1px var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--brand)',
      }}>
        {!photo && initial}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>
        {name}
      </div>
      {role && (
        <div style={{ marginTop: '4px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--brand)' }}>
          {role}
        </div>
      )}
      {bio && (
        <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)' }}>
          {bio}
        </p>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '14px' }}>
          {tags.map((t, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 'var(--w-semibold)',
              padding: '3px 9px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border)',
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
