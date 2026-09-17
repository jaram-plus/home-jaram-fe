import React from 'react';

/**
 * 관리 패널이 함께 쓰는 조각.
 *
 * 패널은 두 곳에 선다 — 스터디장의 '관리하기' 모달과 관리자 콘솔의 스터디 '상세'
 * 모달. 두 모달이 같은 리소스를 같은 엔드포인트로 다루므로 화면도 한 벌만 둔다.
 * 갈라 두면 스터디장 쪽만 고쳐지는 날이 온다.
 *
 * 스타일 상수는 styles.js 에 있다 — 컴포넌트와 섞으면 fast refresh 가 깨진다.
 */

export function GroupTitle({ children }) {
  return (
    <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
      {children}
    </h4>
  );
}

export function Note({ children }) {
  return (
    <p style={{ margin: 0, padding: '18px 2px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

/**
 * 학번 · 기수 · 이름 한 줄. 상세 모달의 명단(StudyDetailModal)과 같은 순서다.
 *
 * 학번을 먼저 두는 것은 그것만이 사람을 유일하게 가르기 때문이다. 승인·반려·삭제는
 * 잘못 고르면 되돌리기 어려워, 이름이 같은 두 사람을 눈으로 가를 수 있어야 한다.
 * 값은 서버가 마스킹해 보낸 것을 그대로 적는다.
 */
export function PersonLine({ entry }) {
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>
        {entry.studentId}
      </span>
      {entry.gen != null && <span style={{ color: 'var(--text-muted)' }}>{entry.gen}기</span>}
      <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--w-medium)' }}>
        {entry.name}
      </strong>
    </span>
  );
}
