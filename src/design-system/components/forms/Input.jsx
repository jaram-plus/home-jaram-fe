import React from 'react';

/**
 * JARAM Input — labelled text field on warm paper.
 * Sunken field, hairline border, brand focus ring. Pass `as="textarea"` for multiline.
 */
export function Input({ label, hint, error, as = 'input', id, style, ...rest }) {
  const fieldId = id || (label ? `f-${String(label).replace(/\s+/g, '-')}` : undefined);
  const Field = as;
  const [focused, setFocused] = React.useState(false);
  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-body)',
    color: 'var(--text-strong)',
    background: 'var(--surface-raised)',
    border: `1.5px solid ${error ? 'var(--brand)' : focused ? 'var(--brand)' : 'var(--border-strong)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px var(--brand-tint)' : 'none',
    transition: 'border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
    resize: as === 'textarea' ? 'vertical' : undefined,
    minHeight: as === 'textarea' ? '96px' : undefined,
    lineHeight: 1.5,
    ...style,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {label && (
        <label htmlFor={fieldId} style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 'var(--w-semibold)',
          color: 'var(--text-body)',
        }}>
          {label}
        </label>
      )}
      <Field
        id={fieldId}
        style={fieldStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {(hint || error) && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-xs)',
          color: error ? 'var(--brand)' : 'var(--text-faint)',
        }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
