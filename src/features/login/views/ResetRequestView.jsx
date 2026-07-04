import React from 'react';
import { Button, Input } from '@/design-system';
import { Panel } from './Panel';
import { Eyebrow, Title, Lead } from './parts';
import { blockBtn } from './styles';

/** Reset · step 1 — request a reset link by email. */
export function ResetRequestView({ form, onSubmit, onLogin }) {
  const { values, errors, field } = form;
  return (
    <Panel>
      <Eyebrow>Reset · 1 / 2</Eyebrow>
      <Title size={32}>비밀번호 재설정</Title>
      <Lead>가입한 이메일로 재설정 링크를 보내드립니다.</Lead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
        <Input
          label="이메일"
          type="email"
          placeholder="you@hanyang.ac.kr"
          value={values.email}
          onChange={field('email')}
          error={errors.email}
        />
        <Button size="lg" onClick={onSubmit} style={blockBtn}>
          재설정 링크 받기
        </Button>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <a className="jr-link" style={{ fontSize: 'var(--fs-sm)' }} onClick={onLogin}>
          로그인으로 돌아가기
        </a>
      </div>
    </Panel>
  );
}
