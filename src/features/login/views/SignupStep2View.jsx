import React from 'react';
import { Button, Input } from '@/design-system';
import { Panel } from './Panel';
import { Eyebrow, Title, Lead, FormError, Segmented, Chips, ReadonlyField, blockBtn } from './parts';
import { STUDENT_TYPES, ENROLLMENT, FACULTIES, FACULTY_ETC, newcomerGen } from '../login.data';

/**
 * 가입 신청 2단계 — 추가 정보. 1단계(이름·학번·이메일·비밀번호) 통과 후 노출된다.
 * 신입생/재학생 구분, 기수(재학생만), 학부, 전화번호, 재학여부를 받고 최종 신청한다.
 */
export function SignupStep2View({ form, loading, formError, onSubmit, onBack }) {
  const { values, errors, field, setValues } = form;
  const set = (name) => (v) => setValues((s) => ({ ...s, [name]: v }));
  const isCurrent = values.studentType === 'current';

  return (
    <Panel>
      <Eyebrow>Apply · 2/2</Eyebrow>
      <Title size={36}>추가 정보</Title>
      <Lead>회원 정보를 위해 몇 가지만 더 입력해 주세요.</Lead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
        <Segmented label="구분" value={values.studentType} onChange={set('studentType')} options={STUDENT_TYPES} />

        {isCurrent ? (
          <Input
            label="기수"
            inputMode="numeric"
            placeholder={String(newcomerGen())}
            hint="자람 기수를 입력해 주세요."
            value={values.gen}
            onChange={field('gen')}
            error={errors.gen}
          />
        ) : (
          <ReadonlyField label="기수" hint="가입 연도 기준으로 자동 계산됩니다." value={`${newcomerGen()}기`} />
        )}

        <Chips label="학부" value={values.facultyChoice} onChange={set('facultyChoice')} options={FACULTIES} error={errors.facultyChoice} />

        {values.facultyChoice === FACULTY_ETC && (
          <Input
            label="학부 직접 입력"
            placeholder="학부명을 입력해 주세요"
            value={values.facultyEtc}
            onChange={field('facultyEtc')}
            error={errors.facultyEtc}
          />
        )}

        <Input
          label="전화번호"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={values.phone}
          onChange={field('phone')}
          error={errors.phone}
        />

        <Segmented label="재학여부" value={values.enrolled} onChange={set('enrolled')} options={ENROLLMENT} />

        {formError && <FormError message={formError} />}

        <div style={{ marginTop: 4 }}>
          <Button size="lg" disabled={loading} onClick={onSubmit} style={blockBtn}>
            {loading ? '신청 중…' : '가입 신청하기 (2/2)'}
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          <a className="jr-link" onClick={onBack}>이전 단계로</a>
        </p>
      </div>
    </Panel>
  );
}
