import React from 'react';
import { Card, Input, Button } from '@/design-system';
import { Eyebrow, FieldRow } from './parts';
import { EYEBROW, READONLY_LABELS, LABELS, PLACEHOLDERS, MESSAGES, AUTHORITY_LABELS } from '../profile.data';

/**
 * 수정 모드. 읽기 전용 필드(학부 포함)는 그대로 보여 주고 phone/bio/githubUrl/blogUrl만
 * 입력 가능. 저장(primary)/취소(outline) 버튼. 검증 에러는 각 Input의 error로 표시.
 */
export function EditView({ me, values, errors, field, onSave, onCancel, saving, formError }) {
  return (
    <Card accent="top">
      <Eyebrow>{EYEBROW}</Eyebrow>
      <h1 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', color: 'var(--text-strong)' }}>
        {me.name}
      </h1>
      {me.gen != null && (
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
          {me.gen}기
        </p>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        {READONLY_LABELS.map(([key, label]) => (
          <FieldRow key={key} label={label}>
            {key === 'authority'
              ? (AUTHORITY_LABELS[me[key]] ?? me[key])
              : (me[key] ?? <span style={{ color: 'var(--text-muted)' }}>{MESSAGES.empty}</span>)}
          </FieldRow>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <Input
          label={LABELS.phone}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={PLACEHOLDERS.phone}
          value={values.phone}
          onChange={field('phone')}
          error={errors.phone}
        />
        <Input
          label={LABELS.bio}
          as="textarea"
          rows={4}
          placeholder={PLACEHOLDERS.bio}
          value={values.bio}
          onChange={field('bio')}
          error={errors.bio}
        />
        <Input
          label={LABELS.githubUrl}
          placeholder={PLACEHOLDERS.githubUrl}
          value={values.githubUrl}
          onChange={field('githubUrl')}
          error={errors.githubUrl}
        />
        <Input
          label={LABELS.blogUrl}
          placeholder={PLACEHOLDERS.blogUrl}
          value={values.blogUrl}
          onChange={field('blogUrl')}
          error={errors.blogUrl}
        />
      </div>

      {formError && (
        <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--brand)' }}>
          {formError}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        <Button onClick={onSave} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>취소</Button>
      </div>
    </Card>
  );
}
