import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag } from '@/design-system';
import { ModalShell } from './ModalShell';
import { FieldChip, DefList } from './parts';
import { useStudyDetail } from '../study.queries';
import { STATUS_BADGE } from '../study.data';

/**
 * 스터디 상세 — 읽기 전용이다. 고치는 일은 '내 스터디' > '관리하기'가 맡는다.
 *
 * 화면이 두 겹인 이유는 서버가 두 겹이기 때문이다. 목록(GET /api/studies)은
 * permitAll 이라 제목·스터디장·카테고리·일시·진행 방식·인원·소개까지 누구나 받고,
 * 상세(GET /api/studies/{id})는 참여 인원 명단이 붙어서 로그인을 요구한다
 * (SecurityConfig 가 목록만 열어 두었다).
 *
 * 그래서 비로그인에게 모달 전체를 잠그지 않는다 — 이미 공개된 것까지 가리면
 * 목록 카드보다 덜 보여주는 상세가 된다. 로그인해야 얻는 넷(장소·연락처·커리큘럼·
 * 명단)만 흐리고 그 위에 안내를 얹는다.
 */

/** 모달 안의 작은 묶음 머리. CreateModal 의 Section 과 같은 위계를 쓴다. */
function Group({ title, children }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h4 style={{
        margin: '0 0 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--w-semibold)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: 'var(--brand)',
      }}>
        {title}
      </h4>
      {children}
    </section>
  );
}

function Note({ children }) {
  return (
    <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

/** 스터디장은 이름만 올 때도 있다 — 기수가 null 이면 괄호를 달지 않는다. */
function leaderLine(study) {
  return study.leaderGen ? `${study.leader} (${study.leaderGen}기)` : study.leader;
}

/** 명단 한 줄 — 서버가 마스킹해 보낸 값을 그대로 적는다. */
function RosterRow({ entry }) {
  return (
    <li style={{
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
    }}>
      <span style={{ color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>{entry.studentId}</span>
      {entry.gen != null && <span style={{ color: 'var(--text-muted)' }}>{entry.gen}기</span>}
      <strong style={{ marginLeft: 'auto', color: 'var(--text-strong)', fontWeight: 'var(--w-medium)' }}>
        {entry.name}
      </strong>
    </li>
  );
}

/**
 * 로그인해야 보이는 구역의 자리. 가짜 내용을 흐려 두면 읽으려 애쓰게 되므로,
 * 지어낸 글자 대신 빈 막대를 깔고 그 위에 안내를 얹는다.
 */
function SignInGate() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'relative', marginTop: 24, minHeight: 150 }}>
      <div aria-hidden="true" style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', display: 'grid', gap: 12 }}>
        {[72, 92, 60, 84, 68, 88].map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ height: 11, width: 56, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)' }} />
            <div style={{ height: 11, width: `${w}%`, borderRadius: 'var(--radius-pill)', background: 'var(--surface-tonal)' }} />
          </div>
        ))}
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', fontWeight: 'var(--w-semibold)', color: 'var(--text-strong)' }}>
          로그인이 필요합니다
        </p>
        <Button size="sm" onClick={() => navigate('/login?redirect=/study')}>로그인하기</Button>
      </div>
    </div>
  );
}

export function StudyDetailModal({ study, authenticated = false, onClose }) {
  const q = useStudyDetail(study.id, authenticated);
  const badge = STATUS_BADGE[study.status];
  const detail = q.data;

  return (
    <ModalShell title={study.title} onClose={onClose} maxWidth={600} align="top">
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
        <Tag tone={badge.tone} size="sm">{badge.label}</Tag>
        {study.fields.map((f) => (
          <FieldChip key={f}>{f}</FieldChip>
        ))}
      </div>

      <DefList
        rows={[
          ['스터디장', leaderLine(study)],
          ['일시', study.schedule || '—'],
          ['진행 방식', study.mode || '—'],
          ['모집 인원', `${study.cur} / ${study.cap}명`],
        ]}
      />

      {study.intro && (
        <Group title="소개">
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-body)', lineHeight: 'var(--lh-normal)', whiteSpace: 'pre-wrap' }}>
            {study.intro}
          </p>
        </Group>
      )}

      {!authenticated && <SignInGate />}

      {authenticated && q.isLoading && <Group title="상세"><Note>불러오는 중…</Note></Group>}
      {authenticated && q.isError && <Group title="상세"><Note>상세 정보를 불러오지 못했습니다.</Note></Group>}

      {authenticated && detail && (
        <>
          <Group title="모이는 곳">
            <DefList
              rows={[
                ['장소', detail.place || '—'],
                ['문의', detail.contact || '—'],
              ]}
            />
          </Group>

          <Group title={`커리큘럼 · 총 ${detail.weeks.length}주`}>
            {detail.weeks.length === 0 ? (
              <Note>등록된 주차가 없습니다.</Note>
            ) : (
              <ul style={{ margin: 0, padding: 0, display: 'grid', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {detail.weeks.map((w) => (
                  <li key={w.weekNo} style={{
                    listStyle: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '11px 14px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--fs-sm)',
                  }}>
                    <strong style={{ color: 'var(--text-strong)' }}>{w.weekNo}주차</strong>
                    <span style={{ marginLeft: 10, color: 'var(--text-body)' }}>{w.title}</span>
                    {w.content && (
                      <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', lineHeight: 'var(--lh-normal)', whiteSpace: 'pre-wrap' }}>
                        {w.content}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Group>

          <Group title={`참여 인원 · ${detail.roster.length}명`}>
            {detail.roster.length === 0 ? (
              <Note>아직 확정된 인원이 없습니다.</Note>
            ) : (
              <ul style={{ margin: 0, padding: 0, display: 'grid', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                {detail.roster.map((e) => (
                  <RosterRow key={e.studentId + e.name} entry={e} />
                ))}
              </ul>
            )}
          </Group>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}>
        <Button variant="secondary" onClick={onClose}>닫기</Button>
      </div>
    </ModalShell>
  );
}
