import React from 'react';
import { Button } from '@/design-system';
import { Panel } from './Panel';
import { Title, CenterText, IconBadge, CheckIcon, blockBtn } from './parts';

/** Signup received — awaiting officer approval. */
export function SignupDoneView({ onLogin }) {
  return (
    <Panel center>
      <IconBadge tone="brand">
        <CheckIcon />
      </IconBadge>
      <Title size={30} lh={1.2}>
        가입 신청이
        <br />
        접수되었습니다
      </Title>
      <CenterText>
        임원 확인 후 결과를 이메일로 안내드립니다. 승인이 완료되면 로그인할 수 있습니다.
      </CenterText>
      <div style={{ marginTop: 30 }}>
        <Button variant="outline" size="lg" onClick={onLogin} style={blockBtn}>
          로그인 화면으로 돌아가기
        </Button>
      </div>
    </Panel>
  );
}
