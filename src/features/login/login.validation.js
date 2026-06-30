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
