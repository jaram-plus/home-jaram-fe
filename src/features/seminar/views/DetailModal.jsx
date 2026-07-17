import React from 'react';
import { Button, Tag } from '@/design-system';
import { ModalShell } from './ModalShell';
import { TopicChip } from './parts';
import { STATUS_BADGE, ENDED_CHIP, DETAIL, EMPTY } from '../seminar.data';
import { useAttendeePreview } from '../seminar.queries';

const NOTE = {
  margin: 0,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--text-muted)',
  lineHeight: 'var(--lh-normal)',
};

/** 라벨·값 한 줄. 값이 없으면 줄 자체를 렌더하지 않는다. */
function Meta({ label, children }) {
  if (!children) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-soft)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)' }}>
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--text-body)' }}>{children}</span>
    </div>
  );
}

/** 아이라벨이 붙은 섹션 블록. */
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--w-semibold)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/** 참석자 섹션 — 로그인 회원만 조회한다. */
function Attendees({ seminarId, isLoggedIn }) {
  const preview = useAttendeePreview(seminarId, { enabled: isLoggedIn });

  if (!isLoggedIn) return <p style={NOTE}>{DETAIL.attendeesLoginRequired}</p>;
  if (preview.isLoading) return <p style={NOTE}>{DETAIL.attendeesLoading}</p>;
  if (preview.isError) return <p style={NOTE}>{DETAIL.attendeesError}</p>;

  const list = preview.data?.list ?? [];
  if (list.length === 0) return <p style={NOTE}>{EMPTY.attendees}</p>;

  return (
    <>
      <p style={{ ...NOTE, marginBottom: 8 }}>{DETAIL.attendeesCount(preview.data.count)}</p>
      <div>
        {list.map((a, i) => (
          <div
            key={`${a.name ?? ''}-${a.at}-${i}`}
            style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border-soft)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)' }}
          >
            <span style={{ color: 'var(--text-strong)', fontWeight: 'var(--w-medium)' }}>{a.name ?? DETAIL.unknownMember}</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.at}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * 세미나 상세 모달 — 카드를 누르면 열린다.
 *
 * 목록이 이미 갖고 있는 필드를 넓게 보여주고, 거기에 상세 설명·내 출석 기록·
 * 참석자 미리보기를 더한다. 참석자만 모달이 열릴 때 지연 조회하고 나머지는
 * 목록 응답을 그대로 쓴다.
 */
export function DetailModal({ seminar, isLoggedIn, onClose }) {
  const endedChip = !isLoggedIn
    ? STATUS_BADGE.ENDED
    : seminar.attendedAt
      ? ENDED_CHIP.attended
      : ENDED_CHIP.absent;
  const badge = seminar.status === 'ENDED' ? endedChip : STATUS_BADGE[seminar.status];

  return (
    <ModalShell title={seminar.title} onClose={onClose} maxWidth={560} align="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {seminar.topic && <TopicChip>{seminar.topic}</TopicChip>}
        <Tag tone={badge.tone} size="sm">{badge.label}</Tag>
      </div>

      <div style={{ marginTop: 18 }}>
        <Meta label="일시">{`${seminar.month} ${seminar.day}일 (${seminar.weekday}) ${seminar.time}`}</Meta>
        <Meta label="발표">{seminar.speaker}</Meta>
        <Meta label="장소">{seminar.place}</Meta>
        <Meta label="진행 방식">{seminar.mode}</Meta>
      </div>

      {seminar.description && (
        <Section title={DETAIL.descriptionTitle}>
          <p style={{ ...NOTE, color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{seminar.description}</p>
        </Section>
      )}

      {seminar.attendedAt && (
        <Section title={DETAIL.myAttendanceTitle}>
          <p style={NOTE}>{DETAIL.myAttendance(seminar.attendedAt)}</p>
        </Section>
      )}

      <Section title={DETAIL.attendeesTitle}>
        <Attendees seminarId={seminar.id} isLoggedIn={isLoggedIn} />
      </Section>

      <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
        {seminar.materialUrl && (
          <a
            href={seminar.materialUrl}
            target="_blank"
            rel="noreferrer"
            className="jr-mat"
            style={{ marginRight: 'auto', fontSize: 'var(--fs-sm)' }}
          >
            {DETAIL.material} <span aria-hidden="true">→</span>
          </a>
        )}
        <Button variant="ghost" onClick={onClose}>{DETAIL.close}</Button>
      </div>
    </ModalShell>
  );
}
