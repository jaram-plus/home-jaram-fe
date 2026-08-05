import React from 'react';
import { Button, Input } from '@/design-system';

/** 일정 생성 모달 — 날짜·장소·모드·정원만 입력한다. 슬롯은 서버가 capacity만큼 빈 채로 만든다. */
export function CreateScheduleModal({ values, errors, onChange, onClose, onSubmit, pending = false }) {
  return (
    <div
      className="adm-anim-fade"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(28,24,19,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="adm-anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, background: 'var(--surface-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--brand)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-strong)' }}>일정 만들기</h3>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
          {/* adm-datetime — 사파리가 그리는 날짜 위젯이 220px 칸을 밀어내지 않게 한다. */}
          <Input className="adm-datetime" label="일시" type="datetime-local" value={values.startsAt} onChange={onChange('startsAt')} error={errors.startsAt} style={{ maxWidth: 220 }} />
          <Input label="장소" placeholder="제3공학관 401호 / 온라인" value={values.place} onChange={onChange('place')} />
          <Input label="진행 방식" placeholder="오프라인 / 온라인" value={values.mode} onChange={onChange('mode')} />
          <Input label="정원" type="number" min={1} value={values.capacity} onChange={onChange('capacity')} />
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={pending}>취소</Button>
          <Button onClick={onSubmit} disabled={pending}>{pending ? '생성 중…' : '만들기'}</Button>
        </div>
      </div>
    </div>
  );
}
