import React from 'react';
import { departmentLabel, titleLabel } from '@/shared/member/enums';
import { MESSAGES, TOAST } from '../../admin.data';
import { departmentOptions, isHandover, titleOptions } from '../../exec.roles';
import { useAssignableMembers, useAssignExec } from '../../admin.queries';
import { PickerModal, PickerHeader, MemberPicker, PickerFooter } from './PickerModal';

/**
 * 임원 지정 모달 (2단계).
 *   1) 지정할 수 있는 회원 목록 — 현직 임기가 없고 졸업생도 아닌 회원. 검색으로 좁힙니다.
 *   2) 부서·직책 선택 — 로그인한 임원의 권한(grants) 안에서만 고를 수 있고,
 *      부서마다 허용되는 직책이 정해져 있습니다(백엔드 MemberTitle.allowedIn 과 같은 규칙).
 *
 * @param grants 로그인 임원이 줄 수 있는 { 부서키: [직책키] } (exec.roles.grantsOf)
 * @param me     로그인 임원의 { id, department, title } — 회장 인계 판정에 씁니다.
 */
export function ExecAssignModal({ grants, me, onClose, onDone }) {
  const [picked, setPicked] = React.useState(null);
  const candidates = useAssignableMembers();

  return (
    <PickerModal onClose={onClose}>
      {picked ? (
        <AssignStep member={picked} grants={grants} me={me} onBack={() => setPicked(null)} onClose={onClose} onDone={onDone} />
      ) : (
        <>
          <PickerHeader eyebrow="ASSIGN" title="임원 지정" desc="임기가 없는 회원 중에서 고르세요." onClose={onClose} />
          <MemberPicker query={candidates} onPick={setPicked} emptyMessage={MESSAGES.noAssignable} />
        </>
      )}
    </PickerModal>
  );
}

/* ── 2단계: 부서·직책 정하기 ────────────────────────────────────────── */

function AssignStep({ member, grants, me, onBack, onClose, onDone }) {
  const departments = departmentOptions(grants);
  const [department, setDepartment] = React.useState(departments[0] || '');
  const titles = titleOptions(grants, department);
  const [title, setTitle] = React.useState(titles[0] || '');

  // 부서를 바꾸면 이전 직책이 그 부서에서 허용되지 않을 수 있다 — 함께 맞춰 준다.
  const pickDepartment = (next) => {
    setDepartment(next);
    const allowed = titleOptions(grants, next);
    if (!allowed.includes(title)) setTitle(allowed[0] || '');
  };

  const handover = isHandover(me, title);
  const assign = useAssignExec({
    onSuccess: () => { onDone(TOAST.assigned(member.name, titleLabel(title, department))); onClose(); },
  });

  const submit = () => {
    if (!department || !title || assign.isPending) return;
    assign.mutate({
      member,
      department,
      title,
      // 회장을 넘기면 넘기는 쪽 임기도 함께 끝난다.
      handoverFrom: handover ? me.id : null,
    });
  };

  return (
    <>
      <PickerHeader eyebrow="ASSIGN" title="부서·직책 지정" desc={`${member.name} · ${member.gen} · ${member.studentId}`} onClose={onClose} />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 20 }}>
        <Row label="부서">
          <Select value={department} onChange={pickDepartment} options={departments} render={departmentLabel} />
        </Row>
        <Row label="직책">
          <Select value={title} onChange={setTitle} options={titles} render={(t) => titleLabel(t, department)} />
        </Row>

        {handover && (
          <p style={{ margin: '18px 0 0', padding: '12px 14px', fontSize: 'var(--fs-sm)', lineHeight: 1.6, color: 'var(--red-600)', background: 'var(--brand-tint)', border: '1px solid var(--red-100)', borderRadius: 8 }}>
            {MESSAGES.handoverPresident}
          </p>
        )}
        {assign.error && (
          <p style={{ margin: '18px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--red-600)' }}>{assign.error.message}</p>
        )}
      </div>

      <PickerFooter
        onBack={onBack}
        onSubmit={submit}
        submitLabel={handover ? '회장 넘기기' : '지정'}
        disabled={!title}
        busy={assign.isPending}
      />
    </>
  );
}

/* ── 조각 ────────────────────────────────────────────────────────────── */

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-faint)' }}>{label}</span>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, render }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-raised)', border: '1.5px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer', outline: 'none' }}
    >
      {options.map((o) => <option key={o} value={o}>{render(o)}</option>)}
    </select>
  );
}

export default ExecAssignModal;
