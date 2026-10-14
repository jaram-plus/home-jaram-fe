/**
 * 스터디 운영 패널. 스터디장의 '관리하기' 모달과 관리자 콘솔의 스터디 '상세'
 * 모달이 같은 것을 쓴다 — 두 모달이 같은 엔드포인트를 부르므로 화면도 한 벌이다.
 *
 * 패널은 어느 모달에 있는지 모른다. 권한과 상태 판정은 전부 서버가 하고, 무엇을
 * 열지는 부르는 쪽이 정한다. 다만 STUDY_EDIT 가 없는 열람자에게는 부르는 쪽이
 * 정보·커리큘럼·출석 패널에 `readOnly` 를 넘긴다 — 서버가 막는 것을 화면도
 * 보여 주지 않으려는 것이고, 안 넘기면(스터디장의 '관리하기') 동작은 그대로다.
 */
export { ApplicantsPane } from './ApplicantsPane';
export { AttendancePane } from './AttendancePane';
export { CurriculumPane } from './CurriculumPane';
export { InfoPane } from './InfoPane';
export { Note } from './common';
