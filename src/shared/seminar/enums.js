/**
 * Seminar status / target-grade enum — 백엔드 SeminarStatus / TargetGrade 와
 * 1:1 미러. 와이어에는 enum 키가 오고, 화면 표시는 여기 한글 라벨로 매핑한다.
 * admin(관리)과 seminar(회원용) 양쪽이 이 모듈 하나만 import해 라벨이 다시
 * 갈라지지 않도록 한다.
 */

export const SEMINAR_STATUS_LABELS = { UPCOMING: '예정', ONGOING: '진행 중', ENDED: '종료' };
export const TARGET_GRADE_LABELS = { NEWCOMER: '수습회원', ASSOCIATE: '준회원', REGULAR: '정회원', OB: '졸업생' };

export const SEMINAR_STATUSES = Object.keys(SEMINAR_STATUS_LABELS);
export const TARGET_GRADES = Object.keys(TARGET_GRADE_LABELS);

/** status 키 → 한글 라벨. 모르는/빈 키는 null. */
export function seminarStatusLabel(key) {
  return key ? SEMINAR_STATUS_LABELS[key] ?? null : null;
}

/** 등급 키 배열 → 한글 라벨 문자열. 빈 배열/undefined → '전체'. */
export function targetGradeLabels(keys) {
  if (!keys || keys.length === 0) return '전체';
  return keys.map((k) => TARGET_GRADE_LABELS[k]).join('·');
}
