import React from 'react';
import { Card, Button } from '@/design-system';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import { Eyebrow, FieldRow } from './parts';
import { EYEBROW, READONLY_LABELS, LABELS, MESSAGES, AUTHORITY_LABELS, ACTIONS } from '../profile.data';

/**
 * 읽기 모드 카드. 상단 빨강 룰(accent="top") + PROFILE 아이라벨, 이름(디스플레이),
 * 기수/권한 등 읽기 전용 행, 그리고 bio/github/blog 값. 우상단 "수정"·"로그아웃" 버튼.
 */
export function ProfileView({ me, onEdit, onLogout }) {
  const empty = <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>;

  // 읽기 전용 값 표시: authority/department/title은 코드→한글 매핑, 나머지는 원문.
  const readonlyValue = (key) => {
    if (key === 'authority') return AUTHORITY_LABELS[me[key]] ?? me[key];
    if (key === 'department') return departmentLabel(me[key]) ?? empty;
    if (key === 'title') return titleLabel(me[key]) ?? empty;
    return me[key] ?? empty;
  };

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
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
          <Button size="sm" variant="outline" onClick={onEdit}>{ACTIONS.edit}</Button>
          <Button size="sm" variant="ghost" onClick={onLogout}>{ACTIONS.logout}</Button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-5)' }}>
        {READONLY_LABELS.map(([key, label]) => (
          <FieldRow key={key} label={label}>{readonlyValue(key)}</FieldRow>
        ))}
        <FieldRow label={LABELS.bio}>{me.bio || empty}</FieldRow>
        <FieldRow label={LABELS.githubUrl}>{link(me.githubUrl)}</FieldRow>
        <FieldRow label={LABELS.blogUrl}>{link(me.blogUrl)}</FieldRow>
      </div>
    </Card>
  );
}
