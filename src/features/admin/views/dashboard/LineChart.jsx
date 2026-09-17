import React from 'react';

/**
 * 경량 SVG 라인 차트 — 월별 출석률 추세(세미나·스터디 2선). y축 0/50/100 기준선.
 * data: [{ month, seminar, study }]  (값은 0~100 %)
 *
 * 축은 0 에서 시작한다. 예전엔 60~100 만 그리면서 그 아래를 60 으로 눌러 버려,
 * 출석률 20% 와 60% 가 같은 높이에 찍혔다 — 축을 좁히려면 값을 자르는 게 아니라
 * 자른 사실을 보여 줘야 하고, 출석률은 0 부터 봐야 읽힌다.
 */
export function LineChart({ data = [] }) {
  const W = 320, xStart = 40, xEnd = 300;
  const n = Math.max(1, data.length - 1);
  const x = (i) => xStart + (i * (xEnd - xStart)) / n;
  const y = (v) => 120 - Math.max(0, Math.min(100, v)) * 0.8; // 100→40, 50→80, 0→120
  const line = (key) => data.map((d, i) => `${x(i)},${y(d[key])}`).join(' ');

  return (
    <svg width="100%" height="170" viewBox="0 0 320 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {[40, 80, 120].map((gy, i) => (
        <line key={gy} x1="24" y1={gy} x2={W} y2={gy} stroke={i === 2 ? 'var(--border)' : 'var(--border-soft, var(--border))'} strokeWidth="1" />
      ))}
      {[['100', 44], ['50', 84], ['0', 124]].map(([t, ty]) => (
        <text key={t} x="16" y={ty} textAnchor="end" style={{ fontSize: 9, fill: 'var(--text-faint)' }}>{t}</text>
      ))}

      <polyline points={line('study')} fill="none" stroke="var(--ink-400, var(--text-muted))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={line('seminar')} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => (<circle key={`s${i}`} cx={x(i)} cy={y(d.seminar)} r="3.5" fill="var(--brand)" />))}
      {data.map((d, i) => (<circle key={`t${i}`} cx={x(i)} cy={y(d.study)} r="3.5" fill="var(--ink-400, var(--text-muted))" />))}

      {data.map((d, i) => (
        <text key={`m${i}`} x={x(i)} y="140" textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-muted)' }}>{d.month}</text>
      ))}
    </svg>
  );
}
