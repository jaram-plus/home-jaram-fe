import React from 'react';
import { Tag } from '@/design-system';
import { ModalShell } from './ModalShell';
import { useMyAttendance } from '../study.queries';
import { ATTENDANCE_LABEL } from '../study.data';

const TONE = { PRESENT: 'seal', ABSENT: 'neutral', NOT_TAKEN: 'outline' };

/**
 * 참여 멤버가 보는 자기 출석. 읽기 전용이다 — 멤버에게는 고칠 것이 없다.
 *
 * 아직 기록되지 않은 주차를 결석으로 쓰지 않는다. 그건 안 일어난 일이지
 * 빠진 게 아니고, 출석률의 분모도 같은 이유로 기록된 주차 수다.
 */
export function MyAttendanceModal({ study, onClose }) {
  const q = useMyAttendance(study.id);

  return (
    <ModalShell title={study.title} lead="내 출석 현황" onClose={onClose} maxWidth={520}>
      {q.isLoading && <Note>불러오는 중…</Note>}
      {q.isError && <Note>출석을 불러오지 못했습니다.</Note>}

      {q.data && (
        <>
          <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-strong)' }}>
            출석 <strong>{q.data.attended}</strong> / 기록된 {q.data.taken}주차
          </p>

          <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
            {q.data.weeks.map((w) => (
              <div
                key={w.weekNo}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  padding: '13px 18px',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
                }}
              >
                <span>
                  <strong style={{ color: 'var(--text-strong)' }}>{w.weekNo}주차</strong>
                  <span style={{ marginLeft: 10 }}>{w.title}</span>
                </span>
                <Tag tone={TONE[w.state]} size="sm" style={{ flex: 'none' }}>
                  {ATTENDANCE_LABEL[w.state]}
                </Tag>
              </div>
            ))}
          </div>
        </>
      )}
    </ModalShell>
  );
}

function Note({ children }) {
  return (
    <p style={{ margin: '20px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}
