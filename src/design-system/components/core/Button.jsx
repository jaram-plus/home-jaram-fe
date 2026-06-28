import React from 'react';

/**
 * JARAM Button — the primary call to action.
 * Solid vermilion by default; outline and ghost for lower emphasis.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  disabled = false,
  type = 'button',
  onClick,
  iconRight,
  style,
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 'var(--fs-sm)' },
    md: { padding: '12px 24px', fontSize: 'var(--fs-body)' },
    lg: { padding: '16px 32px', fontSize: 'var(--fs-lead)' },
  };

  const variants = {
    primary: {
      background: 'var(--brand)',
      color: 'var(--text-on-brand)',
      border: '1.5px solid transparent',
      boxShadow: 'var(--shadow-brand)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-strong)',
      border: '1.5px solid var(--border-strong)',
      boxShadow: 'var(--shadow-xs)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--brand)',
      border: '1.5px solid var(--brand)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)',
      border: '1.5px solid transparent',
      boxShadow: 'none',
    },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--w-semibold)',
    lineHeight: 1,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    textDecoration: 'none',
    transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)',
    whiteSpace: 'nowrap',
    ...sizes[size],
    ...variants[variant],
    ...style,
  };

  const hover = (e, on) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.background = on ? 'var(--brand-hover)' : 'var(--brand)';
    } else if (variant === 'outline') {
      e.currentTarget.style.background = on ? 'var(--brand-tint)' : 'transparent';
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = on ? 'var(--brand)' : 'var(--border-strong)';
      e.currentTarget.style.color = on ? 'var(--brand)' : 'var(--text-strong)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.background = on ? 'var(--surface-sunken)' : 'transparent';
    }
    e.currentTarget.style.transform = on ? 'translateY(-1px)' : 'none';
  };

  const handlers = {
    onMouseEnter: (e) => hover(e, true),
    onMouseLeave: (e) => hover(e, false),
    onMouseDown: (e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(0) scale(0.985)'; },
    onMouseUp: (e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; },
  };

  const content = (
    <>
      {children}
      {iconRight}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} style={base} onClick={onClick} {...handlers} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} style={base} disabled={disabled} onClick={onClick} {...handlers} {...rest}>
      {content}
    </button>
  );
}
