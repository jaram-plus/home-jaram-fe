/**
 * 일정("Schedule") 탭 카피 — 슬롯 자기등록/취소/세미나 제출 문구. (JSX 없음)
 */

// 빈 슬롯 표시. Phase 1 스펙에서 넘어온 상수 이름을 그대로 유지한다.
export const SLOT_EMPTY = '미정';

export const SCHEDULE_MESSAGES = {
  claimTaken: '방금 다른 분이 등록해서 자리가 찼습니다.',
  claimServer: '슬롯 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  cancelServer: '슬롯 취소 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  seminarTitleRequired: '제목을 입력해 주세요.',
  seminarServer: '세미나 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

export const SCHEDULE_TOAST = {
  claimed: '슬롯에 등록되었습니다.',
  canceled: '슬롯 등록을 취소했습니다.',
  seminarSubmitted: '세미나가 제출되었습니다. 임원 승인을 기다려 주세요.',
  seminarResubmitted: '세미나를 다시 제출했습니다. 임원 승인을 기다려 주세요.',
};

export const SLOT_ACTION_LABEL = {
  claim: '등록하기',
  cancel: '포기하기',
  createSeminar: '세미나 만들기',
  editSeminar: '수정하기',
  locked: '잠김',
};
