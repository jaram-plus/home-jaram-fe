import React from 'react';
import { Pill } from './parts';
import { ROSTER_TABS, EMPTY } from '../seminar.data';

/** Table header / cell row share this 3-column grid. */
const GRID = { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 };

/**
 * Roster view — pick a seminar (sub-nav) and see who has checked in.
 * `roster` is the selected `{ title, cap, list }`; `selected` is its key.
 */
export function RosterView({ roster, selected, onSelect, loading, error }) {
  const attendees = roster?.list ?? [];
  return (
    <div className="jr-anim">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {ROSTER_TABS.map((r) => (
          <Pill key={r.key} active={selected === r.key} onClick={() => onSelect(r.key)}>
            {r.label}
          </Pill>
        ))}
      </div>

      {!roster ? (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderTop: '3px solid var(--brand)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: '56px 30px',
            textAlign: 'center',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body)',
          }}
        >
          {error ? '출석 현황을 불러오지 못했습니다.' : loading ? '불러오는 중…' : EMPTY.attendees}
        </div>
      ) : (
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderTop: '3px solid var(--brand)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: '28px 30px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            paddingBottom: 20,
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--w-semibold)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
              출석 현황
            </div>
            <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>
              {roster.title}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700, color: 'var(--brand-deep)', lineHeight: 1 }}>
              {attendees.length}/{roster.cap}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}> 명 출석</span>
          </div>
        </div>

        {attendees.length > 0 ? (
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                ...GRID,
                padding: '14px 4px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-xs)',
                fontWeight: 'var(--w-semibold)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <span>이름</span>
              <span>학번</span>
              <span>출석 시각</span>
            </div>
            {attendees.map((m) => (
              <div
                key={m.sid}
                style={{
                  ...GRID,
                  padding: '14px 4px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-soft)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-sm)',
                }}
              >
                <span style={{ color: 'var(--text-strong)', fontWeight: 'var(--w-semibold)' }}>{m.name}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.sid}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.at}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-faint)', fontFamily: 'var(--font-sans)' }}>
            <p style={{ margin: 0, fontSize: 'var(--fs-body)' }}>{EMPTY.attendees}</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
