/**
 * Login form validators — pure boolean predicates, no UI.
 * The page composes these with MESSAGES (login.data.js) to build error maps.
 */

export const isEmail = (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);

export const isHanyang = (x) => /@hanyang\.ac\.kr$/i.test(String(x).trim());

export const isStudentId = (x) => /^\d{8,10}$/.test(String(x).trim());

// 8+ chars including a letter, a digit, and a symbol.
export const isStrongPw = (x) =>
  x.length >= 8 && /[A-Za-z]/.test(x) && /\d/.test(x) && /[^A-Za-z0-9]/.test(x);

// 휴대전화 — 010 등 11자리(또는 10자리). 하이픈·공백은 허용하되 무시한다.
export const isPhone = (x) => /^01[016789]\d{7,8}$/.test(String(x).replace(/[\s-]/g, ''));

// 기수 — 숫자만(예: 41) 또는 "41기" 형태.
export const isGen = (x) => /^\d{1,3}기?$/.test(String(x).trim());

// 와이어 정규화: 기수는 숫자만 남긴다("41기" → "41").
export const genDigits = (x) => String(x).replace(/\D/g, '');

// 와이어 정규화: 휴대전화는 하이픈 포함 형식으로(010-1234-5678).
// 11자리는 3-4-4, 10자리는 3-3-4. 그 외 길이는 입력값 그대로 둔다.
export const formatPhone = (x) => {
  const d = String(x).replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return x;
};
