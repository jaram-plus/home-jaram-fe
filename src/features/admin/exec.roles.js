/**
 * 임원 지정 권한 — 누가 어떤 (부서, 직책) 을 줄 수 있는지.
 *
 *   회장   : 모든 임원진. 회장까지 지정할 수 있고, 지정하면 본인 임기는 끝난다.
 *   부회장 : 회장·부회장을 뺀 나머지 전부.
 *   부장   : 자기 부처의 부원만.
 *   그 외(부원·인프라) : 지정 불가 — 임원진 표도 읽기 전용으로 본다.
 *
 * 결과는 '보조금(grants)' 맵 { 부서키: [직책키] } 하나로 표현하고, 화면은 이걸로
 * 셀렉트 옵션과 읽기 전용 여부를 모두 판정한다. 서버는 조합(MemberTitle.allowedIn)만
 * 검증하고 이 역할 규칙까지는 보지 않으므로, 실제 강제는 아직 화면 쪽에만 있다.
 */
import { TITLES_BY_DEPARTMENT, departmentKey, titleKey } from '@/shared/member/enums';

const LEAD_DEPARTMENTS = ['ACADEMIC', 'PR', 'FINANCE'];

/** 로그인한 임원(부서·직책 키) → grants. 권한이 없으면 빈 객체. */
export function grantsOf(me) {
  const department = me?.department;
  const title = me?.title;
  if (department === 'LEADERSHIP' && title === 'PRESIDENT') {
    return TITLES_BY_DEPARTMENT;
  }
  if (department === 'LEADERSHIP' && title === 'VICE_PRESIDENT') {
    // 회장·부회장은 회장만 지정할 수 있으므로 회장단을 통째로 뺀다.
    return Object.fromEntries(Object.entries(TITLES_BY_DEPARTMENT).filter(([d]) => d !== 'LEADERSHIP'));
  }
  if (title === 'LEAD' && LEAD_DEPARTMENTS.includes(department)) {
    return { [department]: ['STAFF'] };
  }
  return {};
}

/** 임원을 지정할 수 있는가 (지정 버튼·모달 노출 여부). */
export function canAssign(grants) {
  return Object.keys(grants || {}).length > 0;
}

/** 고를 수 있는 부서 키 목록. */
export function departmentOptions(grants) {
  return Object.keys(grants || {});
}

/** 그 부서에서 고를 수 있는 직책 키 목록. */
export function titleOptions(grants, department) {
  return (grants || {})[department] || [];
}

/**
 * 표의 한 행(부서·직책이 한글 라벨)을 수정할 수 있는가.
 * 지금 그 자리에 앉힐 수 있는 사람만 그 자리를 건드릴 수 있다는 규칙이다.
 * 임기가 비어 있는 행은 아직 아무 권한도 소모하지 않았으므로 지정 권한만 있으면 된다.
 */
export function canEditRow(grants, row) {
  const department = departmentKey(row?.department);
  const title = titleKey(row?.title);
  if (!department || !title) return canAssign(grants);
  return titleOptions(grants, department).includes(title);
}

/** 회장 자리를 넘겨받는 지정인가 — 넘기는 쪽 임기가 끝나므로 확인을 받아야 한다. */
export function isHandover(me, title) {
  return me?.title === 'PRESIDENT' && title === 'PRESIDENT';
}
