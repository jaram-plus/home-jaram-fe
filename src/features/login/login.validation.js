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
