import React from 'react';
import { Button } from '@/design-system';
import { Panel } from './Panel';
import { Title, CenterText, IconBadge, MailIcon } from './parts';
import { blockBtn } from './styles';

/**
 * Reset link sent — check your inbox.
 *
 * `onOpenLink` is a demo shortcut into the new-password step. In production the
 * user reaches that step by clicking the link in their email (carries a token),
 * so this button can be removed.
 */
export function ResetSentView({ onOpenLink, onLogin }) {
  return (
    <Panel center>
      <IconBadge tone="brand">
        <MailIcon />
      </IconBadge>
      <Title size={28} lh={1.2}>메일을 보냈습니다</Title>
      <CenterText>
        입력하신 이메일로 재설정 링크를 보냈습니다. 메일함을 확인해 주세요.
      </CenterText>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 30 }}>
        <Button size="lg" onClick={onOpenLink} style={blockBtn}>
          재설정 링크 열기 (데모)
        </Button>
        <a className="jr-link" style={{ fontSize: 'var(--fs-sm)' }} onClick={onLogin}>
          로그인으로 돌아가기
        </a>
      </div>
    </Panel>
  );
}
