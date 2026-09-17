import React, { useState } from 'react';

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
 *
 * 호버는 달을 겨냥한다. 2px 선을 정확히 맞히게 하면 아무도 못 맞힌다 — 달마다
 * 차트 높이 전체를 덮는 투명한 띠를 두고, 그 띠가 세로선과 툴팁을 띄운다.
 * 툴팁은 정보를 가두지 않는다: 같은 값이 키보드 포커스로도 나오고, 띠마다
 * 붙은 aria-label 로 읽힌다.
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
  const [active, setActive] = useState(null);

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

  const readingOf = (i) =>
    `${data[i].month} ` + SERIES.map((s) => `${s.name} ${clamp(data[i][s.key])}퍼센트`).join(', ');

  // 띠는 이웃한 달의 중간까지 맡는다 — 포인터는 가장 가깝기만 하면 된다.
  const bandLeft = (i) => (i === 0 ? 0 : (xOf(i - 1) + xOf(i)) / 2);
  const bandRight = (i) => (i === last ? W : (xOf(i) + xOf(i + 1)) / 2);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        role="group"
        aria-label={`월별 출석률 추세, ${data[0].month}부터 ${data[last].month}까지`}
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

        {/* 크로스헤어 — 데이터 뒤에 둬서 선을 가리지 않는다 */}
        {active !== null && (
          <line
            x1={xOf(active)} y1={Y_TOP - 6} x2={xOf(active)} y2={Y_BASE}
            stroke="var(--border-strong)" strokeWidth="1"
          />
        )}

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
              cx={xOf(i)} cy={yOf(d[s.key])} r={active === i ? 5.5 : 4}
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
              fontWeight: i === last || active === i ? 700 : 400,
              fill: i === last || active === i ? 'var(--text-strong)' : 'var(--text-faint)',
            }}
          >
            {d.month}
          </text>
        ))}

        {/* 달마다 하나씩, 차트 높이를 통째로 덮는 투명한 띠 */}
        {data.map((d, i) => (
          <rect
            key={`hit${i}`}
            x={bandLeft(i)} y={0} width={bandRight(i) - bandLeft(i)} height={Y_BASE + 30}
            fill="transparent"
            tabIndex={0}
            aria-label={readingOf(i)}
            style={{ cursor: 'pointer', outline: 'none' }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          />
        ))}
      </svg>

      {active !== null && <Tooltip data={data} i={active} x={xOf(active)} last={last} />}
    </div>
  );
}

/** 값이 앞서고 이름이 따른다 — 독자는 이미 계열을 알고 숫자를 원한다. */
function Tooltip({ data, i, x, last }) {
  const top = Math.min(...SERIES.map((s) => yOf(data[i][s.key])));
  const shiftX = i === 0 ? '0' : i === last ? '-100%' : '-50%';
  // 출석률이 높으면 점이 천장에 붙어 위로 띄울 자리가 없다. 그때는 아래로 뒤집는다
  // — 안 그러면 툴팁이 차트를 넘어 패널 제목을 덮는다.
  const shiftY = top < 72 ? '14px' : 'calc(-100% - 14px)';

  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        left: `${(x / W) * 100}%`,
        top: `${(top / H) * 100}%`,
        transform: `translate(${shiftX}, ${shiftY})`,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '9px 12px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)' }}>{data[i].month}</p>
      {SERIES.map((s) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          {/* 계열 키는 선이다 — 툴팁 밀도에서 채운 박스는 라벨 몫에 데이터 무게를 준다 */}
          <span
            style={{
              width: 14, height: 0, flex: 'none',
              borderTop: `2px ${s.dash ? 'dashed' : 'solid'} ${s.color}`,
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{s.name}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>
            {clamp(data[i][s.key])}%
          </span>
        </div>
      ))}
    </div>
  );
}
