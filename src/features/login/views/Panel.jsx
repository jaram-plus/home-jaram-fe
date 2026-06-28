import React from 'react';

/**
 * Auth card chrome — warm paper card with a vermilion top rule. Wraps every
 * login/signup/reset view. `center` switches to the confirmation layout
 * (extra padding, centered text) used by the icon-badge success screens.
 */
export function Panel({ center = false, children }) {
  return (
    <div className="jr-view" style={{ width: '100%' }}>
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderTop: '3px solid var(--brand)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: center ? '44px 40px' : '40px',
          textAlign: center ? 'center' : 'left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
