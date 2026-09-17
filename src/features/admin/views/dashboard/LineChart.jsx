import React from 'react';

/**
 * 월별 출석률 추세 — 세미나(실선·주홍) / 스터디(파선·옥스블러드).
 * data: [{ month, seminar, study }] (값은 0~100 %)
 *
 * 편집 대장(ledger) 결: 기준선은 점선 헤어라인이고 바닥선만 실선이다. 자람의
 * heritage 는 무거운 라운딩이 아니라 괘선과 타이포에서 나온다(tokens/effects.css).
 *
 * 범례를 두지 않고 선 끝에 이름과 값을 붙인다. 범례는 독자의 눈을 데이터와
 * 키 사이로 왕복시키는데, 선은 직접 라벨이 가장 쉬운 형태다.
 *
 * 축은 0~100 을 통째로 그린다. 예전엔 60~100 만 그리면서 그 아래를 60 으로
 * 눌러 출석률 20% 와 60% 를 같은 높이에 찍었다. 0 에 붙는 비율 데이터는 0 까지
 * 펴는 것이 정석이고, 좁히려면 값을 자르는 게 아니라 자른 사실을 보여 줘야 한다.
 *
 * 글자는 계열 색을 입지 않는다 — 정체성은 옆의 점이 나르고, 글자는 잉크 토큰을
 * 써서 종이 위에서 또렷하게 남는다.
 */

const W = 640, H = 220;
const X0 = 44, X1 = 466;      // 선이 그려지는 구간. 오른쪽은 끝 라벨 몫이다.
const Y_TOP = 30, Y_BASE = 170;
const LABEL_X = 478;

const SERIES = [
  { key: 'seminar', name: '세미나', color: 'var(--brand)', dash: null },
  { key: 'study', name: '스터디', color: 'var(--brand-deep)', dash: '6 4' },
];

const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
const yOf = (v) => Y_BASE - clamp(v) * ((Y_BASE - Y_TOP) / 100);

export function LineChart({ data = [] }) {
  if (!data.length) {
    return (
      <p style={{ margin: 0, padding: '48px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>
        아직 집계할 출석 기록이 없습니다.
      </p>
    );
  }

  const n = Math.max(1, data.length - 1);
  const xOf = (i) => X0 + (i * (X1 - X0)) / n;
  const last = data.length - 1;

  // 두 선이 비슷한 높이로 끝나면 끝 라벨이 겹친다. 겹치는 만큼만 벌린다.
  const ends = SERIES.map((s) => ({ ...s, value: clamp(data[last][s.key]), y: yOf(data[last][s.key]) }));
  const [a, b] = ends;
  const gap = b.y - a.y;
  if (Math.abs(gap) < 18) {
    const push = (18 - Math.abs(gap)) / 2;
    const dir = gap >= 0 ? 1 : -1;
    a.labelY = a.y - push * dir;
    b.labelY = b.y + push * dir;
  }

  const summary = ends.map((s) => `${s.name} ${s.value}%`).join(', ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label={`월별 출석률 추세. ${data[0].month}부터 ${data[last].month}까지. 마지막 달 ${summary}.`}
    >
      {/* 기준선 — 100·50 은 점선, 바닥선만 실선 */}
      {[
        { y: Y_TOP, label: '100%', solid: false },
        { y: (Y_TOP + Y_BASE) / 2, label: '50', solid: false },
        { y: Y_BASE, label: '0', solid: true },
      ].map((g) => (
        <g key={g.label}>
          <line
            x1={X0 - 8} y1={g.y} x2={X1 + 8} y2={g.y}
            stroke={g.solid ? 'var(--border-strong)' : 'var(--border-soft)'}
            strokeWidth="1"
            strokeDasharray={g.solid ? undefined : '1 3'}
          />
          <text
            x={X0 - 14} y={g.y} textAnchor="end" dominantBaseline="middle"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'var(--text-faint)' }}
          >
            {g.label}
          </text>
        </g>
      ))}

      {/* 선 — 스터디를 파선으로 두어 색에만 기대지 않는다 */}
      {SERIES.map((s) => (
        <polyline
          key={s.key}
          points={data.map((d, i) => `${xOf(i)},${yOf(d[s.key])}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth="2"
          strokeDasharray={s.dash ?? undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* 점 — 종이색 링을 둘러 선 위에 얹는다. 값이 0 이어도 바닥선 위에 남는다 */}
      {SERIES.map((s) =>
        data.map((d, i) => (
          <circle
            key={`${s.key}${i}`}
            cx={xOf(i)} cy={yOf(d[s.key])} r="4"
            fill={s.color} stroke="var(--surface-card)" strokeWidth="2"
          />
        )),
      )}

      {/* 선 끝 직접 라벨 — 색은 점이 나르고 글자는 잉크를 입는다 */}
      {ends.map((s) => (
        <text
          key={s.key}
          x={LABEL_X} y={s.labelY ?? s.y} dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <tspan style={{ fontSize: 11, fill: 'var(--text-muted)' }}>{s.name} </tspan>
          <tspan style={{ fontSize: 14, fontWeight: 700, fill: 'var(--text-strong)' }}>{s.value}%</tspan>
        </text>
      ))}

      {/* 월 — 마지막 달만 강조한다(기수별 막대차트가 현재 기수를 다루는 방식과 같다) */}
      {data.map((d, i) => (
        <text
          key={d.month}
          x={xOf(i)} y={Y_BASE + 22} textAnchor="middle"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: i === last ? 700 : 400,
            fill: i === last ? 'var(--text-strong)' : 'var(--text-faint)',
          }}
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}
