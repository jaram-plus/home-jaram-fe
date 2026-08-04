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
  STUDY_STATUS_LABEL,
} from './admin.data';

const labelEnum = (map) => z.enum(Object.values(map));

/** 학번: 8~10자리 숫자 (학교 포맷). 회원 내 중복 금지는 서버/제출 시 별도 검사. */
export const studentId = z.string().regex(/^\d{8,10}$/, '학번은 8~10자리 숫자여야 합니다.');
/** 기수(gen): '41기' 형태 또는 정수 문자열. */
export const gen = z.string().regex(/^\d{1,2}기$|^\d{1,2}$/, "기수는 '41기' 형태로 입력하세요.");
const email = z.string().email('이메일 형식이 올바르지 않습니다.').or(z.literal('')).optional();

export const memberSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  studentId,
  gen,
  grade: labelEnum(GRADE_LABEL),
  status: labelEnum(STATUS_LABEL),
  email,
});

// 임원진 표는 회원 정보를 고치지 않는다 — 부서·직책(임기)만 열려 있고, 둘 다 비우면 임기 해제다.
export const execSchema = z.object({
  department: labelEnum(DEPARTMENT_LABEL).or(z.literal('')),
  title: z.string(),
});

// 기여자 표도 회원 정보를 고치지 않는다 — 기여자 여부 하나만 열려 있고,
// 등록은 모달이, 해제는 표의 액션이 담당하므로 사람이 입력하는 칸은 없다.
export const contribSchema = z.object({
  contributor: z.boolean(),
});

export const gradSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  gen,
  gradYear: z.string().regex(/^\d{4}$/, '졸업연도 4자리를 입력하세요.'),
  org: z.string().optional(),
  job: z.string().optional(),
});

// 상세 모달이 고치는 것만 담는다. 발표자·일시·장소는 읽기 전용이고, 상태는 서버가
// 시각으로 파생하며, 출석 코드는 '생성' 버튼이 즉시 발급한다 — 사람이 적는 칸이 아니다.
export const seminarSchema = z.object({
  title: z.string().min(1, '세미나명을 입력하세요.'),
  topic: z.string().optional(),
  description: z.string().optional(),
  materialUrl: z.string().url('링크 형식이 올바르지 않습니다.').or(z.literal('')).optional(),
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
  grad: gradSchema,
  seminars: seminarSchema,
  studies: studySchema,
  applications: applicationSchema,
};

/** 설정 폼 스키마. */
export const settingsSchema = z.object({
  semester: z.string().min(1, '학기를 입력하세요.'),
  currentGen: z.coerce.number().int().positive('기수는 양의 정수여야 합니다.'),
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
