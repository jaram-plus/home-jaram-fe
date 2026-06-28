import React from 'react';
import { Button } from '@/design-system';
import { Panel } from './Panel';
import { Title, CenterText, IconBadge, CheckIcon, blockBtn } from './parts';

/** Reset complete — password changed, sign in again. */
export function ResetDoneView({ onLogin }) {
  return (
    <Panel center>
      <IconBadge tone="brand">
        <CheckIcon />
      </IconBadge>
      <Title size={28} lh={1.2}>비밀번호가 변경되었습니다</Title>
      <CenterText>새 비밀번호로 로그인해 주세요.</CenterText>
      <div style={{ marginTop: 30 }}>
        <Button size="lg" onClick={onLogin} style={blockBtn}>
          로그인하러 가기
        </Button>
      </div>
    </Panel>
  );
}
