import React, { useState } from 'react';
import { Button, Input } from '@/design-system';
import { useSettings, useSaveSettings } from '../../admin.queries';
import { useAdminStore } from '../../admin.store';
import { settingsSchema } from '../../admin.validation';
import { TOAST } from '../../admin.data';

/**
 * 설정 — 학기·현재 기수, 신학기 자동 승급, Google Drive 연동. (기획.md §3.7)
 * 저장 시 settingsSchema(Zod)로 검증합니다. 전체 RHF 폼이 필요하면 useZodForm 로 교체하세요.
 */
export function SettingsView() {
  const { data, isLoading } = useSettings();
  const showToast = useAdminStore((s) => s.showToast);
  const save = useSaveSettings({ onSuccess: () => showToast(TOAST.settingsSaved) });

  const [form, setForm] = useState({ semester: '', currentGen: '', autoPromote: true });
  const [drive, setDrive] = useState(true);
  const [err, setErr] = useState('');
  const [seeded, setSeeded] = useState(false);

  // 서버 설정을 편집 폼에 1회만 심는다 (effect 없이 렌더 중 조정 — React 권장 패턴).
  if (data && !seeded) {
    setSeeded(true);
    setForm({ semester: data.semester, currentGen: String(data.currentGen), autoPromote: data.autoPromote });
    setDrive(data.driveConnected);
  }

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const onSave = () => {
    const parsed = settingsSchema.safeParse({ semester: form.semester, currentGen: form.currentGen, autoPromote: form.autoPromote });
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    setErr('');
    save.mutate({ ...parsed.data, driveConnected: drive });
  };

  if (isLoading) return <p style={{ color: 'var(--text-muted)' }}>설정을 불러오는 중…</p>;

  const card = { background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 26, boxShadow: 'var(--shadow-sm)' };
  const cardTitle = { margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' };

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand)' }}>SETTINGS</p>
      <h1 style={{ margin: '0 0 26px', fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1.1, color: 'var(--text-strong)' }}>설정</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
        <div style={card}>
          <p style={cardTitle}>학회 기본 설정</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Input label="현재 학기" value={form.semester} onChange={(e) => set('semester', e.target.value)} />
            <Input label="현재 기수" value={form.currentGen} onChange={(e) => set('currentGen', e.target.value)} />
          </div>
        </div>

        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>신학기 자동 승급</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>새 학기가 시작되면 준회원을 정회원으로 일괄 승급합니다. 수습회원은 대상에서 제외됩니다.</p>
          </div>
          <Toggle on={form.autoPromote} onClick={() => set('autoPromote', !form.autoPromote)} />
        </div>

        <div style={card}>
          <p style={{ ...cardTitle, marginBottom: 14 }}>Google Drive 연동</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {drive ? (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--brand-deep)', background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>연결됨
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>내보내기 폴더: {data?.driveFolder}</span>
                <Button variant="ghost" size="sm" onClick={() => setDrive(false)}>연결 해제</Button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>표를 스프레드시트로 내보내려면 Google Drive를 연결하세요.</span>
                <Button variant="outline" size="sm" onClick={() => setDrive(true)}>연결하기</Button>
              </>
            )}
          </div>
        </div>

        {err && <p style={{ margin: 0, fontSize: 13, color: 'var(--brand)' }}>{err}</p>}
        <div><Button variant="primary" onClick={onSave} disabled={save.isPending}>{save.isPending ? '저장 중…' : '설정 저장'}</Button></div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={{ width: 46, height: 26, borderRadius: 999, background: on ? 'var(--brand)' : 'var(--border-strong)', position: 'relative', cursor: 'pointer', transition: 'background 200ms', border: 'none', flexShrink: 0, padding: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}
