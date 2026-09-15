import React from 'react';
import { Button } from '@/design-system';
import { EmptyState } from './parts';
import { MyStudyCard } from './MyStudyCard';

/**
 * 내가 할 일이 있는 것부터. 대기 신청이 있는 스터디장 카드 → 나머지 스터디장 →
 * 참여 중 → 신청 대기.
 *
 * 주차를 안 찍은 스터디를 위로 올리려면 weeksTaken 이 있어야 하는데 카드가 그 값을
 * 받지 않는다.
 */
function rank(item) {
  if (item.relation === 'LEADER') {
    return item.status === 'RECRUITING' && item.pendingApplicants > 0 ? 0 : 1;
  }
  if (item.relation === 'MEMBER') return 2;
  return 3;   // APPLIED
}

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 18px', fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-title-3)', fontWeight: 'var(--w-bold)', color: 'var(--text-strong)' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * '내 스터디' — 지금 살아 있는 관계(스터디장·참여 중·신청 대기)가 위, 반려된 신청이
 * 아래. 반려는 내 스터디가 아니라 이력이라, 같은 그리드에 섞으면 탭 이름이 거짓이 된다.
 *
 * 종료된 스터디는 toMyStudyItems 가 걸러 여기까지 오지 않는다.
 */
export function MyStudyView({ items = [], onManage, onAttendance, onDelete, onBrowse }) {
  const live = items.filter((i) => i.relation !== 'REJECTED').sort((a, b) => rank(a) - rank(b));
  const past = items.filter((i) => i.relation === 'REJECTED');

  if (live.length === 0 && past.length === 0) {
    return (
      <div className="jr-anim">
        <EmptyState>아직 참여 중인 스터디가 없습니다.</EmptyState>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={onBrowse}>스터디 둘러보기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="jr-anim" style={{ display: 'grid', gap: 40 }}>
      {live.length > 0 && (
        <Section title="내 스터디">
          {live.map((i) => (
            <MyStudyCard key={i.id + i.relation} item={i}
              onManage={onManage} onAttendance={onAttendance} onDelete={onDelete} />
          ))}
        </Section>
      )}
      {past.length > 0 && (
        <Section title="지난 신청">
          {past.map((i) => (
            <MyStudyCard key={i.id + i.relation} item={i}
              onManage={onManage} onAttendance={onAttendance} onDelete={onDelete} />
          ))}
        </Section>
      )}
    </div>
  );
}
