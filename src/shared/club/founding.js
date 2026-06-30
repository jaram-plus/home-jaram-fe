/**
 * 자람 창립 기준 파생값 — 사이트 전반에서 "N년의 역사"·"N기"를 하드코딩하지
 * 않고 여기서 계산한다. 창립연도(1984) 한 곳만 바꾸면 전부 따라간다.
 *
 *   clubYears()  → 창립 이후 햇수 (예: 2026 → 42)  "42년의 역사"
 *   currentGen() → 현재 기수 (= clubYears, 예: 42)  "42기"
 */
export const FOUNDING_YEAR = 1984;

// 창립 이후 햇수 = 현재 년도 - 창립연도.
export function clubYears(now = new Date()) {
  return now.getFullYear() - FOUNDING_YEAR;
}

// 현재 기수 — 햇수와 동일한 값.
export function currentGen(now = new Date()) {
  return clubYears(now);
}

// 고유어 수 관형형 — 셈낱말(해·번째) 앞에서 쓰는 형태. 1~99 지원.
// 예: 41 → '마흔한', 42 → '마흔두', 43 → '마흔세', 40 → '마흔'.
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const NATIVE_UNITS = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];

export function koreanNativeAttr(n) {
  if (!Number.isInteger(n) || n < 1 || n > 99) return String(n);
  const unit = NATIVE_UNITS[n % 10];
  // 20 단독은 관형형이 '스무'(스무 해), 21~29는 '스물한…'.
  const tens = n === 20 ? '스무' : NATIVE_TENS[Math.floor(n / 10)];
  return tens + unit;
}

// 창립 이후 햇수의 고유어 관형형. 예: 2026 → '마흔두' ('마흔두 해').
export function clubYearsKorean(now = new Date()) {
  return koreanNativeAttr(clubYears(now));
}
