import React, { useState } from 'react';
import { Button } from '@/design-system';
import { useAdminStore } from '../../admin.store';
import { useSchedulesAdmin, useCreateSchedule, useLockSchedule, useUnlockSchedule, useForceUnassignSlot } from '../../admin.queries';
import { ScheduleAdminCard } from './ScheduleAdminCard';
import { CreateScheduleModal } from './CreateScheduleModal';

const CREATE_DEFAULTS = { startsAt: '', place: '', mode: '', capacity: 3 };

/**
 * 일정 관리 — 슬롯별 개별 액션(해제)이 필요해 TableView가 아니라 카드형 커스텀 뷰로
 * 만든다. 승인 대기(SCHEMAS.seminarApprovals)와 달리 배치저장 모델을 쓰지 않고, 각
 * 액션(생성/잠금/해제)이 즉시 서버에 반영된다.
 */
export function ScheduleAdminView() {
  const showToast = useAdminStore((s) => s.showToast);
  const schedulesQ = useSchedulesAdmin();

  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState(CREATE_DEFAULTS);
  const [createErrors, setCreateErrors] = useState({});
  const [unassignTarget, setUnassignTarget] = useState(null); // { scheduleId, index }

  const createM = useCreateSchedule({
    onSuccess: () => {
      setCreateOpen(false);
      setCreateValues(CREATE_DEFAULTS);
      showToast('일정이 생성되었습니다.');
    },
    onError: () => showToast('일정 생성 중 오류가 발생했습니다.'),
  });
  const lockM = useLockSchedule({
    onSuccess: () => showToast('일정을 잠갔습니다.'),
    onError: () => showToast('잠금 처리 중 오류가 발생했습니다.'),
  });
  const unlockM = useUnlockSchedule({
    onSuccess: () => showToast('일정 잠금을 해제했습니다.'),
    onError: () => showToast('잠금 해제 중 오류가 발생했습니다.'),
  });
  const unassignM = useForceUnassignSlot({
    onSuccess: () => { setUnassignTarget(null); showToast('슬롯을 해제했습니다.'); },
    onError: (err) => {
      setUnassignTarget(null);
      showToast(err.code === 'CONFLICT' ? '세미나가 있는 슬롯은 먼저 반려해야 해제할 수 있습니다.' : '슬롯 해제 중 오류가 발생했습니다.');
    },
  });

  const openCreate = () => { setCreateValues(CREATE_DEFAULTS); setCreateErrors({}); setCreateOpen(true); };
  const setCreateField = (key) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setCreateValues((s) => ({ ...s, [key]: v }));
    setCreateErrors((s) => ({ ...s, [key]: undefined }));
  };
  const submitCreate = () => {
    if (!createValues.startsAt) { setCreateErrors({ startsAt: '일시를 선택해 주세요.' }); return; }
    createM.mutate({
      startsAt: new Date(createValues.startsAt).toISOString(),
      place: createValues.place || null,
      mode: createValues.mode || null,
      capacity: Number(createValues.capacity) || 3,
    });
  };

  const onForceUnassign = (scheduleId, index) => {
    setUnassignTarget({ scheduleId, index });
    unassignM.mutate({ scheduleId, index });
  };

  const schedules = schedulesQ.data ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>SEMINAR</p>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1.1, color: 'var(--text-strong)' }}>세미나 일정</h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>일정을 만들고, 자기등록 마감 후 잠근 뒤 슬롯을 관리하세요.</p>
        </div>
        <Button onClick={openCreate}>일정 만들기</Button>
      </div>

      {schedulesQ.isLoading ? (
        <p style={{ marginTop: 40, color: 'var(--text-muted)' }}>불러오는 중…</p>
      ) : schedules.length === 0 ? (
        <p style={{ marginTop: 40, color: 'var(--text-muted)' }}>등록된 일정이 없습니다.</p>
      ) : (
        <div style={{ marginTop: 28, display: 'grid', gap: 16 }}>
          {schedules.map((s) => (
            <ScheduleAdminCard
              key={s.id}
              schedule={s}
              onLock={(id) => lockM.mutate(id)}
              onUnlock={(id) => unlockM.mutate(id)}
              onForceUnassign={onForceUnassign}
              locking={lockM.isPending && lockM.variables === s.id}
              unlocking={unlockM.isPending && unlockM.variables === s.id}
              unassigningIndex={unassignTarget?.scheduleId === s.id ? unassignTarget.index : null}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateScheduleModal
          values={createValues}
          errors={createErrors}
          onChange={setCreateField}
          onClose={() => setCreateOpen(false)}
          onSubmit={submitCreate}
          pending={createM.isPending}
        />
      )}
    </div>
  );
}
