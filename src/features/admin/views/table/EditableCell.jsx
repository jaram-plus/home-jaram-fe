import React from 'react';
import { Tag } from '@/design-system';

/**
 * 인라인 편집 셀 — 컬럼 타입별(text/select/tag/static/match/actions) 렌더.
 * 편집 가능한 셀은 원본과 다르면 dirty 표시(brand-tint + 레드 텍스트)를 답니다.
 */
export function EditableCell({ col, row, dirty, onChange, onAction, memberIndex }) {
  const align = col.align || 'left';
  const value = row[col.key];

  const baseInput = {
    width: '100%', boxSizing: 'border-box', background: 'transparent',
    border: '1px solid transparent', borderRadius: 6, padding: '7px 8px',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-strong)',
    outline: 'none', textAlign: align,
  };
  const dirtyStyle = dirty ? { background: 'var(--brand-tint)', borderColor: 'var(--red-100)', fontWeight: 600, color: 'var(--red-600)' } : {};

  if (col.type === 'text') {
    return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, ...dirtyStyle }} onFocus={focusOn} onBlur={focusOff} />;
  }

  if (col.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, cursor: 'pointer', ...dirtyStyle }}>
        {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (col.type === 'tag') {
    const tone = value === '대기' ? 'brand' : value === '반려' ? 'seal' : 'neutral';
    return <span style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start' }}><Tag tone={tone}>{value}</Tag></span>;
  }

  if (col.type === 'static') {
    const s = col.key === 'motivation'
      ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : { fontVariantNumeric: 'tabular-nums' };
    return <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', display: 'block', textAlign: align, ...s }}>{value}</span>;
  }

  if (col.type === 'match') {
    const info = matchInfo(row, memberIndex);
    return (
      <span style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={info.style}>
          {info.ok && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          )}
          {info.label}
        </span>
      </span>
    );
  }

  if (col.type === 'actions') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {col.actions.map((a) => (
          <button key={a} type="button" onClick={() => onAction(a, row)} style={actionStyle(a, row._pendingDelete)}>
            {actionLabel(a, row._pendingDelete)}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

function focusOn(e) {
  e.currentTarget.style.background = 'var(--surface-raised)';
  e.currentTarget.style.borderColor = 'var(--brand)';
  e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-tint)';
}
function focusOff(e) {
  e.currentTarget.style.background = 'transparent';
  e.currentTarget.style.borderColor = 'transparent';
  e.currentTarget.style.boxShadow = 'none';
}

function actionLabel(kind, pendingDelete) {
  if (kind === 'delete') return pendingDelete ? '취소' : '삭제';
  if (kind === 'approve') return '승인';
  if (kind === 'reject') return '반려';
  return kind;
}
function actionStyle(kind, pendingDelete) {
  const base = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', lineHeight: 1, whiteSpace: 'nowrap' };
  if (kind === 'approve') return { ...base, background: 'var(--brand)', color: '#fff', border: '1px solid transparent' };
  if (kind === 'reject') return { ...base, background: 'transparent', color: 'var(--red-600)', border: '1px solid var(--red-100)' };
  if (pendingDelete) return { ...base, background: 'var(--surface-sunken)', color: 'var(--text-body)', border: '1px solid var(--border-strong)' };
  return { ...base, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' };
}

/** 임원 학번을 회원 명부와 대조 (기획.md §3.3). memberIndex: studentId → member. */
function matchInfo(row, memberIndex = {}) {
  const sid = String(row.studentId || '').trim();
  const nm = String(row.name || '').trim();
  const hit = sid ? memberIndex[sid] : null;
  const pill = { display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, padding: '4px 10px', borderRadius: 999, lineHeight: 1.3, whiteSpace: 'nowrap' };
  const warn = { ...pill, background: 'var(--brand-tint)', color: 'var(--red-600)', border: '1px solid var(--red-100)' };
  if (!sid) return { ok: false, label: '학번 미입력', style: { ...pill, background: 'transparent', color: 'var(--text-faint)', border: '1px dashed var(--border-strong)' } };
  if (!hit) return { ok: false, label: '미등록 학번', style: warn };
  if (String(hit.name).trim() !== nm) return { ok: false, label: '이름 불일치', style: warn };
  return { ok: true, label: '회원 일치', style: { ...pill, background: 'var(--surface-sunken)', color: 'var(--text-muted)', border: '1px solid var(--border)' } };
}
