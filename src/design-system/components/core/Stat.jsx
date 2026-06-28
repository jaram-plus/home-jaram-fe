import React from 'react';

/**
 * JARAM Stat — a large serif numeral with a label. Used for heritage figures
 * (41년의 역사, 1984, 500+ 졸업생). Numerals set in the editorial serif.
 */
export function Stat({ value, label, suffix, align = 'center', style, ...rest }) {
  return (
    <div style={{ textAlign: align, ...style }} {...rest}>
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 'var(--w-bold)',
        fontSize: 'var(--fs-display-2)',
        lineHeight: 1,
        color: 'var(--brand-deep)',
        letterSpacing: '-0.01em',
      }}>
        {value}{suffix && <span style={{ fontSize: '0.5em', verticalAlign: 'super', marginLeft: '2px' }}>{suffix}</span>}
      </div>
      <div style={{
        marginTop: '10px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 'var(--w-medium)',
        color: 'var(--text-muted)',
        letterSpacing: '0.02em',
      }}>
        {label}
      </div>
    </div>
  );
}
