import React from 'react';
import { Button, Input } from '@/design-system';
import { Panel } from './Panel';
import { Eyebrow, Title, Lead, blockBtn } from './parts';

/** Apply for membership — submitted for officer approval before login. */
export function SignupView({ form, loading, onSubmit, onLogin }) {
  const { values, errors, field } = form;
  return (
    <Panel>
      <Eyebrow>Apply</Eyebrow>
      <Title size={36}>가입 신청</Title>
      <Lead>자람 회원 가입을 신청합니다. 임원 확인 후 로그인할 수 있습니다.</Lead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
        <Input label="이름" placeholder="홍길동" value={values.name} onChange={field('name')} error={errors.name} />
        <Input label="학번" inputMode="numeric" placeholder="2022012345" value={values.sid} onChange={field('sid')} error={errors.sid} />
        <Input
          label="이메일"
          type="email"
          placeholder="you@hanyang.ac.kr"
          hint="한양대 이메일(@hanyang.ac.kr)만 사용할 수 있습니다."
          value={values.email}
          onChange={field('email')}
          error={errors.email}
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          hint="8자 이상, 영문·숫자·특수문자를 포함해 주세요."
          value={values.pw}
          onChange={field('pw')}
          error={errors.pw}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={values.pw2}
          onChange={field('pw2')}
          error={errors.pw2}
        />

        <div style={{ marginTop: 4 }}>
          <Button size="lg" disabled={loading} onClick={onSubmit} style={blockBtn}>
            {loading ? '신청 중…' : '가입 신청하기'}
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          이미 회원이신가요? <a className="jr-link" onClick={onLogin}>로그인</a>
        </p>
      </div>
    </Panel>
  );
}
