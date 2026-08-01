import React from 'react';
import { Tag } from '@/design-system';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import { useMemberDetail } from '../../admin.queries';

/**
 * 회원 상세 모달 (조회 전용). 표의 행으로 헤더를 즉시 그리고 나머지는
 * GET /api/admin/members/{id} 로 채웁니다. 값이 없는 항목은 줄 자체를 생략합니다.
 * 수정은 표의 인라인 편집 + 일괄 저장이 유일한 경로라 여기서는 아무것도 바꾸지 않습니다.
 */
export function MemberDetailModal({ row, onClose }) {
  const { data, isLoading, error } = useMemberDetail(row?.id);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const meta = [row?.gen, row?.grade, row?.status].filter(Boolean).join(' · ');

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>MEMBER</p>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-strong)' }}>{row?.name}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              {meta}
              {data?.contributor && <span style={{ marginLeft: 8 }}><Tag tone="neutral">기여자</Tag></span>}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginTop: 22 }}>
          {isLoading && <Skeleton />}
          {error && (
            <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>
              {error.code === 'NOT_FOUND' ? '회원을 찾을 수 없습니다.' : '상세 정보를 불러오지 못했습니다.'}
            </p>
          )}
          {data && (
            <>
              <Field label="학번">{data.studentId}</Field>
              <Field label="학부">{data.faculty}</Field>
              <Field label="연락처">{data.phone}</Field>
              <Field label="이메일">{data.email}</Field>
              <Field label="신청일">{(data.createdAt || '').slice(0, 10)}</Field>
              <Field label="부서">{departmentLabel(data.department)}</Field>
              <Field label="직책">{titleLabel(data.title, data.department)}</Field>
              <Field label="자기소개">{data.bio}</Field>
              {/* Link 를 그대로 넘기면 값이 없어도 children 이 엘리먼트라 빈 줄이 남는다. */}
              <Field label="GitHub">{data.githubUrl && <Link href={data.githubUrl} />}</Field>
              <Field label="블로그">{data.blogUrl && <Link href={data.blogUrl} />}</Field>
              <Terms terms={data.terms} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** 값이 비면 줄 자체를 그리지 않습니다 — 빈 칸이 줄줄이 남는 것보다 낫습니다. */
function Field({ label, children }) {
  if (children == null || children === '' || children === false) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-strong)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{children}</span>
    </div>
  );
}

function Link({ href }) {
  return <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-deep)' }}>{href}</a>;
}

/** 임기 이력. startGen·endGen 은 기수입니다(연도 아님). endGen 이 null 이면 현직. */
function Terms({ terms }) {
  if (!terms || terms.length === 0) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.14em', color: 'var(--text-faint)' }}>TERMS</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {terms.map((t, i) => (
          <li key={`${t.startGen}-${t.title}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{genRange(t)}</span>
            <span>{titleLabel(t.title, t.department)}</span>
            {t.endGen == null && <Tag tone="brand">현직</Tag>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function genRange(t) {
  if (t.endGen == null) return `${t.startGen}기~`;
  return t.startGen === t.endGen ? `${t.startGen}기` : `${t.startGen}–${t.endGen}기`;
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 14, borderRadius: 4, background: 'var(--surface-sunken)' }} />
      ))}
    </div>
  );
}
