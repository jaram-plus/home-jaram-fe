import { useState, useCallback } from 'react';

/**
 * Minimal controlled-form helper (shared shape with login/study).
 * field(name) → value 갱신 + 해당 필드 에러 제거. setErrors는 검증 후 에러 맵 교체.
 * reset()은 초기값 복원 + 에러 제거.
 */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const field = useCallback(
    (name) => (e) => {
      const v = e && e.target ? e.target.value : e;
      setValues((s) => ({ ...s, [name]: v }));
      setErrors((s) => {
        if (!s[name]) return s;
        const next = { ...s };
        delete next[name];
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
  }, [initial]);

  return { values, setValues, errors, setErrors, field, reset };
}
