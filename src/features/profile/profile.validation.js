/**
 * 프로필 수정 폼 순수 검증. URL은 선택 입력(빈값 통과), 값이 있으면
 * http(s) URL만 허용. bio는 최대 길이 제한. 연락처는 가입 필수 항목이라 빈 값이 될 수
 * 없다(서버도 공백만 보내면 422). 에러 맵(필드명→메시지)을 반환하며 통과하면 빈 객체.
 */
import { MESSAGES } from './profile.data';

export const BIO_MAX = 500;

export function isUrl(x) {
  if (!x) return true; // 선택 입력 — 빈값 통과
  try {
    const u = new URL(x);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProfile(values) {
  const errors = {};
  if (!values.phone || !values.phone.trim()) {
    errors.phone = MESSAGES.phoneRequired;
  }
  if (values.bio && values.bio.length > BIO_MAX) {
    errors.bio = `자기소개는 ${BIO_MAX}자 이내로 작성해 주세요.`;
  }
  if (!isUrl(values.githubUrl)) {
    errors.githubUrl = 'http(s):// 로 시작하는 주소를 입력해 주세요.';
  }
  if (!isUrl(values.blogUrl)) {
    errors.blogUrl = 'http(s):// 로 시작하는 주소를 입력해 주세요.';
  }
  return errors;
}
