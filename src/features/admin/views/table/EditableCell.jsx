import React from 'react';
import { Tag } from '@/design-system';
import { departmentKey, departmentLabel, titleLabel } from '@/shared/member/enums';
import { canEditRow, departmentOptions, titleOptions } from '../../exec.roles';

/**
 * 인라인 편집 셀 — 컬럼 타입별(text/select/tag/static/assign/actions) 렌더.
 * 편집 가능한 셀은 원본과 다르면 dirty 표시(brand-tint + 레드 텍스트)를 답니다.
 *
 * grants 는 임원진 표(assign 타입)에서만 씁니다 — 로그인한 임원이 줄 수 있는
 * (부서, 직책) 범위이며, 범위 밖의 행·값은 아예 읽기 전용으로 그립니다.
 */
export function EditableCell({ col, row, dirty, onChange, onAction, grants }) {
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

  if (col.type === 'multiselect') {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt];
      onChange(next);
    };
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', padding: '4px 2px' }}>
        {col.options.map((o) => (
          <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: dirty ? 'var(--red-600)' : 'var(--text-strong)', fontWeight: dirty ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={arr.includes(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    );
  }

  if (col.type === 'tag') {
    const tone = value === '대기' || value === '진행' ? 'brand' : value === '반려' ? 'seal' : 'neutral';
    return <span style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start' }}><Tag tone={tone}>{value}</Tag></span>;
  }

  if (col.type === 'static') {
    const s = col.key === 'motivation'
      ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : { fontVariantNumeric: 'tabular-nums' };
    return <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', display: 'block', textAlign: align, ...s }}>{value}</span>;
  }

  if (col.type === 'assign') {
    const options = assignOptions(col.key, row, grants);
    // 권한 밖의 자리이거나 고를 값이 없으면 셀렉트를 아예 내주지 않는다.
    if (!canEditRow(grants, row) || options.length === 0) {
      return <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', display: 'block', textAlign: align }}>{value || '—'}</span>;
    }
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ ...baseInput, cursor: 'pointer', ...dirtyStyle }}>
        {!value && <option value="">선택</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (col.type === 'actions') {
    // 임기 해제는 그 자리를 지정할 수 있는 사람만 누를 수 있다.
    const actions = col.actions.filter((a) => a !== 'unassign' || canEditRow(grants, row));
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {actions.map((a) => (
          <button key={a} type="button" onClick={() => onAction(a, row)} style={actionStyle(a, row._pendingDelete)}>
            {actionLabel(a, row)}
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

/** assign 셀의 선택지(한글 라벨). 직책은 그 행의 부서에서 허용된 것만 남긴다. */
function assignOptions(key, row, grants) {
  if (key === 'department') return departmentOptions(grants).map(departmentLabel);
  return titleOptions(grants, departmentKey(row.department)).map((t) => titleLabel(t, departmentKey(row.department)));
}

function actionLabel(kind, row) {
  if (kind === 'delete') return row._pendingDelete ? '취소' : '삭제';
  if (kind === 'unassign') return row.title ? '임기 해제' : '해제 취소';
  if (kind === 'uncontrib') return row.contributor === false ? '해제 취소' : '기여자 해제';
  if (kind === 'detail') return '상세';
  if (kind === 'approve') return '승인';
  if (kind === 'reject') return '반려';
  return kind;
}
function actionStyle(kind, pendingDelete) {
  const base = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', lineHeight: 1, whiteSpace: 'nowrap' };
  if (kind === 'detail') return { ...base, background: 'transparent', color: 'var(--text-body)', border: '1px solid var(--border-strong)' };
  if (kind === 'approve') return { ...base, background: 'var(--brand)', color: '#fff', border: '1px solid transparent' };
  if (kind === 'reject') return { ...base, background: 'transparent', color: 'var(--red-600)', border: '1px solid var(--red-100)' };
  if (pendingDelete) return { ...base, background: 'var(--surface-sunken)', color: 'var(--text-body)', border: '1px solid var(--border-strong)' };
  return { ...base, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' };
}
