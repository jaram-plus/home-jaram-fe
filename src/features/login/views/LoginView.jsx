import React from 'react';
import { Button, Input } from '@/design-system';
import { Panel } from './Panel';
import { Eyebrow, Title, Lead, FormError } from './parts';
import { blockBtn } from './styles';

/** Sign in — email + password, with links to signup and password reset. */
export function LoginView({ form, loading, formError, onSubmit, onSignup, onReset }) {
  const { values, errors, field } = form;
  return (
    <Panel>
      <Eyebrow>Sign In</Eyebrow>
      <Title size={36}>로그인</Title>
      <Lead>자람 회원을 위한 공간입니다. 한양대 이메일로 로그인하세요.</Lead>

      <form
        onSubmit={(e) => { e.preventDefault(); if (!loading) onSubmit(); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}
      >
        <Input
          label="이메일"
          type="email"
          autoComplete="email"
          placeholder="you@hanyang.ac.kr"
          hint="한양대 이메일(@hanyang.ac.kr)로만 로그인할 수 있습니다."
          value={values.email}
          onChange={field('email')}
          error={errors.email}
        />

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 'var(--w-semibold)', color: 'var(--text-body)' }}>
              비밀번호
            </label>
            <a className="jr-link" style={{ fontSize: 'var(--fs-xs)' }} onClick={onReset}>
              비밀번호를 잊으셨나요?
            </a>
          </div>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            value={values.pw}
            onChange={field('pw')}
            error={errors.pw}
          />
        </div>

        {formError && <FormError message={formError} />}

        <div style={{ marginTop: 4 }}>
          <Button size="lg" type="submit" disabled={loading} style={blockBtn}>
            {loading ? '확인 중…' : '로그인'}
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          아직 자람 회원이 아니신가요? <a className="jr-link" onClick={onSignup}>가입 신청하기</a>
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
          가입 신청 후 임원 확인을 거쳐 로그인할 수 있습니다.
        </p>
      </div>
    </Panel>
  );
}
