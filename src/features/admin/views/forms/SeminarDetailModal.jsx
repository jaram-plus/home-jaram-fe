import React from 'react';
import { Button, Input, Tag } from '@/design-system';
import { MESSAGES, TOAST } from '../../admin.data';
import { validateRow } from '../../admin.validation';
import {
  useSaveSeminarDetail, useGenerateAttendanceCode, useCloseAttendance,
  useSeminarAttendees, useAddSeminarAttendee, useRemoveSeminarAttendee, useAttendanceCandidates,
} from '../../admin.queries';
import { PickerModal, PickerHeader, MemberPicker, PickerNote } from './PickerModal';

const TABS = [
  { key: 'info', label: '정보' },
  { key: 'attend', label: '출석' },
];

/**
 * 세미나 상세 모달 — 표에서 '상세'를 누르면 열립니다. 표는 훑어보는 자리라 다섯 칸만
 * 보여주고, 고치는 일은 전부 여기서 합니다.
 *
 *   정보 : 세미나명·주제·상세 설명·발표자료 링크. 발표자·일시·장소는 읽기 전용입니다 —
 *          슬롯에서 제출된 세미나는 그 값들이 일정(Schedule)에 매여 있습니다.
 *   출석 : 출석 코드 발급·출석 마감·참석자 명단. 표의 모아 저장과 달리 누르는 즉시
 *          서버에 반영됩니다 — 그 자리에서 효력이 생겨야 하는 일들입니다.
 *
 * @param row    표의 행(서버 응답 그대로 + 표시용 일시). 저장에 version 을 씁니다.
 * @param onDone 토스트 문구를 올릴 콜백
 */
export function SeminarDetailModal({ row, onClose, onDone }) {
  const [tab, setTab] = React.useState('info');

  return (
    <PickerModal onClose={onClose}>
      <PickerHeader
        eyebrow="SEMINAR"
        title={row.title}
        desc={[row.startsAt, row.place].filter(Boolean).join(' · ')}
        onClose={onClose}
      />

      <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--border)', marginTop: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{ padding: '9px 2px', marginBottom: -1, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: tab === t.key ? 'var(--brand)' : 'var(--text-muted)', borderBottom: tab === t.key ? '2px solid var(--brand)' : '2px solid transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info'
        ? <InfoPane row={row} onClose={onClose} onDone={onDone} />
        : <AttendPane row={row} onDone={onDone} />}
    </PickerModal>
  );
}

/* ── 정보 ────────────────────────────────────────────────────────────── */

function InfoPane({ row, onClose, onDone }) {
  const [values, setValues] = React.useState({
    title: row.title || '',
    topic: row.topic || '',
    description: row.description || '',
    materialUrl: row.materialUrl || '',
  });
  const [errors, setErrors] = React.useState({});

  const field = (key) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((s) => ({ ...s, [key]: undefined }));
  };

  const save = useSaveSeminarDetail({
    onSuccess: () => { onDone(TOAST.seminarSaved); onClose(); },
    onError: (err) => setErrors({ title: err.message || MESSAGES.seminarSaveFail }),
  });

  const submit = () => {
    const errs = validateRow('seminars', values);
    if (errs) { setErrors(errs); return; }
    save.mutate({ id: row.id, version: row.version, fields: values });
  };

  return (
    <>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 18, display: 'grid', gap: 14, alignContent: 'start' }}>
        <Input label="세미나명" value={values.title} onChange={field('title')} error={errors.title} />
        <Input label="주제" placeholder="Backend" value={values.topic} onChange={field('topic')} error={errors.topic} />
        <Input as="textarea" label="상세 설명" value={values.description} onChange={field('description')} error={errors.description} />
        <Input label="발표 자료 링크" placeholder="슬라이드·문서 URL" value={values.materialUrl} onChange={field('materialUrl')} error={errors.materialUrl} />

        {/* 발표자·일시·장소는 일정(Schedule)과 슬롯 주인이 정하는 값이라 여기서 고치지 않는다. */}
        <div style={{ marginTop: 4 }}>
          <ReadOnly label="발표자">{row.speaker}</ReadOnly>
          <ReadOnly label="일시">{row.startsAt}</ReadOnly>
          <ReadOnly label="장소">{row.place}</ReadOnly>
        </div>
      </div>

      <Footer>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={save.isPending}>닫기</Button>
        <Button size="sm" onClick={submit} disabled={save.isPending}>{save.isPending ? '저장하는 중…' : '저장'}</Button>
      </Footer>
    </>
  );
}

/* ── 출석 ────────────────────────────────────────────────────────────── */

function AttendPane({ row, onDone }) {
  const [adding, setAdding] = React.useState(false);
  const roster = useSeminarAttendees(row.id);
  const list = roster.data?.list ?? [];

  const code = useGenerateAttendanceCode({
    onSuccess: () => onDone(TOAST.codeIssued),
    onError: () => onDone(MESSAGES.attendanceFail),
  });
  const close = useCloseAttendance({
    onSuccess: () => onDone(TOAST.attendanceClosed),
    onError: () => onDone(MESSAGES.attendanceFail),
  });
  const add = useAddSeminarAttendee({
    onSuccess: (_, vars) => { setAdding(false); onDone(TOAST.attendeeAdded(vars.name)); },
    onError: () => onDone(MESSAGES.attendanceFail),
  });
  const remove = useRemoveSeminarAttendee({
    onSuccess: (_, vars) => onDone(TOAST.attendeeRemoved(vars.name)),
    onError: () => onDone(MESSAGES.attendanceFail),
  });

  // 발급 직후 표가 다시 오기 전까지는 방금 받은 코드를 보여준다.
  const attendanceCode = code.data?.attendanceCode ?? row.attendanceCode;
  const closed = !!(close.data || row.attendanceClosedAt);

  if (adding) {
    return <AddAttendee attending={list} busy={add.isPending} onPick={(m) => add.mutate({ id: row.id, memberId: m.id, name: m.name })} onBack={() => setAdding(false)} />;
  }

  return (
    <>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 18 }}>
        {/* 코드가 이 탭의 주인공이라 판을 따로 세워 크게 앉힌다. 미발급일 때도 줄표로
            같은 자리를 잡아 두어, 발급하는 순간 아래 명단이 밀려 내려가지 않는다. */}
        <section style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-raised)', padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>ATTENDANCE CODE</p>
            <Button variant={attendanceCode ? 'secondary' : 'primary'} size="sm" onClick={() => code.mutate(row.id)} disabled={code.isPending}>
              {code.isPending ? '발급하는 중…' : attendanceCode ? '재발급' : '코드 생성'}
            </Button>
          </div>
          {/* 한 번 눌러 코드 전체가 잡히게 한다 — 불러 주거나 옮겨 적는 자리라서.
              마감한 뒤의 코드는 효력이 없으므로 먹색을 한 단계 물린다. */}
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-mono)', fontSize: 26, lineHeight: 1.25, letterSpacing: '0.2em', color: !attendanceCode ? 'var(--text-faint)' : closed ? 'var(--text-muted)' : 'var(--text-strong)', userSelect: attendanceCode ? 'all' : 'none' }}>
            {attendanceCode || '— — — —'}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {!attendanceCode ? MESSAGES.codeNotIssued : closed ? MESSAGES.codeAfterClose : MESSAGES.codeInUse}
          </p>
        </section>

        {/* 마감은 되돌릴 수 없지만 버튼을 빨갛게 세우지는 않는다 — 이 브랜드에서 빨강은
            권하는 색이라 되돌릴 수 없는 일에는 어울리지 않는다. 무게는 빨간 점과 경고
            문구가 지고, 버튼은 다른 보조 동작과 같은 얼굴로 헤어라인 아래 둔다. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {closed ? (
            <>
              <Tag tone="seal">마감됨</Tag>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{MESSAGES.attendanceClosedNote}</span>
            </>
          ) : (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                  {MESSAGES.attendanceOpen}
                </p>
                <p style={{ margin: '5px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{MESSAGES.closeAttendanceWarn}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => close.mutate(row.id)} disabled={close.isPending}>
                {close.isPending ? '마감하는 중…' : '출석 마감'}
              </Button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '20px 0 8px' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.14em', color: 'var(--text-faint)' }}>
            참석자 {list.length > 0 ? `${list.length}명` : ''}
          </p>
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>참석자 추가</Button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {roster.isLoading && <PickerNote>명단을 불러오는 중입니다.</PickerNote>}
          {roster.isError && <PickerNote>명단을 불러오지 못했습니다.</PickerNote>}
          {!roster.isLoading && !roster.isError && list.length === 0 && <PickerNote>{MESSAGES.noAttendee}</PickerNote>}
          {list.map((a) => (
            <div key={a.memberId} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 52px 56px', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-sans)' }}>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{a.name || '탈퇴한 회원'}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{a.sid}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{a.at}</span>
              <button
                type="button"
                onClick={() => remove.mutate({ id: row.id, memberId: a.memberId, name: a.name })}
                disabled={remove.isPending}
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                취소
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** 수기 출석 처리 — 임원 지정 모달과 같은 회원 고르기 화면을 씁니다. */
function AddAttendee({ attending, busy, onPick, onBack }) {
  const candidates = useAttendanceCandidates();
  const already = new Set(attending.map((a) => a.memberId));
  const query = {
    ...candidates,
    data: (candidates.data || []).filter((m) => !already.has(m.id)),
  };

  return (
    <>
      <p style={{ margin: '16px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
        고른 회원이 바로 출석 처리됩니다. 출석 코드를 놓친 회원에게 쓰세요.
      </p>
      <MemberPicker query={query} onPick={busy ? () => {} : onPick} emptyMessage={MESSAGES.noAttendCandidate} />
      <Footer>
        <Button variant="ghost" size="sm" onClick={onBack} disabled={busy}>이전</Button>
      </Footer>
    </>
  );
}

/* ── 조각 ────────────────────────────────────────────────────────────── */

function ReadOnly({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{children || '—'}</span>
    </div>
  );
}

function Footer({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}
