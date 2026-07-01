import React from 'react';

/**
 * 경량 SVG(플렉스) 막대 차트 — 기수별 재학 인원. 마지막(현재 기수) 막대를 강조.
 * data: [{ label, value, highlight? }]
 */
export function BarChart({ data = [], height = 176 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height, gap: 12, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = Math.max(10, Math.round((d.value / max) * (height - 40)));
        const opacity = 0.2 + 0.55 * (d.value / max);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: d.highlight ? 'var(--brand)' : 'var(--text-strong)' }}>{d.value}</span>
            <div
              style={{
                width: '100%', maxWidth: 46, height: h, borderRadius: '6px 6px 0 0',
                background: d.highlight ? 'var(--brand)' : `rgba(229,1,19,${opacity.toFixed(2)})`,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: d.highlight ? 700 : 400, color: d.highlight ? 'var(--text-strong)' : 'var(--text-muted)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
