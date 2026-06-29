import { useState, useCallback } from 'react';

/**
 * Minimal controlled-form helper (shared shape with the login page).
 *
 *   const f = useForm({ title: '', recruit: '' });
 *   <Input value={f.values.title} onChange={f.field('title')} error={f.errors.title} />
 *
 * `field(name)` returns an onChange handler that updates the value and clears
 * that field's error. `setErrors` replaces the whole error map after validation.
 * `reset()` restores the initial values and clears errors.
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
