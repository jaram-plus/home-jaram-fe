/**
 * react-hook-form + Zod 래퍼. (DEVELOPMENT.md §4 useForm.js · 폼 있는 경우)
 *
 *   const form = useZodForm(settingsSchema, defaults);
 *   <input {...form.register('semester')} />
 *   <form onSubmit={form.handleSubmit(onValid)}> …
 *
 * zodResolver 를 미리 물려 둔 얇은 래퍼입니다. 설정 폼(SettingsView)과
 * 행 추가 모달(AddRowModal)이 사용합니다.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useZodForm(schema, defaultValues) {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });
}
