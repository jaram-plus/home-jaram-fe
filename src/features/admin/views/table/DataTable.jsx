import React from 'react';
import { EditableCell } from './EditableCell';

/**
 * 제네릭 표 — 컬럼 스키마(admin.data SCHEMAS)로 구동. 헤더(정렬)+행(선택·인라인 편집).
 * 리소스마다 새 표를 만들지 않고 이 컴포넌트 하나를 재사용합니다 (기획.md §2).
 */
export function DataTable({ schema, rows, sort, loading, allSelected, selected, onToggleAll, onToggleSelect, onSort, onCellChange, onAction, grants }) {
  const gridCols = `40px ${schema.cols.map((c) => c.width).join(' ')}`;
  const [sortKey, sortDir] = (sort || '').split(',');

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center', minHeight: 46, padding: '0 6px', background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input type="checkbox" checked={allSelected} onChange={onToggleAll} style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} aria-label="전체 선택" />
        </div>
        {schema.cols.map((c) => {
          const sortable = !['actions', 'tag'].includes(c.type);
          const indicator = sortKey === c.key ? (sortDir === 'asc' ? '  ↑' : '  ↓') : '';
          return (
            <div
              key={c.key}
              onClick={sortable ? () => onSort(c.key) : undefined}
              style={{ padding: '0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)', textAlign: c.align || 'left', cursor: sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
            >
              {c.label}{indicator}
            </div>
          );
        })}
      </div>

      {/* loading skeleton */}
      {loading && [0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center', minHeight: 54, padding: '0 6px', borderBottom: '1px solid var(--border-soft, var(--border))' }}>
          <div />
          {schema.cols.map((c) => <div key={c.key} style={{ height: 12, margin: '0 8px', borderRadius: 6, background: 'var(--surface-sunken)' }} />)}
        </div>
      ))}

      {/* rows */}
      {!loading && rows.map((row) => {
        const extra = row._new
          ? { background: 'var(--red-50, var(--brand-tint))' }
          : selected[row.id] ? { background: 'var(--surface-sunken)' } : {};
        const delStyle = row._pendingDelete ? { opacity: 0.5, textDecoration: 'line-through' } : {};
        return (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center', minHeight: 54, borderBottom: '1px solid var(--border-soft, var(--border))', padding: '0 6px', transition: 'background 140ms', ...extra }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input type="checkbox" checked={!!selected[row.id]} onChange={() => onToggleSelect(row.id)} style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} aria-label="행 선택" />
            </div>
            {schema.cols.map((c) => (
              <div key={c.key} style={{ minWidth: 0, padding: '0 4px', ...(c.type !== 'actions' ? delStyle : {}) }}>
                <EditableCell
                  col={c}
                  row={row}
                  dirty={(row._dirtyFields || []).includes(c.key)}
                  onChange={(v) => onCellChange(row, c, v)}
                  onAction={onAction}
                  grants={grants}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
