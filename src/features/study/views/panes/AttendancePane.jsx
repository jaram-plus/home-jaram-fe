import React, { useMemo, useState } from 'react';
import { Button, Tag } from '@/design-system';
import { Pill } from '../parts';
import { useAttendanceBoard, useSaveAttendance } from '../../study.queries';
import { Note } from './common';
import { rowStyle } from './styles';

/** 가장 빠른 빈 주차 — 아직 안 찍은 첫 주차. 없으면 마지막 주차. */
function firstUntaken(weeks) {
  const open = weeks.find((w) => !w.takenAt);
  return (open ?? weeks[weeks.length - 1])?.weekNo ?? 1;
}

/** 편집 창이 언제 닫히는지 사람이 읽는 말로. */
function remaining(takenAt) {
  const closesAt = new Date(takenAt).getTime() + 24 * 3600 * 1000;
  const left = closesAt - Date.now();
  if (left <= 0) return null;
  const hours = Math.floor(left / 3600000);
  return hours >= 1 ? `${hours}시간 남음` : `${Math.max(1, Math.floor(left / 60000))}분 남음`;
}

/**
 * 주차를 고르고 그 주의 출석을 통째로 저장한다.
 *
 * 편집 창(첫 저장으로부터 24시간)의 판정은 서버가 한다 — 응답의 `editable` 이 그
 * 결과다. 임원(STUDY_EDIT)에게는 서버가 언제나 true 를 주므로 관리자 콘솔에서는
 * 기간이 지난 주차도 그대로 열린다. 화면이 시간을 따로 계산해 잠그면 서버와 판정이
 * 두 벌이 되고, 임원 쪽에서만 어긋난다.
 */
export function AttendancePane({ study, onToast }) {
  const q = useAttendanceBoard(study.id);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(null);

  const saveM = useSaveAttendance(study.id, {
    onSuccess: () => { setChecked(null); onToast('출석을 저장했습니다.'); },
  });

  // 메모하지 않으면 매 렌더 새 배열이라 아래 useMemo 가 매번 다시 돈다.
  const weeks = useMemo(() => q.data?.weeks ?? [], [q.data]);
  const members = useMemo(() => q.data?.members ?? [], [q.data]);
  const weekNo = picked ?? (weeks.length ? firstUntaken(weeks) : null);
  const week = weeks.find((w) => w.weekNo === weekNo);

  const initial = useMemo(
    () => members.filter((m) => m.present.includes(weekNo)).map((m) => m.memberId),
    [members, weekNo],
  );
  const present = checked ?? initial;

  if (q.isLoading) return <Note>불러오는 중…</Note>;
  if (q.isError) return <Note>출석을 불러오지 못했습니다.</Note>;
  if (!week) return <Note>커리큘럼 주차가 없습니다. &apos;정보&apos; 탭에서 먼저 추가하세요.</Note>;

  const left = week.takenAt ? remaining(week.takenAt) : null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {weeks.map((w) => (
          <Pill key={w.weekNo} active={w.weekNo === weekNo}
            onClick={() => { setPicked(w.weekNo); setChecked(null); }}>
            {w.weekNo}주 {w.takenAt ? '●' : '○'}
          </Pill>
        ))}
      </div>

      <p style={{ margin: '16px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        {week.weekNo}주차 · {week.title}
        {week.takenAt && week.editable && left && ` · 수정 가능 ${left}`}
        {week.takenAt && week.editable && !left && ' · 수정할 수 있습니다'}
        {week.takenAt && !week.editable && ' · 수정 기간이 지났습니다. 임원에게 요청하세요.'}
        {!week.takenAt && ' · 아직 기록하지 않았습니다'}
      </p>

      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        {members.map((m) => (
          <label key={m.memberId} style={{ ...rowStyle, cursor: week.editable ? 'pointer' : 'default' }}>
            <span>
              <strong style={{ color: 'var(--text-strong)' }}>{m.name}</strong>
              <span style={{ marginLeft: 8, color: 'var(--text-faint)' }}>{m.gen}기</span>
              {m.leader && <Tag tone="brand" size="sm" style={{ marginLeft: 8 }}>스터디장</Tag>}
            </span>
            <input
              type="checkbox"
              id={`att-${weekNo}-${m.memberId}`}
              disabled={!week.editable}
              checked={present.includes(m.memberId)}
              onChange={(e) => setChecked(
                e.target.checked
                  ? [...present, m.memberId]
                  : present.filter((id) => id !== m.memberId))}
            />
          </label>
        ))}
      </div>

      {week.editable && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Button
            disabled={saveM.isPending}
            onClick={() => saveM.mutate({ studyId: study.id, weekNo, present })}
          >
            저장
          </Button>
        </div>
      )}
    </div>
  );
}
