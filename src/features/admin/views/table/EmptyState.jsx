import React from 'react';
import { EMPTY } from '../../admin.data';

/**
 * 빈 상태 — 검색 결과 0건과 데이터 0건을 구분합니다 (기획.md §10).
 */
export function EmptyState({ searching }) {
  const copy = searching ? EMPTY.noResult : EMPTY.noData;
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 14px 14px', marginTop: -14, padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--surface-tonal, var(--border-strong))', lineHeight: 1 }}>空</div>
      <p style={{ margin: '16px 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>{copy.title}</p>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-faint)' }}>{copy.desc}</p>
    </div>
  );
}
