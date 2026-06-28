import React from 'react';

/**
 * JARAM SectionHeader — eyebrow + display/serif title with a red highlight phrase.
 * The signature heading treatment across the site.
 */
export function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  font = 'sans',
  style,
  ...rest
}) {
  const titleFont = font === 'display' ? 'var(--font-display)'
    : font === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';
  return (
    <header
      style={{
        textAlign: align,
        maxWidth: align === 'center' ? '720px' : 'none',
        margin: align === 'center' ? '0 auto' : 0,
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <p style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--w-semibold)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--brand)',
        }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{
        margin: 0,
        fontFamily: titleFont,
        fontSize: font === 'sans' ? 'var(--fs-title-1)' : 'var(--fs-display-2)',
        fontWeight: font === 'sans' ? 'var(--w-bold)' : 'var(--w-regular)',
        lineHeight: 'var(--lh-tight)',
        letterSpacing: font === 'sans' ? 'var(--ls-tight)' : 'normal',
        color: 'var(--text-strong)',
      }}>
        {title}{highlight && <> <span style={{ color: 'var(--brand)' }}>{highlight}</span></>}
      </h2>
      {description && (
        <p style={{
          margin: '20px 0 0',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-lead)',
          lineHeight: 'var(--lh-normal)',
          color: 'var(--text-muted)',
        }}>
          {description}
        </p>
      )}
    </header>
  );
}
