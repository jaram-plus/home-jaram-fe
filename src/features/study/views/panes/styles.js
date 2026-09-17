/**
 * 패널이 함께 쓰는 두 모양. 컴포넌트와 한 파일에 두면 fast refresh 가 그 파일을
 * 통째로 다시 올려, 편집 중이던 폼의 입력이 사라진다.
 */

/** 한 사람·한 주차를 담는 줄. 왼쪽에 내용, 오른쪽에 손잡이. */
export const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
  background: 'var(--surface-card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', padding: '14px 18px',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
};

/** 줄 안에 끼는 한 칸짜리 입력 — 반려 사유, 새 주차 제목. */
export const inputStyle = {
  flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-strong)', background: 'var(--surface-card)',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
};
