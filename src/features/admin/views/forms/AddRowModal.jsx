import React, { useState } from 'react';
import { Button, Input } from '@/design-system';
import { SCHEMAS } from '../../admin.data';
import { validateRow } from '../../admin.validation';

/**
 * 행 추가 모달 (선택). 기본 UX 는 툴바 "추가" → 표 상단 인라인 임시행(기획.md §8-3)입니다.
 * 구조화된 입력을 모달로 받고 싶은 리소스에서 이 컴포넌트로 교체하세요.
 *   <AddRowModal resource="member" onAdd={(fields)=>addRow('member', fields)} onClose={...} />
 */
export function AddRowModal({ resource, onAdd, onClose }) {
  const schema = SCHEMAS[resource];
  const editable = schema.cols.filter((c) => c.type === 'text' || c.type === 'select');
  const [values, setValues] = useState(() => Object.fromEntries(editable.map((c) => [c.key, c.type === 'select' ? c.options[0] : ''])));
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setValues((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const submit = () => {
    const errs = validateRow(resource, values);
    if (errs) { setErrors(errs); return; }
    onAdd(values);
    onClose();
  };

  return (
    <div className="adm-anim-fade" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}>
      <div className="adm-anim-pop" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 540, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-strong)' }}>{schema.addLabel}</h3>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {editable.map((c) => (
            c.type === 'select' ? (
              <label key={c.key} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-body)' }}>{c.label}</span>
                <select value={values[c.key]} onChange={(e) => set(c.key, e.target.value)} style={{ padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer' }}>
                  {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            ) : (
              <Input key={c.key} label={c.label} value={values[c.key]} onChange={(e) => set(c.key, e.target.value)} error={errors[c.key]} />
            )
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button onClick={submit}>추가</Button>
        </div>
      </div>
    </div>
  );
}
