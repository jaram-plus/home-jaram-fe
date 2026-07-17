import { useState, useEffect } from 'react';

/**
 * 출석 인정 마감까지 남은 분을 센다.
 *
 * 서버가 준 절대 시각(`attendanceClosesAt`, ISO-8601)이 기준이고, 클라이언트는
 * 30초마다 로컬 시계만 다시 읽는다 — 서버 폴링이 아니다. 마감이 지났거나 값이
 * 없거나 파싱할 수 없으면 0을 돌려주고, 호출부가 문구를 숨긴다.
 *
 *   const mins = useAttendanceCountdown(seminar.attendanceClosesAt);
 */
export function useAttendanceCountdown(closesAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!closesAt) return 0;
  const closes = new Date(closesAt).getTime();
  if (Number.isNaN(closes)) return 0;
  return Math.max(0, Math.ceil((closes - now) / 60_000));
}
