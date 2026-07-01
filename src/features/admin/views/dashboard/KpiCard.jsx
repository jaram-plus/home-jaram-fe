import React from 'react';
import { Card } from '@/design-system';

/**
 * KPI 카드 — 상단 3px 레드 액센트 + 라벨 + 큰 세리프 숫자 + 증감 캡션.
 * (DS Card accent="top" 합성. 숫자는 heritage 세리프.)
 * tone: 'up' | 'down' | 'neutral' — 증감 캡션 색.
 */
export function KpiCard({ label, value, suffix, caption, tone = 'neutral' }) {
  const capColor = tone === 'up' ? 'var(--brand)' : tone === 'down' ? 'var(--text-muted)' : 'var(--text-faint)';
  const arrow = tone === 'up' ? '▲ ' : tone === 'down' ? '▼ ' : '';
  return (
    <Card accent="top" padding="md" style={{ borderRadius: 14 }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 46, fontWeight: 700, lineHeight: 1, color: 'var(--brand-deep)' }}>
        {value}
        {suffix && <span style={{ fontSize: 20, color: 'var(--text-faint)', fontFamily: 'var(--font-sans)', fontWeight: 600, marginLeft: 4 }}>{suffix}</span>}
      </p>
      {caption && <p style={{ margin: '12px 0 0', fontSize: 12, color: capColor, fontWeight: 600 }}>{arrow}{caption}</p>}
    </Card>
  );
}
