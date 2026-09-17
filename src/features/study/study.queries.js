import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './study.api';

/**
 * react-query 훅 모음 — 스터디 페이지.
 * 목록은 useQuery, 신청/개설/승인/거절은 useMutation. 승인·거절·개설 성공 시
 * 관련 목록을 무효화해 다시 불러온다. 호출부에서 onSuccess/onError를 주입한다.
 */

// 임원용 전체 목록(pending·applicants)의 키는 여기 없다 — 관리자 콘솔이
// adminKeys 로 따로 들고 있다(features/admin/admin.queries.js).
export const studyKeys = {
  studies: ['studies'],
  my: ['studies', 'my'],
  detail: (studyId) => ['studies', studyId, 'detail'],
  applicantsOf: (studyId) => ['studies', studyId, 'applicants'],
  attendance: (studyId) => ['studies', studyId, 'attendance'],
  myAttendance: (studyId) => ['studies', studyId, 'attendance', 'me'],
};

export function useStudies() {
  return useQuery({ queryKey: studyKeys.studies, queryFn: api.listStudies });
}

/**
 * 상세. 로그인 전에는 부르지 않는다 — 서버가 401 로 막으므로 부르면 안내 대신
 * 에러 문구가 뜬다. 비로그인 화면은 목록이 이미 준 값으로 그린다.
 */
export function useStudyDetail(studyId, enabled = true) {
  return useQuery({
    queryKey: studyKeys.detail(studyId),
    queryFn: () => api.getStudy({ studyId }),
    enabled: enabled && Boolean(studyId),
  });
}

/** 로그인 전에는 부르지 않는다 — 401 을 받으면 안내 대신 에러 문구가 뜬다. */
export function useMyActivity(enabled = true) {
  return useQuery({ queryKey: studyKeys.my, queryFn: api.listMyActivity, enabled });
}

// 성공 후 무효화할 쿼리 키를 받아 useMutation을 만든다.
function useInvalidatingMutation(mutationFn, invalidate, options) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(...args);
    },
  });
}

export function useApplyStudy(options) {
  return useInvalidatingMutation(api.applyStudy, [studyKeys.my, studyKeys.studies], options);
}

export function useCreateStudy(options) {
  return useInvalidatingMutation(api.createStudy, [studyKeys.studies, studyKeys.my], options);
}

// 신청 승인·반려는 '내 스터디' 카드의 pendingApplicants 숫자를 바꾼다.
export function useApproveApplicant(studyId, options) {
  return useInvalidatingMutation(api.approveApplicant,
    [studyKeys.applicantsOf(studyId), studyKeys.my], options);
}

export function useRejectApplicant(studyId, options) {
  return useInvalidatingMutation(api.rejectApplicant,
    [studyKeys.applicantsOf(studyId), studyKeys.my], options);
}

/** studyId 가 없으면 돌지 않는다 — 모달이 닫혀 있을 때 부르지 않기 위해서다. */
export function useStudyApplicants(studyId) {
  return useQuery({
    queryKey: studyKeys.applicantsOf(studyId),
    queryFn: () => api.listStudyApplicants({ studyId }),
    enabled: !!studyId,
  });
}

export function useAttendanceBoard(studyId) {
  return useQuery({
    queryKey: studyKeys.attendance(studyId),
    queryFn: () => api.attendanceBoard({ studyId }),
    enabled: !!studyId,
  });
}

export function useMyAttendance(studyId) {
  return useQuery({
    queryKey: studyKeys.myAttendance(studyId),
    queryFn: () => api.myAttendance({ studyId }),
    enabled: !!studyId,
  });
}

export function useSaveAttendance(studyId, options) {
  return useInvalidatingMutation(
    api.saveAttendance, [studyKeys.attendance(studyId), studyKeys.my], options);
}

export function useAddWeek(studyId, options) {
  return useInvalidatingMutation(
    api.addWeek, [studyKeys.attendance(studyId), studyKeys.my], options);
}

export function useEditWeek(studyId, options) {
  return useInvalidatingMutation(api.editWeek, [studyKeys.attendance(studyId)], options);
}

export function useDeleteWeek(studyId, options) {
  return useInvalidatingMutation(
    api.deleteWeek, [studyKeys.attendance(studyId), studyKeys.my], options);
}

export function useDeleteApplication(options) {
  return useInvalidatingMutation(api.deleteApplication, [studyKeys.my, studyKeys.studies], options);
}

export function useCloseRecruiting(options) {
  return useInvalidatingMutation(api.closeRecruiting, [studyKeys.my, studyKeys.studies], options);
}

export function useFinishStudy(options) {
  return useInvalidatingMutation(api.finishStudy, [studyKeys.my, studyKeys.studies], options);
}
