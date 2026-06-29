import React from 'react';
import { Card, Button } from '@/design-system';
import { Eyebrow, FieldRow } from './parts';
import { EYEBROW, READONLY_LABELS, LABELS, MESSAGES, AUTHORITY_LABELS } from '../profile.data';

/**
 * 읽기 모드 카드. 상단 빨강 룰(accent="top") + PROFILE 아이라벨, 이름(디스플레이),
 * 기수/권한 등 읽기 전용 행, 그리고 bio/github/blog 값. 우상단 "수정" 버튼.
 */
export function ProfileView({ me, onEdit }) {
  const link = (url) =>
    url ? (
      <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
        {url}
      </a>
    ) : (
      <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>
    );

  return (
    <Card accent="top">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <Eyebrow>{EYEBROW}</Eyebrow>
          <h1 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}>
            {me.name}
          </h1>
          {me.gen && (
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
              {me.gen}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onEdit}>수정</Button>
      </div>

      <div style={{ marginTop: 'var(--space-5)' }}>
        {READONLY_LABELS.map(([key, label]) => (
          <FieldRow key={key} label={label}>
            {key === 'authority'
              ? (AUTHORITY_LABELS[me[key]] ?? me[key])
              : (me[key] ?? <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>)}
          </FieldRow>
        ))}
        <FieldRow label={LABELS.bio}>
          {me.bio || <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>}
        </FieldRow>
        <FieldRow label={LABELS.githubUrl}>{link(me.githubUrl)}</FieldRow>
        <FieldRow label={LABELS.blogUrl}>{link(me.blogUrl)}</FieldRow>
      </div>
    </Card>
  );
}
