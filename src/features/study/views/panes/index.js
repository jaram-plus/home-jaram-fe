/**
 * 스터디 운영 패널. 스터디장의 '관리하기' 모달과 관리자 콘솔의 스터디 '상세'
 * 모달이 같은 것을 쓴다 — 두 모달이 같은 엔드포인트를 부르므로 화면도 한 벌이다.
 *
 * 패널은 어느 모달에 있는지 모른다. 권한과 상태 판정은 전부 서버가 하고, 무엇을
 * 열지는 부르는 쪽이 정한다.
 */
export { ApplicantsPane } from './ApplicantsPane';
export { AttendancePane } from './AttendancePane';
export { CurriculumPane } from './CurriculumPane';
export { InfoPane } from './InfoPane';
export { Note } from './common';
