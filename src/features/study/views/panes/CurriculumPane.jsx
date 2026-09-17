import React, { useState } from 'react';
import { Button } from '@/design-system';
import {
  useAttendanceBoard, useStudyDetail, useAddWeek, useEditWeek, useDeleteWeek,
} from '../../study.queries';
import { Note } from './common';
import { inputStyle, rowStyle } from './styles';

/**
 * 커리큘럼 주차를 고치고, 늘리고, 줄인다.
 *
 * 주차를 두 곳에서 읽는다. 출석 격자만이 `takenAt` 과 `editable` 을 주고 — 출석이
 * 기록된 주차를 지우면 그 기록이 딸려 사라지므로 지울 수 있는지는 출석이 판정한다 —
 * 상세만이 주차의 `content` 를 준다.
 *
 * 둘을 합치는 이유는 수정이 PUT 이기 때문이다. 제목만 보내면 서버가 content 를
 * null 로 덮어써, 제목을 고쳤을 뿐인데 그 주의 내용이 사라진다. 지금 값을 알아야
 * 그대로 돌려보낼 수 있다.
 */
export function CurriculumPane({ study, onToast }) {
  const q = useAttendanceBoard(study.id);
  const detailQ = useStudyDetail(study.id);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(null);

  const addM = useAddWeek(study.id, { onSuccess: () => { setTitle(''); onToast('주차를 추가했습니다.'); } });
  const editM = useEditWeek(study.id, { onSuccess: () => { setEditing(null); onToast('주차를 수정했습니다.'); } });
  const delM = useDeleteWeek(study.id, { onSuccess: () => onToast('주차를 삭제했습니다.') });

  if (q.isLoading) return <Note>불러오는 중…</Note>;
  const weeks = q.data?.weeks ?? [];
  const last = weeks[weeks.length - 1];

  // 상세가 아직 안 왔으면 content 를 모른다 — 그 상태로 수정을 열면 내용을 지운다.
  const detail = detailQ.data;
  const contentOf = (weekNo) =>
    (detail?.weeks ?? []).find((w) => w.weekNo === weekNo)?.content ?? '';

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'grid', gap: 10 }}>
        {weeks.map((w) => {
          const isLast = last && w.weekNo === last.weekNo;
          const blocked = !!w.takenAt && !w.editable;

          if (editing === w.weekNo) {
            return (
              <WeekEditor
                key={w.weekNo}
                weekNo={w.weekNo}
                initialTitle={w.title}
                initialContent={contentOf(w.weekNo)}
                pending={editM.isPending}
                onCancel={() => setEditing(null)}
                onSave={(next) => editM.mutate({ studyId: study.id, weekNo: w.weekNo, ...next })}
              />
            );
          }

          return (
            <div key={w.weekNo} style={rowStyle}>
              <span style={{ minWidth: 0 }}>
                <strong style={{ color: 'var(--text-strong)' }}>{w.weekNo}주차</strong>
                <span style={{ marginLeft: 10 }}>{w.title}</span>
              </span>
              <span style={{ display: 'flex', gap: 8, flex: 'none' }}>
                <Button
                  size="sm" variant="secondary"
                  disabled={!detail}
                  title={detail ? undefined : '주차 내용을 불러오는 중입니다'}
                  onClick={() => setEditing(w.weekNo)}
                >
                  수정
                </Button>
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
              </span>
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
      <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
        제목과 내용은 언제든 고칩니다. 주차 자체는 맨 뒤에서만 늘리고 줄입니다 —
        한 주 쉬면 뒤에 한 주를 더하고, 일찍 접으면 뒤에서 자릅니다.
      </p>
    </div>
  );
}

/**
 * 한 주차를 고치는 줄. 편집 값을 부모가 아니라 여기서 들고 있는 이유는, 열릴 때
 * 초기값을 props 로 받아 한 번에 세우기 위해서다 — 부모에 두면 빈 칸이 먼저
 * 그려졌다가 값이 덮어쓰는 순간이 생긴다.
 */
function WeekEditor({ weekNo, initialTitle, initialContent, pending, onSave, onCancel }) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [content, setContent] = useState(initialContent ?? '');

  return (
    <div style={{ ...rowStyle, display: 'grid', gap: 10 }}>
      <strong style={{ color: 'var(--text-strong)' }}>{weekNo}주차</strong>
      <input
        id={`week-title-${weekNo}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="주차 제목"
        style={{ ...inputStyle, flex: 'none' }}
      />
      <textarea
        id={`week-content-${weekNo}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용 (선택)"
        rows={3}
        style={{ ...inputStyle, flex: 'none', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="secondary" onClick={onCancel}>취소</Button>
        <Button
          size="sm"
          disabled={!title.trim() || pending}
          // 빈 내용은 '' 가 아니라 null 로 보낸다 — 계약이 '없음'을 그렇게 적는다.
          onClick={() => onSave({ title: title.trim(), content: content.trim() || null })}
        >
          저장
        </Button>
      </div>
    </div>
  );
}
