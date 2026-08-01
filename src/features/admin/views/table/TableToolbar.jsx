import React from 'react';

/**
 * 표 툴바 — 검색 · 필터(등급/기수/상태…) · Drive 내보내기 · 행 추가.
 * 검색·필터 값은 URL searchParams 에서 내려오고, 변경은 콜백으로 위임합니다.
 */
export function TableToolbar({ schema, q, filters, onSearch, onFilter, onExport, onAddRow, exporting }) {
  /* 검색어는 URL(searchParams)까지 왕복하므로, 그 값을 그대로 input 의 value 로 쓰면
   * 한글 조합 중에 옛 값이 되돌아와 글자가 덧붙습니다('자람' → 'ㅈ자잘자라람람').
   * 입력은 로컬 상태로 받고, 조합이 끝난 뒤에만 URL 로 올립니다. */
  const [term, setTerm] = React.useState(q);
  const composing = React.useRef(false);
  const pushed = React.useRef(q);

  const push = (v) => { pushed.current = v; onSearch(v); };

  // 탭 전환처럼 밖에서 q 가 비워진 경우에만 입력칸을 맞춥니다.
  React.useEffect(() => {
    if (q !== pushed.current) { pushed.current = q; setTerm(q); }
  }, [q]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 320 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          placeholder="이름·학번·내용 검색"
          value={term}
          onChange={(e) => { setTerm(e.target.value); if (!composing.current) push(e.target.value); }}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(e) => { composing.current = false; push(e.target.value); }}
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, outline: 'none' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-tint)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {(schema.filters || []).map((f) => (
        <select
          key={f.key}
          value={filters[f.key] || '전체'}
          onChange={(e) => onFilter(f.key, e.target.value)}
          style={{ padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--text-body)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer', outline: 'none' }}
        >
          {f.options.map((o) => <option key={o} value={o}>{f.label}: {o}</option>)}
        </select>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        <button type="button" onClick={onExport} disabled={exporting} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Drive로 내보내기
        </button>
        {schema.addLabel && (
          <button type="button" onClick={onAddRow} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', border: '1.5px solid transparent', borderRadius: 8, cursor: 'pointer', boxShadow: 'var(--shadow-brand)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {schema.addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
