import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/auth/auth.store';
import { can } from '@/shared/auth/roles';
import { Pill } from '@/features/study/views/parts';
import {
  ApplicantsPane, AttendancePane, CurriculumPane, InfoPane,
} from '@/features/study/views/panes';

const OFFICER_NOTE = '임원은 모집이 끝난 뒤에도 고칠 수 있습니다. 종료된 스터디는 '
  + '고칠 수 없습니다 — 끝난 기록을 근거로 한 것이 흔들립니다.';

/**
 * 스터디 상세 — 표에서 못 하는 일을 전부 여기서 합니다.
 *
 * 표는 훑어보는 자리라 상태 하나만 바꾸고, 인원·정보·출석처럼 한 스터디 안에서
 * 서로 맞물리는 것은 이 모달이 한자리에서 다룹니다.
 *
 *   인원  — 신청자(승인·반려)와 참여가 확정된 스터디원(삭제)
 *   정보  — 개설 때 적은 여덟 칸과 커리큘럼 주차
 *   출석  — 주차별 출석. 임원에게는 24시간 편집 창이 열려 있습니다.
 *
 * 패널은 스터디장의 '관리하기' 모달과 같은 것을 씁니다
 * (features/study/views/panes). 두 화면이 같은 엔드포인트를 부르므로 화면도 한
 * 벌입니다 — 갈라 두면 한쪽만 고쳐지는 날이 옵니다.
 *
 * 탭이 권한으로 갈리는 이유: 학술부원은 STUDY_APPLICANT_MANAGE 만 있어 신청은
 * 처리하지만 정보·출석은 서버가 403 으로 막습니다. 누를 수 없는 것은 보이지 않는
 * 편이 낫습니다.
 */
export function StudyDetailModal({ row, onClose, onDone }) {
  const user = useAuthStore((s) => s.user);
  const mayEdit = can(user, 'STUDY_EDIT');
  const [tab, setTab] = React.useState('applicants');
  const qc = useQueryClient();

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 패널은 study.queries 의 키만 무효화한다 — 표는 adminKeys 로 따로 들고 있어서,
  // 정원이나 인원을 여기서 고치면 뒤에 깔린 표가 옛 값을 계속 보인다.
  const report = React.useCallback((message) => {
    qc.invalidateQueries({ queryKey: ['admin', 'list', 'studies'] });
    onDone(message);
  }, [qc, onDone]);

  // 패널은 스터디의 id 만 본다. 상태 판정도 권한 판정도 서버가 한다.
  const study = React.useMemo(() => ({ id: row.id, title: row.title }), [row.id, row.title]);

  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 24px', overflow: 'auto' }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 720, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 'var(--w-bold)', letterSpacing: '0.18em', color: 'var(--brand)' }}>STUDY</p>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-strong)' }}>{row.title}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              {row.leader} · {row.status}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
          <Pill active={tab === 'applicants'} onClick={() => setTab('applicants')}>신청</Pill>
          {mayEdit && <Pill active={tab === 'info'} onClick={() => setTab('info')}>정보</Pill>}
          {mayEdit && <Pill active={tab === 'attendance'} onClick={() => setTab('attendance')}>출석</Pill>}
        </div>

        {tab === 'applicants' && <ApplicantsPane study={study} onToast={report} />}

        {mayEdit && tab === 'info' && (
          <>
            <InfoPane study={study} onToast={report} note={OFFICER_NOTE} />
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-soft, var(--border))' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
                커리큘럼
              </h4>
              <CurriculumPane study={study} onToast={report} />
            </div>
          </>
        )}

        {mayEdit && tab === 'attendance' && <AttendancePane study={study} onToast={report} />}

        {!mayEdit && (
          <p style={{ margin: '22px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
            정보와 출석은 학술부장 이상이 고칩니다.
          </p>
        )}
      </div>
    </div>
  );
}
