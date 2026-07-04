import React from 'react';
import { Button, Input } from '@/design-system';
import { Panel } from './Panel';
import { Eyebrow, Title, CenterText, IconBadge, AlertIcon } from './parts';
import { blockBtn } from './styles';

/**
 * Reset · step 2 — set a new password.
 *
 * `expired` reflects whether the reset token from the email link is still
 * valid; in production derive it from the token in the URL (or a verify call).
 * When expired, the user is sent back to request a fresh link.
 */
export function ResetNewView({ form, expired = false, onSubmit, onRetry }) {
  const { values, errors, field } = form;

  if (expired) {
    return (
      <Panel>
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <IconBadge tone="muted">
            <AlertIcon />
          </IconBadge>
          <Title size={26} lh={1.2}>링크가 유효하지 않습니다</Title>
          <CenterText>
            링크가 만료되었거나 유효하지 않습니다. 재설정을 다시 요청해 주세요.
          </CenterText>
          <div style={{ marginTop: 28 }}>
            <Button size="lg" onClick={onRetry} style={blockBtn}>
              재설정 다시 요청하기
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <Eyebrow>Reset · 2 / 2</Eyebrow>
      <Title size={32}>새 비밀번호 설정</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
        <Input
          label="새 비밀번호"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
          hint="8자 이상, 영문·숫자·특수문자를 포함해 주세요."
          value={values.pw}
          onChange={field('pw')}
          error={errors.pw}
        />
        <Input
          label="새 비밀번호 확인"
          type="password"
          placeholder="새 비밀번호를 다시 입력하세요"
          value={values.pw2}
          onChange={field('pw2')}
          error={errors.pw2}
        />
        <Button size="lg" onClick={onSubmit} style={blockBtn}>
          비밀번호 변경
        </Button>
      </div>
    </Panel>
  );
}
