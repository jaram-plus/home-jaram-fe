/**
 * Seminar page copy + seed data — pure data, no JSX.
 *
 * `SEMINARS` is the browsable schedule; `ROSTERS` seeds the attendance-roster
 * demo. In production both come from the backend — keep only the static copy
 * (badge maps, attend labels, messages, empty/toast strings) here.
 *
 * `status` drives the badge AND the attend CTA:
 *   upcoming  출석 시간 전 (CTA disabled)
 *   ongoing   출석 가능 (CTA enabled)
 *   ended     출석 마감 (CTA disabled)
 * `code` is the attendance code checked client-side in the demo; the real
 * check belongs on the server.
 */

export const SEMINARS = [
  { id: 'm1', title: 'React 18 동시성 렌더링 깊게 보기', speaker: '이성장', topic: 'Frontend', day: '27', month: '6월', weekday: '금', time: '19:00', place: '제3공학관 401호', status: 'ongoing', material: true, code: 'JARAM41' },
  { id: 'm2', title: '클린 아키텍처로 배우는 백엔드 설계', speaker: '최순환', topic: 'Backend', day: '30', month: '6월', weekday: '월', time: '19:00', place: '제3공학관 401호', status: 'upcoming', material: false },
  { id: 'm3', title: '대규모 트래픽 다루기 — 캐시와 큐', speaker: '김자람', topic: 'Infra', day: '20', month: '6월', weekday: '금', time: '19:00', place: '온라인', status: 'ended', material: true },
  { id: 'm4', title: '알고리즘 인터뷰 완전 정복', speaker: '박나눔', topic: 'Algorithm', day: '04', month: '7월', weekday: '금', time: '19:00', place: '제3공학관 502호', status: 'upcoming', material: false },
];

// Attendance rosters keyed by seminar group. `cap` is capacity, `list` is the
// seeded attendees (mutated locally in the demo when attendance is checked).
export const ROSTERS = {
  r1: {
    title: 'React 18 동시성 렌더링 깊게 보기',
    cap: 24,
    list: [
      { name: '이정민', sid: '2023012345', at: '19:02' },
      { name: '홍서연', sid: '2022098765', at: '19:03' },
      { name: '김도윤', sid: '2024011223', at: '19:05' },
      { name: '박하준', sid: '2021087654', at: '19:06' },
      { name: '정수아', sid: '2023044556', at: '19:08' },
      { name: '오지후', sid: '2022033221', at: '19:11' },
      { name: '문가은', sid: '2024055667', at: '19:14' },
      { name: '서준영', sid: '2021076543', at: '19:19' },
    ],
  },
  r2: { title: '알고리즘 인터뷰 완전 정복', cap: 30, list: [] },
};

// Roster sub-nav (which seminar's attendance to show). `key` indexes ROSTERS.
export const ROSTER_TABS = [
  { key: 'r1', label: 'React 18 동시성 렌더링' },
  { key: 'r2', label: '알고리즘 인터뷰 완전 정복' },
];

// status → Tag content. tone maps to the design-system Tag `tone` prop.
export const STATUS_BADGE = {
  upcoming: { label: '예정', tone: 'brand' },
  ongoing: { label: '진행 중', tone: 'seal' },
  ended: { label: '종료', tone: 'neutral' },
};

// status → disabled CTA label (when the user can't check in).
export const ATTEND_LABEL = {
  done: '출석 완료',
  upcoming: '출석 시간 전입니다',
  ended: '출석이 마감되었습니다',
};

// Client-side validation messages.
export const MESSAGES = {
  codeRequired: '출석 코드를 입력해 주세요.',
  codeWrong: '출석 코드가 올바르지 않습니다.',
  codeServer: '출석 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  titleRequired: '제목을 입력해 주세요.',
};

// Transient toast strings.
export const TOAST = {
  attended: '출석이 완료되었습니다.',
  created: '세미나가 등록되었습니다.',
};

export const EMPTY = {
  seminars: '예정된 세미나가 없습니다.',
  attendees: '아직 출석한 회원이 없습니다.',
};
