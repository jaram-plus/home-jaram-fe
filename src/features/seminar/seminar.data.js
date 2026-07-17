/**
 * Seminar page copy + seed data — pure data, no JSX.
 *
 * `SEMINARS`/`ROSTERS` mirror the original mock schedule/roster shape; the
 * page now fetches both from the backend via seminar.api.js, so these two
 * exports are currently unused. Keep only the static copy (badge maps, attend
 * labels, messages, empty/toast strings) here.
 *
 * `status` drives the badge AND the attend CTA (wire enum SeminarStatus, UPPER_SNAKE):
 *   UPCOMING  출석 시간 전 (CTA disabled)
 *   ONGOING   출석 가능 (CTA enabled)
 *   ENDED     출석 마감 (CTA disabled)
 * `code` was checked client-side in the original mock; the real check happens
 * server-side (see seminar.api.js checkAttendance).
 */
import { SEMINAR_STATUS_LABELS } from '@/shared/seminar/enums';

export const SEMINARS = [
  { id: 'm1', title: 'React 18 동시성 렌더링 깊게 보기', speaker: '이성장', topic: 'Frontend', day: '27', month: '6월', weekday: '금', time: '19:00', place: '제3공학관 401호', status: 'ONGOING', material: true, code: 'JARAM41' },
  { id: 'm2', title: '클린 아키텍처로 배우는 백엔드 설계', speaker: '최순환', topic: 'Backend', day: '30', month: '6월', weekday: '월', time: '19:00', place: '제3공학관 401호', status: 'UPCOMING', material: false },
  { id: 'm3', title: '대규모 트래픽 다루기 — 캐시와 큐', speaker: '김자람', topic: 'Infra', day: '20', month: '6월', weekday: '금', time: '19:00', place: '온라인', status: 'ENDED', material: true },
  { id: 'm4', title: '알고리즘 인터뷰 완전 정복', speaker: '박나눔', topic: 'Algorithm', day: '04', month: '7월', weekday: '금', time: '19:00', place: '제3공학관 502호', status: 'UPCOMING', material: false },
];

// Attendance rosters keyed by seminar group. `cap` is capacity, `list` is the
// seeded attendees for the original mock roster (unused now that rosters come
// from the server via seminar.api.js getRoster).
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

// status → tone (design-system Tag `tone` prop). label comes from the shared
// enum module so admin/seminar never drift apart again.
const STATUS_TONE = { UPCOMING: 'brand', ONGOING: 'seal', ENDED: 'neutral' };
export const STATUS_BADGE = Object.fromEntries(
  Object.keys(SEMINAR_STATUS_LABELS).map((k) => [k, { label: SEMINAR_STATUS_LABELS[k], tone: STATUS_TONE[k] }]),
);

// status → disabled CTA label (when the user can't check in). `done` = 출석 완료.
export const ATTEND_LABEL = {
  done: '출석 완료',
  UPCOMING: '출석 시간 전입니다',
  ENDED: '출석이 마감되었습니다',
};

// ENDED 카드의 칩은 로그인한 회원에게만 개인화된다.
// 비로그인은 서버가 attendedAt을 채워줄 수 없으므로 STATUS_BADGE.ENDED('종료')로 폴백한다.
export const ENDED_CHIP = {
  attended: { label: '출석', tone: 'seal' },
  absent: { label: '결석', tone: 'neutral' },
};

// ONGOING 카드에서 출석 버튼 아래 한 줄. mins는 useAttendanceCountdown이 계산한 남은 분.
export const COUNTDOWN_LABEL = (mins) => `출석 인정까지 ${mins}분 남음`;

// 상세 모달 카피. 참석자 미리보기는 로그인 회원만 조회할 수 있다(서버가 401).
export const DETAIL = {
  descriptionTitle: '세미나 소개',
  myAttendanceTitle: '내 출석 기록',
  myAttendance: (at) => `${at}에 출석하셨습니다.`,
  attendeesTitle: '참석자',
  attendeesCount: (n) => `${n}명이 출석했습니다.`,
  attendeesLoginRequired: '로그인하시면 참석자를 확인하실 수 있습니다.',
  attendeesLoading: '불러오는 중…',
  attendeesError: '참석자를 불러오지 못했습니다.',
  unknownMember: '탈퇴한 회원',
  material: '발표 자료 보기',
  close: '닫기',
};

// Client-side validation messages.
export const MESSAGES = {
  codeRequired: '출석 코드를 입력해 주세요.',
  codeWrong: '출석 코드가 올바르지 않습니다.',
  codeServer: '출석 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  titleRequired: '제목을 입력해 주세요.',
  startsAtRequired: '일시를 선택해 주세요.',
  createServer: '세미나 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
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
