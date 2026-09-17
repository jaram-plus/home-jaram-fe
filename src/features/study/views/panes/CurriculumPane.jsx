import React, { useState } from 'react';
import { Button } from '@/design-system';
import { useAttendanceBoard, useAddWeek, useDeleteWeek } from '../../study.queries';
import { Note } from './common';
import { inputStyle, rowStyle } from './styles';

/**
 * 커리큘럼 주차를 늘리고 줄인다.
 *
 * 주차 목록을 출석 격자에서 읽는 이유는 그 응답만이 `takenAt` 과 `editable` 을 함께
 * 주기 때문이다 — 출석이 기록된 주차를 지우면 그 기록이 딸려 사라지므로, 지울 수
 * 있는지는 출석이 판정한다.
 */
export function CurriculumPane({ study, onToast }) {
  const q = useAttendanceBoard(study.id);
  const [title, setTitle] = useState('');

  const addM = useAddWeek(study.id, { onSuccess: () => { setTitle(''); onToast('주차를 추가했습니다.'); } });
  const delM = useDeleteWeek(study.id, { onSuccess: () => onToast('주차를 삭제했습니다.') });

  if (q.isLoading) return <Note>불러오는 중…</Note>;
  const weeks = q.data?.weeks ?? [];
  const last = weeks[weeks.length - 1];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'grid', gap: 10 }}>
        {weeks.map((w) => {
          const isLast = last && w.weekNo === last.weekNo;
          const blocked = !!w.takenAt && !w.editable;
          return (
            <div key={w.weekNo} style={rowStyle}>
              <span>
                <strong style={{ color: 'var(--text-strong)' }}>{w.weekNo}주차</strong>
                <span style={{ marginLeft: 10 }}>{w.title}</span>
              </span>
              {isLast && weeks.length > 1 && (
                <Button
                  size="sm" variant="secondary"
                  disabled={blocked || delM.isPending}
                  title={blocked ? '출석이 기록된 주차라 삭제 기간이 지났습니다' : undefined}
                  onClick={() => delM.mutate({ studyId: study.id, weekNo: w.weekNo })}
                >
                  삭제
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <input
          id="new-week-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 주차 제목"
          style={inputStyle}
        />
        <Button
          size="sm"
          disabled={!title.trim() || addM.isPending}
          onClick={() => addM.mutate({ studyId: study.id, title, content: null })}
        >
          + 주차 추가
        </Button>
      </div>
      <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
        주차는 맨 뒤에서만 늘리고 줄입니다. 한 주 쉬면 뒤에 한 주를 더하고, 일찍 접으면 뒤에서 자릅니다.
      </p>
    </div>
  );
}
