import React from 'react';

/**
 * 스티키 저장바 — 변경(편집/추가/삭제) ≥ 1 이면 콘텐츠 하단에 등장.
 * "변경 N건 · [되돌리기] [데이터베이스에 저장]". 저장은 PATCH …:batch 한 번 (기획.md §8-4·5).
 */
export function SaveBar({ count, saving, onSave, onCancel }) {
  if (!count) return null;
  return (
    <div
      className="adm-anim-pop"
      style={{ position: 'sticky', bottom: 22, margin: '28px auto 0', width: 'max-content', maxWidth: '100%', display: 'flex', alignItems: 'center', gap: 18, background: 'var(--ink-900)', color: 'var(--paper-100)', borderRadius: 14, padding: '12px 14px 12px 22px', boxShadow: 'var(--shadow-lg)', zIndex: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-300)', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>저장하지 않은 변경 <span style={{ color: 'var(--red-300)', fontWeight: 700 }}>{count}</span>건</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={onCancel} disabled={saving} style={{ padding: '9px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--paper-300)', background: 'transparent', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, cursor: 'pointer' }}>되돌리기</button>
        <button type="button" onClick={onSave} disabled={saving} style={{ padding: '9px 18px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--brand)', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1 }}>
          {saving ? '저장 중…' : '데이터베이스에 저장'}
        </button>
      </div>
    </div>
  );
}
