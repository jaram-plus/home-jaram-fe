import React, { useState, useMemo } from 'react';
import { Button, Input, Tag } from '@/design-system';
import { ModalShell } from './ModalShell';
import { Pill } from './parts';
import { useForm } from '../useForm';
import { toInfoForm, toUpdatePayload, validateInfo, updateErrorMessage } from '../study.data';
import {
  useStudyApplicants, useAttendanceBoard, useSaveAttendance,
  useAddWeek, useDeleteWeek,
  useCloseRecruiting, useFinishStudy,
  useApproveApplicant, useRejectApplicant,
  useStudyDetail, useUpdateStudy,
} from '../study.queries';

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

/* ── 모집 중: 신청 관리 ─────────────────────────────────────────── */

function ApplicantsPane({ study, onToast }) {
  const q = useStudyApplicants(study.id);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const approveM = useApproveApplicant(study.id, {
    onSuccess: (_d, vars) => onToast(`${vars.name} 님을 승인했습니다.`),
  });
  const rejectM = useRejectApplicant(study.id, {
    onSuccess: () => { setRejecting(null); setReason(''); onToast('신청을 반려했습니다.'); },
  });

  if (q.isLoading) return <Note>불러오는 중…</Note>;
  if (q.isError) return <Note>신청 목록을 불러오지 못했습니다.</Note>;

  const { pending = [], approved = [] } = q.data ?? {};

  return (
    <div style={{ display: 'grid', gap: 28, marginTop: 24 }}>
      <div>
        <GroupTitle>대기 중인 신청 {pending.length}건</GroupTitle>
        {pending.length === 0 ? (
          <Note>새 신청이 없습니다.</Note>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {pending.map((a) => (
              <div key={a.applicationId} style={rowStyle}>
                <div>
                  <strong style={{ color: 'var(--text-strong)' }}>{a.name}</strong>
                  <span style={{ marginLeft: 8, color: 'var(--text-faint)' }}>{a.gen}기</span>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-normal)' }}>
                    {a.motive}
                  </p>
                  {rejecting === a.applicationId && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input
                        id={`reject-reason-${a.applicationId}`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="반려 사유"
                        style={inputStyle}
                      />
                      <Button size="sm" onClick={() =>
                        rejectM.mutate({ applicantId: a.applicationId, reason })}>보내기</Button>
                      <Button size="sm" variant="secondary"
                        onClick={() => { setRejecting(null); setReason(''); }}>취소</Button>
                    </div>
                  )}
                </div>
                {rejecting !== a.applicationId && (
                  <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                    <Button size="sm" onClick={() =>
                      approveM.mutate({ applicantId: a.applicationId, name: a.name })}>승인</Button>
                    <Button size="sm" variant="secondary"
                      onClick={() => setRejecting(a.applicationId)}>반려</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <GroupTitle>참여 확정 {approved.length}명</GroupTitle>
        {approved.length === 0 ? (
          <Note>아직 확정된 참여자가 없습니다.</Note>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {approved.map((a) => (
              <Tag key={a.applicationId} tone="outline" size="sm">{a.name} · {a.gen}기</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 진행 중: 출석 ──────────────────────────────────────────────── */

function AttendancePane({ study, onToast }) {
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

/* ── 진행 중: 정보(커리큘럼) ────────────────────────────────────── */

function CurriculumPane({ study, onToast }) {
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

/* ── 껍데기 ──────────────────────────────────────────────────────── */

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
  background: 'var(--surface-card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', padding: '14px 18px',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
};

const inputStyle = {
  flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-strong)', background: 'var(--surface-card)',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
};

function GroupTitle({ children }) {
  return (
    <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
      {children}
    </h4>
  );
}

function Note({ children }) {
  return (
    <p style={{ margin: 0, padding: '18px 2px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

/* ── 모집 중: 정보 수정 ─────────────────────────────────────────── */

/**
 * 개설할 때 적은 여덟 칸을 다시 적는다. 서버도 RECRUITING 에서만 받으므로
 * (PUT /api/studies/{id} → 409 INVALID_STATE) 이 탭은 모집 중에만 선다.
 *
 * 폼을 상세 응답으로 초기화하려고 effect 를 쓰지 않는다. 불러온 뒤에야 이 컴포넌트가
 * 생기게 해서 useForm 의 초기값으로 넘긴다 — 빈 폼이 먼저 떴다가 값이 덮어쓰는
 * 순간이 없어야, 사용자가 그 사이에 친 글자를 잃지 않는다.
 */
function InfoForm({ study, detail, onToast }) {
  const form = useForm(toInfoForm(detail));
  const saveM = useUpdateStudy(study.id, {
    onSuccess: () => onToast('스터디 정보를 수정했습니다.'),
  });

  function submit() {
    const errors = validateInfo(form.values);
    if (Object.keys(errors).length > 0) {
      form.setErrors(errors);
      return;
    }
    saveM.mutate({ studyId: study.id, ...toUpdatePayload(form.values) });
  }

  const error = updateErrorMessage(saveM.error);

  return (
    <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
      <Input label="제목" value={form.values.title} onChange={form.field('title')} error={form.errors.title} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
        <Input label="카테고리" hint="쉼표로 구분합니다." value={form.values.fields}
          onChange={form.field('fields')} error={form.errors.fields} />
        <Input label="희망 인원" inputMode="numeric" value={form.values.capacity}
          onChange={form.field('capacity')} error={form.errors.capacity} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="일시" value={form.values.schedule} onChange={form.field('schedule')} error={form.errors.schedule} />
        <Input label="장소" value={form.values.place} onChange={form.field('place')} error={form.errors.place} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Input label="진행 방식" value={form.values.mode} onChange={form.field('mode')} error={form.errors.mode} />
        <Input label="문의 연락처" value={form.values.contact} onChange={form.field('contact')} error={form.errors.contact} />
      </div>

      <Input as="textarea" label="소개" value={form.values.intro} onChange={form.field('intro')} error={form.errors.intro} />

      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
        모집을 완료하면 더 이상 고칠 수 없습니다. 신청한 사람이 이 내용을 보고 지원했기 때문입니다.
        커리큘럼 주차는 모집 완료 뒤 &apos;정보&apos; 탭에서 늘리고 줄입니다.
      </p>

      {error && (
        <p style={{
          margin: 0, padding: '11px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--brand-tint)', border: '1px solid var(--brand)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)',
          lineHeight: 'var(--lh-normal)',
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={submit} disabled={saveM.isPending}>
          {saveM.isPending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </div>
  );
}

function InfoPane({ study, onToast }) {
  const q = useStudyDetail(study.id);
  if (q.isLoading) return <Note>불러오는 중…</Note>;
  if (q.isError) return <Note>스터디 정보를 불러오지 못했습니다.</Note>;
  return <InfoForm study={study} detail={q.data} onToast={onToast} />;
}

/**
 * 스터디장의 '관리하기'. 스터디 상태가 무엇을 열지 정한다.
 *
 * 모집 중이면 신청/정보 탭과 '모집 완료', 진행 중이면 출석/정보 탭과 '종료'.
 * 같은 '정보'라도 여는 것이 다르다 — 모집 중에는 개설 때 적은 여덟 칸을 고치고,
 * 진행 중에는 커리큘럼 주차를 늘리고 줄인다. 여덟 칸은 모집이 닫히는 순간 잠긴다.
 * 두 버튼 모두 확인을 한 단계 둔다 — 되돌릴 손잡이가 임원에게만 있고(D12),
 * '종료'는 이 스터디를 '내 스터디'에서 사라지게 한다.
 */
export function ManageStudyModal({ study, onClose, onToast }) {
  const recruiting = study.status === 'RECRUITING';
  // 첫 탭은 그 상태에서 제일 할 일이 많은 쪽이다 — 모집 중이면 쌓인 신청, 진행 중이면 출석.
  const [tab, setTab] = useState(recruiting ? 'applicants' : 'attendance');
  const [confirming, setConfirming] = useState(false);

  const closeM = useCloseRecruiting({
    onSuccess: () => { onClose(); onToast('모집을 완료했습니다. 이제 진행 중입니다.'); },
  });
  const finishM = useFinishStudy({
    onSuccess: () => { onClose(); onToast('스터디를 종료했습니다.'); },
  });

  const confirmText = recruiting
    ? '모집을 완료하면 더 이상 신청을 받지 않고 진행 중으로 넘어갑니다. 되돌리려면 임원에게 요청해야 합니다.'
    : '종료하면 이 스터디가 \'내 스터디\'에서 사라집니다. 출석 기록도 더 이상 고칠 수 없습니다.';

  return (
    <ModalShell title={study.title} lead={recruiting ? '신청 관리와 정보 수정' : '출석과 커리큘럼'}
      onClose={onClose} maxWidth={720} align="top">

      <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
        {recruiting ? (
          <>
            <Pill active={tab === 'applicants'} onClick={() => setTab('applicants')}>신청</Pill>
            <Pill active={tab === 'edit'} onClick={() => setTab('edit')}>정보</Pill>
          </>
        ) : (
          <>
            <Pill active={tab === 'attendance'} onClick={() => setTab('attendance')}>출석</Pill>
            <Pill active={tab === 'info'} onClick={() => setTab('info')}>정보</Pill>
          </>
        )}
      </div>

      {recruiting && tab === 'applicants' && <ApplicantsPane study={study} onToast={onToast} />}
      {recruiting && tab === 'edit' && <InfoPane study={study} onToast={onToast} />}
      {!recruiting && tab === 'attendance' && <AttendancePane study={study} onToast={onToast} />}
      {!recruiting && tab === 'info' && <CurriculumPane study={study} onToast={onToast} />}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-soft)' }}>
        {confirming ? (
          <>
            <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)' }}>
              {confirmText}
            </span>
            <Button variant="secondary" onClick={() => setConfirming(false)}>취소</Button>
            <Button
              disabled={closeM.isPending || finishM.isPending}
              onClick={() => (recruiting ? closeM : finishM).mutate({ studyId: study.id })}
            >
              {recruiting ? '모집 완료' : '종료'}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            {recruiting ? '모집 완료' : '종료'}
          </Button>
        )}
      </div>
    </ModalShell>
  );
}
