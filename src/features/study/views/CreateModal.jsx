import React from 'react';
import { Button, Input } from '@/design-system';
import { ModalShell } from './ModalShell';
import { BLANK_WEEK } from '../study.data';

/**
 * 개설 신청 모달 — 계약 `StudyCreateRequest` 를 그대로 옮긴 폼이다.
 *
 * 칸 아홉은 전부 필수고(`period` 는 ① 에서 없어졌다 — 커리큘럼 주차 수가 대신한다),
 * 마지막 `weeks` 만 여러 줄이라 나머지와 생김새가 다르다. 그래서 앞의 세 묶음은
 * 라벨 붙은 입력으로 촘촘히 놓고, 커리큘럼만 늘고 주는 목록으로 따로 세운다.
 *
 * 검증과 payload 변환은 study.data.js(`validateCreate`·`toCreatePayload`)가 맡는다.
 * 이 파일은 그리기만 한다.
 */

/** 폼 안의 작은 묶음 머리. 오른쪽 hint 는 그 묶음에서만 참인 말을 싣는다. */
function Section({ title, hint, children }) {
  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 13 }}>
        <h4 style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--w-semibold)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--brand)',
        }}>
          {title}
        </h4>
        {hint && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </section>
  );
}

/**
 * 주차 한 줄. 번호는 화면에 놓인 순서가 정하므로 값으로 받지 않고 index 로 그린다 —
 * 가운데를 지우면 뒤가 저절로 당겨진다.
 */
function WeekRow({ index, week, onChange, onRemove, removable }) {
  return (
    <li style={{
      listStyle: 'none',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 13px',
      display: 'grid',
      gap: 9,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-strong)' }}>
          {index + 1}주차
        </strong>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${index + 1}주차 지우기`}
            style={{
              appearance: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              fontSize: 16,
              lineHeight: 1,
              color: 'var(--text-faint)',
            }}
          >
            ×
          </button>
        )}
      </div>
      <Input
        aria-label={`${index + 1}주차 제목`}
        placeholder="예: 상태 관리 훑어보기"
        value={week.title}
        onChange={(e) => onChange({ ...week, title: e.target.value })}
      />
      <Input
        as="textarea"
        aria-label={`${index + 1}주차 내용`}
        placeholder="이 주차에 다룰 내용 (선택)"
        value={week.content}
        onChange={(e) => onChange({ ...week, content: e.target.value })}
        maxLength={2000}
        style={{ minHeight: 56, fontSize: 'var(--fs-sm)' }}
      />
    </li>
  );
}

export function CreateModal({ form, onClose, onSubmit, pending = false, error = '' }) {
  const { values, errors, field, setValues } = form;
  const weeks = values.weeks;

  const setWeeks = (next) => setValues((s) => ({ ...s, weeks: next }));
  const changeWeek = (i, w) => setWeeks(weeks.map((old, n) => (n === i ? w : old)));
  const removeWeek = (i) => setWeeks(weeks.filter((_, n) => n !== i));
  const addWeek = () => setWeeks([...weeks, { ...BLANK_WEEK }]);

  return (
    <ModalShell
      title="스터디 개설 신청"
      lead="여기 적은 내용이 그대로 목록과 상세에 실립니다. 임원 승인 후 전체에 공개됩니다."
      onClose={onClose}
      maxWidth={600}
      align="top"
    >
      <Section title="무엇을 하는 스터디인가요">
        <Input
          label="제목"
          placeholder="예: React 심화 스터디"
          value={values.title}
          onChange={field('title')}
          error={errors.title}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14 }}>
          <Input
            label="분야"
            placeholder="Frontend, React"
            hint="쉼표로 구분합니다."
            value={values.fields}
            onChange={field('fields')}
            error={errors.fields}
          />
          <Input
            label="희망 인원"
            inputMode="numeric"
            placeholder="6"
            value={values.capacity}
            onChange={field('capacity')}
            error={errors.capacity}
          />
        </div>
      </Section>

      <Section title="언제 · 어디서 모이나요">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="일시"
            placeholder="매주 화 19:00"
            value={values.schedule}
            onChange={field('schedule')}
            error={errors.schedule}
          />
          <Input
            label="장소"
            placeholder="공학관 401호 / Discord"
            value={values.place}
            onChange={field('place')}
            error={errors.place}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="진행 방식"
            placeholder="온라인 / 오프라인 / 병행"
            value={values.mode}
            onChange={field('mode')}
            error={errors.mode}
          />
          <Input
            label="문의 연락처"
            placeholder="카카오톡 ID, 이메일 등"
            value={values.contact}
            onChange={field('contact')}
            error={errors.contact}
          />
        </div>
      </Section>

      <Section title="소개">
        <Input
          as="textarea"
          aria-label="스터디 소개"
          placeholder="어떤 사람과 무엇을 목표로 공부하고 싶은지 적어 주세요."
          value={values.intro}
          onChange={field('intro')}
          error={errors.intro}
        />
      </Section>

      <Section title="커리큘럼" hint={`총 ${weeks.length}주 과정으로 공개됩니다.`}>
        {/* 주차가 늘면 폼 전체가 아니라 이 목록만 스크롤한다 — 아래 버튼이 늘 보인다. */}
        <ul style={{
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 10,
          maxHeight: 330,
          overflowY: 'auto',
        }}>
          {weeks.map((w, i) => (
            <WeekRow
              key={i}
              index={i}
              week={w}
              onChange={(next) => changeWeek(i, next)}
              onRemove={() => removeWeek(i)}
              removable={weeks.length > 1}
            />
          ))}
        </ul>
        {errors.weeks && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--brand)' }}>
            {errors.weeks}
          </span>
        )}
        <div>
          <Button variant="secondary" onClick={addWeek}>＋ 주차 추가</Button>
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-normal)' }}>
          주차 수가 곧 스터디 기간입니다. 시작한 뒤에도 &apos;관리하기&apos;에서 맨 뒤로 늘리고 줄일 수 있습니다.
        </p>
      </Section>

      {error && (
        <p style={{
          margin: '22px 0 0',
          padding: '11px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--brand-tint)',
          border: '1px solid var(--brand)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-sm)',
          color: 'var(--text-body)',
          lineHeight: 'var(--lh-normal)',
        }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={onSubmit} disabled={pending}>{pending ? '보내는 중…' : '개설 신청'}</Button>
      </div>
    </ModalShell>
  );
}
