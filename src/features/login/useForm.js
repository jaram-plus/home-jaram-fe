import { useState, useCallback } from 'react';

/**
 * Minimal controlled-form helper used by the login views.
 *
 *   const f = useForm({ email: '', pw: '' });
 *   <Input value={f.values.email} onChange={f.field('email')} error={f.errors.email} />
 *
 * `field(name)` returns an onChange handler that updates the value and clears
 * that field's error. `setErrors` replaces the whole error map after validation.
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

  return { values, setValues, errors, setErrors, field };
}
