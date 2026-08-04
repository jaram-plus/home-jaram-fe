/**
 * People page copy + seed data — pure data, no JSX.
 *
 * Three tabs: 임원(exec) · 기여자(contrib) · 졸업자(grad). `exec` is grouped by
 * 부서 (회장단/학술부/…); `contrib`/`grad` are a single unnamed group. In
 * production these come from the backend — keep only the static copy (tab
 * labels, descriptions, empty strings) here.
 *
 * Per person:
 *   gen     기수 badge (정수 41; FE가 '기'를 붙인다); null hides the badge.
 *   github  show the GitHub social link (href wired in the app).
 *   blog    show the blog/globe social link.
 */

import { DEPARTMENTS, TITLES, departmentKey, titleKey } from '@/shared/member/enums';

export const TABS = [
  { key: 'exec', label: '임원' },
  { key: 'contrib', label: '기여자' },
  { key: 'grad', label: '졸업자' },
];

/** 순서 목록에서의 자리. 모르는 키는 맨 뒤로 보냅니다(정렬이 안정적이라 서로의 순서는 유지). */
function rank(order, key) {
  const at = order.indexOf(key);
  return at === -1 ? order.length : at;
}

/**
 * 임원 그룹을 화면 순서로 맞춥니다 — 부서는 `enums`의 순서(회장단·학술부·홍보부·
 * 회계부·인프라), 부서 안에서는 직책 순서(장 → 부원). 서버가 어떤 순서로 주든 화면은
 * 늘 같은 순서로 보이고, 아무도 지정되지 않은 부서는 빼서 제목만 남지 않게 합니다.
 */
export function orderExecGroups(groups = []) {
  return groups
    .filter((group) => group.members?.length)
    .map((group) => ({
      ...group,
      members: [...group.members].sort((a, b) => rank(TITLES, titleKey(a.role)) - rank(TITLES, titleKey(b.role))),
    }))
    .sort((a, b) => rank(DEPARTMENTS, departmentKey(a.heading)) - rank(DEPARTMENTS, departmentKey(b.heading)));
}

export const PEOPLE = {
  exec: {
    desc: '지금 자람을 이끄는 임원진입니다.',
    empty: '등록된 임원 정보가 없습니다.',
    groups: [
      {
        heading: '회장단',
        members: [
          { name: '김자람', role: '회장', gen: 41, bio: '백엔드와 클라우드 인프라에 관심이 많습니다.', github: true, blog: true },
          { name: '이성장', role: '부회장', gen: 41, bio: '학회 운영과 프론트엔드를 함께 챙기고 있어요.', github: true, blog: false },
        ],
      },
      {
        heading: '학술부',
        members: [
          { name: '박학술', role: '학술부장', gen: 41, bio: '세미나와 스터디 커리큘럼을 설계합니다.', github: true, blog: true },
          { name: '정알고', role: '학술부원', gen: 41, bio: '알고리즘 스터디를 이끌고 있습니다.', github: true, blog: false },
          { name: '한자료', role: '학술부원', gen: 41, bio: 'CS 기초 자료를 정리해 공유합니다.', github: true, blog: false },
        ],
      },
      {
        heading: '홍보부',
        members: [
          { name: '최홍보', role: '홍보부장', gen: 41, bio: '자람의 소식을 안팎으로 전합니다.', github: false, blog: true },
          { name: '오디자', role: '홍보부원', gen: 41, bio: '포스터와 SNS 콘텐츠를 만듭니다.', github: false, blog: true },
        ],
      },
      {
        heading: '회계부',
        members: [
          { name: '윤회계', role: '회계부장', gen: 41, bio: '학회 예산을 투명하게 관리합니다.', github: false, blog: false },
          { name: '강예산', role: '회계부원', gen: 41, bio: '회비와 행사 정산을 담당합니다.', github: false, blog: false },
        ],
      },
      {
        heading: '인프라',
        members: [
          { name: '서관리', role: '서버 관리자', gen: 41, bio: '자람 서비스의 인프라를 운영합니다.', github: true, blog: true },
        ],
      },
    ],
  },
  contrib: {
    desc: '자람에 힘을 더해주신 분들입니다.',
    empty: '등록된 기여자가 없습니다.',
    groups: [
      {
        heading: null,
        members: [
          { name: '박나눔', role: '전 회장', gen: 38, bio: '현직 프론트엔드 개발자로 후배 멘토링을 이어갑니다.', github: true, blog: true },
          { name: '김선배', role: '전 학술부장', gen: 37, bio: '세미나 운영 노하우를 전수해 주셨습니다.', github: true, blog: false },
          { name: '이멘토', role: '외부 멘토', gen: null, bio: '실무 코드 리뷰와 커리어 상담을 도와주십니다.', github: true, blog: true },
        ],
      },
    ],
  },
  grad: {
    desc: '자람을 거쳐 나아간 선배들입니다.',
    empty: '등록된 졸업자가 없습니다.',
    groups: [
      {
        heading: null,
        members: [
          { name: '정졸업', role: '39기 졸업', gen: null, bio: '네이버에서 서버 개발자로 일하고 있습니다.', github: true, blog: true },
          { name: '한선배', role: '38기 졸업', gen: null, bio: '토스에서 iOS 개발을 맡고 있습니다.', github: true, blog: false },
          { name: '오디비', role: '37기 졸업', gen: null, bio: '카카오에서 데이터 엔지니어로 재직 중입니다.', github: true, blog: false },
          { name: '신졸업', role: '36기 졸업', gen: null, bio: '대학원에서 머신러닝을 연구하고 있습니다.', github: true, blog: true },
        ],
      },
    ],
  },
};
