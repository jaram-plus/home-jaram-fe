import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './study.api';

/**
 * react-query 훅 모음 — 스터디 페이지.
 * 목록은 useQuery, 신청/개설/승인/거절은 useMutation. 승인·거절·개설 성공 시
 * 관련 목록을 무효화해 다시 불러온다. 호출부에서 onSuccess/onError를 주입한다.
 */

export const studyKeys = {
  studies: ['studies'],
  pending: ['studies', 'pending'],
  applicants: ['studies', 'applicants'],
  my: ['studies', 'my'],
};

export function useStudies() {
  return useQuery({ queryKey: studyKeys.studies, queryFn: api.listStudies });
}

export function usePending() {
  return useQuery({ queryKey: studyKeys.pending, queryFn: api.listPending });
}

export function useApplicants() {
  return useQuery({ queryKey: studyKeys.applicants, queryFn: api.listApplicants });
}

export function useMyActivity() {
  return useQuery({ queryKey: studyKeys.my, queryFn: api.listMyActivity });
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
  return useInvalidatingMutation(api.applyStudy, [studyKeys.my], options);
}

export function useCreateStudy(options) {
  return useInvalidatingMutation(api.createStudy, [studyKeys.studies, studyKeys.pending, studyKeys.my], options);
}

export function useApproveStudy(options) {
  return useInvalidatingMutation(api.approveStudy, [studyKeys.pending, studyKeys.studies], options);
}

export function useRejectStudy(options) {
  return useInvalidatingMutation(api.rejectStudy, [studyKeys.pending], options);
}

export function useApproveApplicant(options) {
  return useInvalidatingMutation(api.approveApplicant, [studyKeys.applicants], options);
}

export function useRejectApplicant(options) {
  return useInvalidatingMutation(api.rejectApplicant, [studyKeys.applicants], options);
}
