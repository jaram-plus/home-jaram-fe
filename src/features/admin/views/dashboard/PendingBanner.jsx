import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 가입 신청 배너 — "N건 대기 중 → 승인하러 가기". 액셔너블(필러 아님).
 * count 0 이면 렌더하지 않습니다.
 */
export function PendingBanner({ count = 0, breakdown }) {
  const navigate = useNavigate();
  if (!count) return null;
  const sub = breakdown
    ? `신입생 ${breakdown.freshman ?? 0} · 재학생 ${breakdown.enrolled ?? 0} — 검토 후 승인하면 자동으로 등급이 부여됩니다.`
    : '검토 후 승인하면 자동으로 등급이 부여됩니다.';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--brand-tint)', border: '1px solid var(--red-100)', borderLeft: '4px solid var(--brand)', borderRadius: 12, padding: '16px 20px', marginBottom: 26 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>가입 신청 {count}건이 승인을 기다리고 있어요</p>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{sub}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/admin/applications')}
        style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-brand)' }}
      >
        승인하러 가기 →
      </button>
    </div>
  );
}
