import React from 'react';

const navBtn = { width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-strong)', borderRadius: 8, background: 'var(--surface-card)', color: 'var(--text-muted)', cursor: 'pointer' };

/**
 * 표 하단 — 총 건수 라벨 + 페이지 이동. 서버 페이지네이션(20/페이지 기본) 전제.
 */
export function Pagination({ page, pageCount, total, unit, dirty, busy, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
      <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>
        총 {total}{unit}{dirty ? ' · 수정 중' : ''}{busy ? ' · 불러오는 중…' : ''}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button type="button" onClick={onPrev} disabled={page <= 1} style={{ ...navBtn, opacity: page <= 1 ? 0.4 : 1 }} aria-label="이전 페이지">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', minWidth: 48, textAlign: 'center' }}>{page} / {pageCount}</span>
        <button type="button" onClick={onNext} disabled={page >= pageCount} style={{ ...navBtn, opacity: page >= pageCount ? 0.4 : 1 }} aria-label="다음 페이지">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
}
