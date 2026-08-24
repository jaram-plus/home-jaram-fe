import React from 'react';
import { Card, Button } from '@/design-system';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import jaramMark from '@/design-system/assets/logos/jaram-mark.png';
import { Eyebrow, GroupLabel, FieldRow } from './parts';
import { EYEBROW, GROUPS, READONLY_LABELS, LABELS, MESSAGES, AUTHORITY_LABELS, ACTIONS, TERMS_EMPTY, termPeriod } from '../profile.data';

const markSrc = typeof jaramMark === 'string' ? jaramMark : jaramMark.src;

/**
 * 읽기 모드 카드. 상단 빨강 룰(accent="top") + PROFILE 아이라벨, 이름(디스플레이),
 * 기수/권한 등 읽기 전용 행, 그리고 bio/github/blog 값. 우상단 "수정"·"로그아웃" 버튼.
 * `canAdmin`(임원진·운영진)이면 그 앞에 "관리자 콘솔" 진입 버튼이 함께 놓인다.
 */
export function ProfileView({ me, canAdmin, onAdmin, onEdit, onLogout }) {
  const empty = <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>;

  // 읽기 전용 값 표시: authority/department/title은 코드→한글 매핑, 나머지는 원문.
  // 학번은 숫자 → 헤리티지 세리프(고운바탕)로 조판.
  const readonlyValue = (key) => {
    if (key === 'authority') return AUTHORITY_LABELS[me[key]] ?? me[key];
    if (key === 'department') return departmentLabel(me[key]) ?? empty;
    if (key === 'title') return titleLabel(me.title, me.department) ?? empty;
    if (key === 'studentId') {
      return me[key]
        ? <span style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.01em' }}>{me[key]}</span>
        : empty;
    }
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
      {/* 시그니처: 카드 우상단에 옅게 깔린 오버사이즈 JR 인장(워터마크). */}
      <img
        src={markSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', top: '-36px', right: '-28px', width: '208px',
          opacity: 0.05, pointerEvents: 'none', userSelect: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <Eyebrow>{EYEBROW}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', margin: '8px 0 0' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-title-1)', lineHeight: 'var(--lh-tight)', color: 'var(--text-strong)' }}>
              {me.name}
            </h1>
            {me.gen != null && (
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
                {me.gen}기
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
          {canAdmin && (
            <Button size="sm" variant="secondary" onClick={onAdmin}>{ACTIONS.admin}</Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>{ACTIONS.edit}</Button>
          <Button size="sm" variant="ghost" onClick={onLogout}>{ACTIONS.logout}</Button>
        </div>
      </div>

      {/* 계정: 시스템·운영진이 부여하는 읽기 전용 사실. */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <GroupLabel>{GROUPS.account}</GroupLabel>
        {READONLY_LABELS.map(([key, label]) => {
          // 부서는 정보 없으면 행 자체를 숨긴다.
          if (key === 'department' && !departmentLabel(me.department)) return null;
          return (
            <FieldRow key={key} label={label}>{readonlyValue(key)}</FieldRow>
          );
        })}
        <FieldRow label={LABELS.phone}>{me.phone || empty}</FieldRow>
      </div>

      {/* 임기: 맡았던 직책의 이력(오래된 순). 현직은 종료 기수 자리를 비운다. */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <GroupLabel>{GROUPS.terms}</GroupLabel>
        {me.terms?.length
          ? me.terms.map((t, i) => (
              <FieldRow key={i} label={termPeriod(t)}>
                {titleLabel(t.title, t.department) ?? departmentLabel(t.department) ?? empty}
              </FieldRow>
            ))
          : <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{TERMS_EMPTY}</p>}
      </div>

      {/* 소개: 본인이 직접 채우는 프로필. */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <GroupLabel>{GROUPS.profile}</GroupLabel>
        <FieldRow label={LABELS.bio}>{me.bio || empty}</FieldRow>
        <FieldRow label={LABELS.githubUrl}>{link(me.githubUrl)}</FieldRow>
        <FieldRow label={LABELS.blogUrl}>{link(me.blogUrl)}</FieldRow>
      </div>
      </div>
    </Card>
  );
}
