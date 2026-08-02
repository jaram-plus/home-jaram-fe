import React from 'react';

const WIDTH = 520;
const HEIGHT = 620;

/**
 * 회원을 골라 무언가를 지정하는 모달들의 공용 셸 (임원 지정 · 기여자 추가).
 * 크기를 고정해 1단계에서 2단계로 넘어갈 때 카드가 출렁이지 않게 합니다.
 * 표의 인라인 편집과 달리 이런 모달은 즉시 저장합니다 — 임명·등록은 모아 두었다
 * 함께 커밋할 성질이 아닙니다.
 */
export function PickerModal({ onClose, children }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: WIDTH, maxWidth: '100%', height: HEIGHT, maxHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 28, boxSizing: 'border-box' }}
      >
        {children}
      </div>
    </div>
  );
}

export function PickerHeader({ eyebrow, title, desc, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>{eyebrow}</p>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-strong)' }}>{title}</h3>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
    </div>
  );
}

/**
 * 검색 가능한 회원 목록. 어떤 회원을 부를지는 호출부가 정하고(query), 여기서는
 * 이름·학번·기수·학과로 좁히기만 합니다.
 *
 * @param query        TanStack Query 결과 { data, isLoading, error }
 * @param onPick       행을 누르면 그 회원 객체를 받습니다
 * @param emptyMessage 후보가 아예 없을 때의 안내 문구
 */
export function MemberPicker({ query, onPick, emptyMessage }) {
  const { data, isLoading, error } = query;
  const [term, setTerm] = React.useState('');

  const needle = term.trim().toLowerCase();
  const rows = (data || []).filter((m) => !needle
    || [m.name, m.studentId, m.gen, m.faculty].some((v) => String(v).toLowerCase().includes(needle)));

  return (
    <>
      <input
        type="text"
        placeholder="이름·학번·학과 검색"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', margin: '18px 0 12px', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, outline: 'none' }}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        {isLoading && <PickerNote>회원 명단을 불러오는 중입니다.</PickerNote>}
        {error && <PickerNote>회원 명단을 불러오지 못했습니다.</PickerNote>}
        {!isLoading && !error && rows.length === 0 && (
          <PickerNote>{needle ? '검색 결과가 없습니다.' : emptyMessage}</PickerNote>
        )}
        {rows.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m)}
            style={{ display: 'grid', gridTemplateColumns: '58px 1fr 96px 1.1fr', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>{m.gen}</span>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{m.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{m.studentId}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.faculty || '—'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function PickerNote({ children }) {
  return <p style={{ margin: 0, padding: '28px 16px', textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{children}</p>;
}

export function PickerFooter({ onBack, onSubmit, submitLabel, disabled, busy }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
      <button type="button" onClick={onBack} style={{ padding: '10px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-body)', background: 'var(--surface-card)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer' }}>
        이전
      </button>
      <button type="button" onClick={onSubmit} disabled={disabled || busy} style={{ padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', border: '1.5px solid transparent', borderRadius: 8, cursor: busy ? 'wait' : 'pointer', opacity: disabled || busy ? 0.6 : 1, boxShadow: 'var(--shadow-brand)' }}>
        {submitLabel}
      </button>
    </div>
  );
}
