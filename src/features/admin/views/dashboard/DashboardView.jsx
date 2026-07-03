import React from 'react';
import { useDashboardStats } from '../../admin.queries';
import { KpiCard } from './KpiCard';
import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PendingBanner } from './PendingBanner';

const panel = { background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)' };
const panelTitle = { margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' };
const panelSub = { margin: '0 0 18px', fontSize: 12, color: 'var(--text-faint)' };

/**
 * 대시보드 — KPI 카드 행 + 도넛/막대/라인 차트 + 가입 신청 배너.
 * 수치는 useDashboardStats(GET /admin/dashboard/stats) 에서 옵니다.
 */
export function DashboardView() {
  const { data: s, isLoading, isError } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !s) return <p style={{ color: 'var(--text-muted)' }}>대시보드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>;

  const g = s.gradeBreakdown || {};
  const donut = [
    { label: '수습회원', value: g.probationary || 0, color: 'var(--red-300)' },
    { label: '준회원', value: g.associate || 0, color: 'var(--brand)' },
    { label: '정회원', value: g.regular || 0, color: 'var(--brand-deep)' },
  ];
  const donutTotal = donut.reduce((a, b) => a + b.value, 0);
  const maxGen = Math.max(...(s.genBreakdown || []).map((c) => c.gen));
  const bars = (s.genBreakdown || []).map((c) => ({ label: `${c.gen}기`, value: c.count, highlight: c.gen === maxGen }));

  return (
    <div style={{ position: 'relative' }}>
      <span aria-hidden style={{ position: 'absolute', top: -30, right: -10, fontFamily: 'var(--font-display)', fontSize: 260, lineHeight: 1, color: 'var(--brand)', opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>JR</span>

      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>OVERVIEW</p>
      <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1.1, color: 'var(--text-strong)' }}>한눈에 보는 <span style={{ color: 'var(--brand)' }}>자람</span></h1>
      <p style={{ margin: '0 0 26px', fontSize: 16, color: 'var(--text-muted)' }}>오늘 기준 현황</p>

      <PendingBanner count={s.pendingApplications} breakdown={s.pendingBreakdown} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 22 }}>
        <KpiCard label="전체 재학 회원" value={s.totalMembers} suffix="명" tone="up" caption={`이번 학기 +${s.deltas?.members ?? 0}`} />
        <KpiCard label="졸업생 누적" value={s.alumniCount} suffix="명" tone="neutral" caption="Since 1984" />
        <KpiCard label="세미나 평균 출석률" value={s.seminarAttendanceRate} suffix="%" tone="up" caption={`전월 대비 +${s.deltas?.seminarRate ?? 0}%p`} />
        <KpiCard label="스터디 평균 출석률" value={s.studyAttendanceRate} suffix="%" tone="down" caption={`전월 대비 ${s.deltas?.studyRate ?? 0}%p`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 18, marginBottom: 22 }}>
        <div style={panel}>
          <p style={panelTitle}>재학 회원 등급 비율</p>
          <p style={panelSub}>신입생(수습) vs 재학생(준·정)</p>
          <DonutChart data={donut} centerValue={donutTotal} centerLabel="재학 회원" />
        </div>
        <div style={panel}>
          <p style={panelTitle}>기수별 재학 인원</p>
          <p style={panelSub}>{bars[0]?.label} ~ {bars[bars.length - 1]?.label}</p>
          <BarChart data={bars} />
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={panelTitle}>월별 출석률 추세</p>
            <p style={{ ...panelSub, margin: 0 }}>세미나 · 스터디</p>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Legend color="var(--brand)" label="세미나" />
            <Legend color="var(--ink-400, var(--text-muted))" label="스터디" />
          </div>
        </div>
        <LineChart data={s.attendanceTrend} />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 16, height: 3, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function DashboardSkeleton() {
  const box = (h) => ({ background: 'var(--surface-sunken)', borderRadius: 14, height: h });
  return (
    <div>
      <div style={{ ...box(40), width: 260, marginBottom: 24 }} />
      <div style={{ ...box(72), marginBottom: 26 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 22 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={box(130)} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 18 }}>
        <div style={box(240)} /><div style={box(240)} />
      </div>
    </div>
  );
}
