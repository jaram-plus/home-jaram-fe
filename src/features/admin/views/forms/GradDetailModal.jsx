import React from 'react';
import { Button, Input } from '@/design-system';
import { titleLabel } from '@/shared/member/enums';
import { MESSAGES, TOAST } from '../../admin.data';
import { useMemberDetail, useSaveGradDetail } from '../../admin.queries';

/**
 * 졸업생 상세 모달. 표는 읽기 전용이고 졸업생 정보를 고치는 곳은 여기 하나입니다.
 *
 *   기본 정보(학번·기수)  — 회원 정보라 여기서 고치지 않습니다(회원 탭이 담당).
 *   졸업연도             — 고칠 수 있습니다.
 *   이력                 — 자람에서의 임원 이력을 머리에 두고, 그 아래 졸업 후 이력을
 *                          한 줄씩 더하고 지웁니다. 가장 최근 한 건이 표의 '현재 소속·직무' 가 됩니다.
 *
 * 표의 모아 저장과 달리 저장을 누르면 즉시 커밋합니다.
 */
export function GradDetailModal({ row, onClose, onDone }) {
  // 졸업생도 회원이라 상세는 회원 상세와 같은 계약을 씁니다(졸업연도·이력까지 담깁니다).
  const { data, isLoading, error } = useMemberDetail(row?.id);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>GRADUATE</p>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-strong)' }}>{row?.name}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        {isLoading && <Skeleton />}
        {error && (
          <p style={{ margin: '22px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>
            {error.code === 'NOT_FOUND' ? '졸업생을 찾을 수 없습니다.' : '상세 정보를 불러오지 못했습니다.'}
          </p>
        )}
        {/* 편집 사본은 불러온 값에서 출발한다 — 값이 도착한 뒤에 붙여 초기화를 한 번에 끝낸다. */}
        {data && <GradEditor detail={data} name={row?.name} onClose={onClose} onDone={onDone} />}
      </div>
    </div>
  );
}

/* ── 편집부 ─────────────────────────────────────────────────────────── */

function GradEditor({ detail, name, onClose, onDone }) {
  // 줄을 더하고 지워도 흔들리지 않는 React key 가 필요해 순번을 붙인다(저장할 때 뗀다).
  // 서버가 비워 보낸 칸(null)은 빈 문자열로 받아 둔다 — 입력이 통제 상태를 잃지 않도록.
  const [gradYear, setGradYear] = React.useState(String(detail.gradYear ?? ''));
  const [careers, setCareers] = React.useState(() => (detail.careers || []).map((c, i) => ({
    key: i, at: c.at || '', org: c.org || '', job: c.job || '',
  })));
  const nextKey = React.useRef((detail.careers || []).length);

  const save = useSaveGradDetail({
    onSuccess: () => { onDone(TOAST.gradSaved(name)); onClose(); },
  });

  const setCareer = (key, field, value) =>
    setCareers((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const addCareer = () =>
    setCareers((prev) => [...prev, { key: nextKey.current++, at: '', org: '', job: '' }]);

  const dropCareer = (key) => setCareers((prev) => prev.filter((c) => c.key !== key));

  const submit = () => {
    if (save.isPending) return;
    // 세 칸이 모두 빈 줄은 더하다 만 줄이라 저장하지 않는다.
    const cleaned = careers
      .map(({ at, org, job }) => ({ at: at.trim(), org: org.trim(), job: job.trim() }))
      .filter((c) => c.at || c.org || c.job);
    save.mutate({ id: detail.id, gradYear: gradYear.trim(), careers: cleaned });
  };

  const terms = detail.terms || [];

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <Field label="학번">{detail.studentId}</Field>
        <Field label="기수">{detail.gen}</Field>
      </div>

      <div style={{ marginTop: 22, maxWidth: 200 }}>
        <Input
          label="졸업연도"
          inputMode="numeric"
          placeholder="2021"
          value={gradYear}
          onChange={(e) => setGradYear(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 28 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--text-faint)' }}>CAREER</p>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 19, color: 'var(--text-strong)' }}>이력</h4>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{MESSAGES.gradTermsReadonly}</p>

        <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ ...CAREER_GRID, minHeight: 38, background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border)' }}>
            <HeadCell>일시</HeadCell>
            <HeadCell>직장 이름</HeadCell>
            <HeadCell>직무</HeadCell>
            <span />
          </div>

          {terms.map((t, i) => (
            <div key={`term-${i}`} style={{ ...CAREER_GRID, minHeight: 44, borderBottom: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
              <ReadCell>{genRange(t)}</ReadCell>
              <ReadCell>자람</ReadCell>
              <ReadCell>{titleLabel(t.title, t.department)}</ReadCell>
              <span />
            </div>
          ))}

          {careers.map((c) => (
            <div key={c.key} style={{ ...CAREER_GRID, minHeight: 44, borderBottom: '1px solid var(--border)' }}>
              <CareerInput value={c.at} placeholder="2021.03" onChange={(v) => setCareer(c.key, 'at', v)} aria-label="일시" />
              <CareerInput value={c.org} placeholder="네이버" onChange={(v) => setCareer(c.key, 'org', v)} aria-label="직장 이름" />
              <CareerInput value={c.job} placeholder="백엔드 엔지니어" onChange={(v) => setCareer(c.key, 'job', v)} aria-label="직무" />
              <button
                type="button"
                onClick={() => dropCareer(c.key)}
                aria-label="이력 지우기"
                style={{ background: 'none', border: 'none', fontSize: 18, lineHeight: 1, cursor: 'pointer', color: 'var(--text-faint)' }}
              >
                ×
              </button>
            </div>
          ))}

          {terms.length === 0 && careers.length === 0 && (
            <p style={{ margin: 0, padding: '18px 14px', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{MESSAGES.noCareer}</p>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={addCareer}>이력 추가</Button>
        </div>
      </div>

      {save.error && (
        <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>{save.error.message}</p>
      )}

      <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose} disabled={save.isPending}>취소</Button>
        <Button onClick={submit} disabled={save.isPending}>{save.isPending ? '저장 중…' : '저장'}</Button>
      </div>
    </>
  );
}

/* 일시 · 직장 이름 · 직무 · 지우기. 이력 표의 머리·본문이 같은 격자를 씁니다. */
const CAREER_GRID = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(0, 1fr) minmax(0, 1fr) 30px',
  alignItems: 'center',
  gap: 4,
  padding: '0 10px',
};

function HeadCell({ children }) {
  return <span style={{ padding: '0 8px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.06em', color: 'var(--text-faint)' }}>{children}</span>;
}

function ReadCell({ children }) {
  return <span style={{ padding: '0 8px', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>;
}

/** 표 안의 한 칸 — 표의 인라인 편집 셀(EditableCell)과 같은 결로 그립니다. */
function CareerInput({ value, placeholder, onChange, ...rest }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => {
        e.currentTarget.style.background = 'var(--surface-raised)';
        e.currentTarget.style.borderColor = 'var(--brand)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-tint)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
      }}
      style={{
        width: '100%', minWidth: 0, boxSizing: 'border-box', background: 'transparent',
        border: '1px solid transparent', borderRadius: 6, padding: '7px 8px',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-strong)', outline: 'none',
      }}
      {...rest}
    />
  );
}

/** 값이 비면 줄 자체를 그리지 않습니다 (MemberDetailModal 과 같은 규칙). */
function Field({ label, children }) {
  if (children == null || children === '') return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)' }}>{children}</span>
    </div>
  );
}

/** 임기는 기수로 셉니다(연도 아님). endGen 이 null 이면 현직. */
function genRange(t) {
  if (t.endGen == null) return `${t.startGen}기~`;
  return t.startGen === t.endGen ? `${t.startGen}기` : `${t.startGen}–${t.endGen}기`;
}

function Skeleton() {
  return (
    <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 14, borderRadius: 4, background: 'var(--surface-sunken)' }} />
      ))}
    </div>
  );
}

export default GradDetailModal;
