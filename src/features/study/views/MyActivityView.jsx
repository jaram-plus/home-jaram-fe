import React from 'react';
import { Tag } from '@/design-system';

/** A single status row in the "내 활동" lists. */
function StatusRow({ item }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        padding: '18px 22px',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
          {item.title}
        </div>
        <div style={{ marginTop: 6, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
          {item.message}
        </div>
      </div>
      <Tag tone={item.tone} size="sm" style={{ flex: 'none' }}>{item.badge}</Tag>
    </div>
  );
}

function Group({ title, items }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 18px', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((it) => (
          <StatusRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

/** "내 활동" — my applications + studies I created (서버에서 받아온다). */
export function MyActivityView({ apps = [], studies = [] }) {
  return (
    <div className="jr-anim" style={{ display: 'grid', gap: 40 }}>
      <Group title="내 신청 현황" items={apps} />
      <Group title="내가 개설한 스터디" items={studies} />
    </div>
  );
}
