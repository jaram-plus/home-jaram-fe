import React, { useState } from 'react';
import './people.css';
import { TABS, orderExecGroups } from './people.data';
import { usePeople } from './people.queries';
import { AppHeader, Eyebrow, TabButton, GroupSection, EmptyState } from './views';

/**
 * JARAM people page — introduces the folks behind the club across three tabs:
 * 임원(officers, grouped by 부서) · 기여자(contributors) · 졸업자(alumni).
 *
 * A pure tab view machine over static seed data (people.data.js). In
 * production the rosters come from the backend; keep only the static copy
 * (tab labels, descriptions, empty strings) in the data file and feed
 * `PEOPLE[tab].groups` from the server response.
 */
export default function PeoplePage() {
  const [tab, setTab] = useState('exec'); // exec | contrib | grad

  const { data: people, isLoading, isError } = usePeople();
  const data = people?.[tab] ?? { desc: '', empty: '', groups: [] };
  // 임원은 부서·직책 순서를 화면에서 고정한다 (기여자·졸업자는 그룹이 하나뿐이라 그대로).
  const groups = tab === 'exec' ? orderExecGroups(data.groups) : data.groups;
  const total = groups.reduce((n, g) => n + g.members.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AppHeader current="people" />

      {/* hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) var(--container-pad) 0',
        }}
      >
        <Eyebrow>People</Eyebrow>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--fs-display-2)', color: 'var(--text-strong)', lineHeight: 1.1 }}>
          사람들
        </h1>
        <p style={{ margin: '18px 0 0', maxWidth: 560, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-lead)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
          자람을 만들어가는 사람들을 소개합니다.
        </p>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 36, borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </TabButton>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '22px var(--container-pad) clamp(4rem, 8vw, 7rem)' }}>
        {data.desc && (
          <p style={{ margin: '0 0 36px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
            {data.desc}
          </p>
        )}

        {isLoading ? (
          <EmptyState>불러오는 중…</EmptyState>
        ) : isError ? (
          <EmptyState>사람들 정보를 불러오지 못했습니다.</EmptyState>
        ) : total > 0 ? (
          <div className="jr-anim" key={tab} style={{ display: 'grid', gap: 48 }}>
            {groups.map((g, i) => (
              <GroupSection key={g.heading || `g${i}`} group={g} />
            ))}
          </div>
        ) : (
          <EmptyState>{data.empty || '등록된 정보가 없습니다.'}</EmptyState>
        )}
      </section>
    </div>
  );
}
