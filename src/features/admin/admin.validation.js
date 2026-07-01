/**
 * admin Zod 스키마 — 저장 시 일괄 재검증 + 폼(설정·행추가) 검증. (기획.md §8·§10)
 *
 * 인라인 표 셀은 경량 자체 검증(빈값 등) 후, 저장 직전 해당 리소스 스키마로
 * 다시 검증합니다. 화면은 한글 라벨을 다루므로 enum 도 라벨 값으로 정의합니다.
 * (와이어 enum 키 검증이 필요하면 admin.api.js toWire 이후 별도 스키마를 두세요.)
 */
import { z } from 'zod';
import {
  GRADE_LABEL, STATUS_LABEL, DEPARTMENT_LABEL,
  SEMINAR_STATUS_LABEL, STUDY_STATUS_LABEL,
} from './admin.data';

const labelEnum = (map) => z.enum(Object.values(map));

/** 학번: 8~10자리 숫자 (학교 포맷). 회원 내 중복 금지는 서버/제출 시 별도 검사. */
export const studentId = z.string().regex(/^\d{8,10}$/, '학번은 8~10자리 숫자여야 합니다.');
/** 기수: '41기' 형태 또는 정수 문자열. */
export const cohort = z.string().regex(/^\d{1,2}기$|^\d{1,2}$/, "기수는 '41기' 형태로 입력하세요.");
const phone = z.string().regex(/^01\d-?\d{3,4}-?\d{4}$/, '연락처 형식이 올바르지 않습니다.').or(z.literal('')).optional();

export const memberSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  studentId,
  cohort,
  grade: labelEnum(GRADE_LABEL),
  status: labelEnum(STATUS_LABEL),
  phone,
});

export const execSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  studentId,
  cohort,
  department: labelEnum(DEPARTMENT_LABEL),
  position: z.string().min(1, '직책을 입력하세요.'),
  term: z.string().min(1, '임기를 입력하세요.'),
});

export const contribSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  cohort: z.string().min(1),
  type: z.string().min(1),
  contribution: z.string().min(1, '기여 내용을 입력하세요.'),
  link: z.string().optional(),
});

export const graduateSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  cohort,
  gradYear: z.string().regex(/^\d{4}$/, '졸업연도 4자리를 입력하세요.'),
  org: z.string().optional(),
  job: z.string().optional(),
});

export const seminarSchema = z.object({
  title: z.string().min(1, '세미나명을 입력하세요.'),
  target: z.string().optional(),
  speaker: z.string().min(1, '발표자를 입력하세요.'),
  date: z.string().min(1, '일시를 입력하세요.'),
  code: z.string().min(2, '출석코드를 입력하세요.'), // 유일성은 서버가 판정
  status: labelEnum(SEMINAR_STATUS_LABEL),
});

export const studySchema = z.object({
  title: z.string().min(1, '스터디명을 입력하세요.'),
  leader: z.string().min(1, '스터디장을 입력하세요.'),
  count: z.string().optional(),
  schedule: z.string().optional(),
  period: z.string().optional(),
  rate: z.string().optional(),
  status: labelEnum(STUDY_STATUS_LABEL),
});

export const applicationSchema = z.object({
  name: z.string().min(1),
  studentId,
});

/** 리소스 → 스키마. TableView / AddRowModal 이 참조. */
export const SCHEMA_BY_RESOURCE = {
  member: memberSchema,
  exec: execSchema,
  contrib: contribSchema,
  graduate: graduateSchema,
  seminars: seminarSchema,
  studies: studySchema,
  applications: applicationSchema,
};

/** 설정 폼 스키마. */
export const settingsSchema = z.object({
  semester: z.string().min(1, '학기를 입력하세요.'),
  currentCohort: z.coerce.number().int().positive('기수는 양의 정수여야 합니다.'),
  autoPromote: z.boolean(),
});

/** 행 하나를 리소스 스키마로 검증 → 필드별 에러맵({field:message}) 또는 null. */
export function validateRow(resource, row) {
  const schema = SCHEMA_BY_RESOURCE[resource];
  if (!schema) return null;
  const res = schema.safeParse(row);
  if (res.success) return null;
  const errors = {};
  for (const issue of res.error.issues) errors[issue.path[0]] = issue.message;
  return errors;
}
