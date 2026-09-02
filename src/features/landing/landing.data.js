/**
 * Landing page content.
 *
 * Pure data — no JSX, no markup. Sections import what they need.
 * Replace the NOTE-marked arrays (TRACKS / VOICES / HISTORY) with real
 * content once it is confirmed; copy was written as on-brand placeholder.
 *
 * In production, fetch the dynamic figures (STATS, ALUMNI, HISTORY) from
 * the backend and keep only the static editorial copy here.
 */
import { clubYears } from '@/shared/club/founding';

export const NAV = [
  { label: '소개', href: '#' },
  { label: '스터디', href: '/study' },
  { label: '세미나', href: '/seminar' },
  { label: '사람들', href: '/people' },
];

export const STATS = [
  { value: String(clubYears()), label: '년의 역사' },
  { value: '70', suffix: '+', label: '활성 멤버' },
  { value: '500', suffix: '+', label: '졸업생' },
  { value: '1984', label: '설립년도' },
];

export const ACTIVITIES = [
  { no: '01', en: 'Study', title: '스터디', href: '/study', body: '관심 주제로 모여 한 학기를 함께 완주합니다. 수준과 관심사에 맞춘 소규모 그룹으로 깊이 있게 파고듭니다.' },
  { no: '02', en: 'Seminar', title: '세미나', href: '/seminar', body: '배운 것을 발표로 정리하고 서로의 시야를 넓힙니다. 최신 기술부터 심화 이론까지, 함께 나누며 단단해집니다.' },
  { no: '03', en: 'Hackathon · Workshop', title: '해커톤·워크샵', body: '짧은 호흡으로 직접 만들어 봅니다. 밀도 높은 몰입 속에서 손으로 익히는 시간입니다.' },
  { no: '04', en: 'Project', title: '프로젝트', body: '실제로 동작하는 결과물을 남깁니다. 협업으로 실무 경험을 쌓고 대외 활동으로 이어 갑니다.' },
];

// NOTE: 임시(placeholder) 데이터 — 실제 트랙/성장단계 확정 시 교체.
export const TRACKS = [
  { no: '01', en: 'Join', title: '합류', body: '새내기로 자람의 문을 두드립니다. 동기들과 함께 첫 코드를 쓰며 학회 생활을 시작합니다.' },
  { no: '02', en: 'Learn', title: '학습', body: '스터디와 세미나로 기초를 다집니다. 모르는 것을 함께 배우며 단단한 토대를 쌓습니다.' },
  { no: '03', en: 'Build', title: '도전', body: '프로젝트와 해커톤에서 직접 만들어 봅니다. 협업으로 실무 감각을 익히고 실력을 증명합니다.' },
  { no: '04', en: 'Lead', title: '나눔', body: '후배에게 배움을 전하고 학회를 이끕니다. 받은 것을 돌려주며 선순환을 완성합니다.' },
];

// `logo` keys map into ALUMNI_LOGOS in ./landing.assets.js
export const ALUMNI = [
  { logo: 'naver', name: '네이버' },
  { logo: 'kakao', name: '카카오' },
  { logo: 'toss', name: '토스' },
  { logo: 'samsung', name: '삼성전자' },
  { logo: 'ncsoft', name: '엔씨소프트' },
  { logo: 'nexon', name: '넥슨' },
  { logo: 'aws', name: 'AWS' },
  { logo: 'pearlabyss', name: '펄어비스' },
];

// NOTE: 임시(placeholder) 인용 — 실제 멤버/졸업생 인용문 확보 시 교체.
export const VOICES = [
  { quote: '혼자였다면 중간에 포기했을 것들을, 자람에서는 끝까지 해냈습니다. 옆에서 함께 달리는 사람이 있다는 건 생각보다 큰 힘이었어요.', who: '32기 · 백엔드 엔지니어' },
  { quote: '처음 발표하던 세미나가 아직도 기억에 남습니다. 떨면서 준비한 그 시간이 지금 일하는 방식의 출발점이 됐어요.', who: '35기 · 프로덕트 디자이너' },
  { quote: '받은 만큼 나눈다는 말이 멋있는 구호인 줄만 알았는데, 후배를 가르치며 제가 더 많이 배웠습니다.', who: '29기 · 대학원 재학' },
];

// NOTE: 임시(placeholder) 연혁 — 실제 마일스톤 확정 시 교체.
export const HISTORY = [
  { year: '1984', title: '자람 창립', body: '한양대학교 ERICA 컴퓨터학회로 첫 발을 내딛다.' },
  { year: '1996', title: '첫 정기 세미나 시작', body: '선후배가 함께 배움을 나누는 세미나 문화가 자리잡다.' },
  { year: '2008', title: '연합 해커톤 첫 참가', body: '교외 대회에 도전하며 활동 반경을 넓히다.' },
  { year: '2016', title: '오픈소스 프로젝트 정착', body: '실무형 프로젝트와 협업 문화가 본격화되다.' },
  { year: '2024', title: '창립 40주년', body: '마흔 해의 선순환을 기념하고 다음 세대를 준비하다.' },
  { year: '2025', title: '41기 출범', body: '새로운 멤버들과 함께 마흔한 번째 해를 열다.' },
];

export const FOOT_MENU = [
  { h: 'JARAM', items: [
    { label: '소개', href: '#' },
    { label: '사람들', href: '/people' },
    { label: '졸업생', href: '/people?tab=grad' },
  ] },
  { h: 'Activity', items: [
    { label: '스터디', href: '/study' },
    { label: '세미나', href: '/seminar' },
  ] },
];

