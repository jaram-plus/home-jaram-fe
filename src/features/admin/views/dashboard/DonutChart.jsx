import React from 'react';

/**
 * 경량 SVG 도넛 차트 — 재학 회원 등급 비율(수습/준/정). 토큰 색상만 사용.
 * data: [{ label, value, color }] (color 는 CSS 변수 문자열).
 */
export function DonutChart({ data = [], centerValue, centerLabel, size = 150 }) {
  const r = 54;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const arcs = data.map((d, i) => {
    const len = (d.value / total) * C;
    // 앞 조각들의 누적 길이만큼 시작점을 뒤로 민다 (data 는 3~4개라 비용 무시).
    const offset = data.slice(0, i).reduce((s, x) => s + (x.value / total) * C, 0);
    return { ...d, dash: `${len} ${C - len}`, dashoffset: -offset };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={`${centerLabel} ${centerValue}`}>
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth="17" />
          {arcs.map((a, i) => (
            <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={a.color} strokeWidth="17" strokeDasharray={a.dash} strokeDashoffset={a.dashoffset} />
          ))}
        </g>
        <text x="70" y="66" textAnchor="middle" style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700, fill: 'var(--brand-deep)' }}>{centerValue}</text>
        <text x="70" y="86" textAnchor="middle" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, fill: 'var(--text-faint)' }}>{centerLabel}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', marginLeft: 6 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
