import React, { useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import './profile.css';
import { Header } from '@/shared/ui/Header';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useForm } from './useForm';
import { useMe, useUpdateMe } from './profile.queries';
import { validateProfile } from './profile.validation';
import { MESSAGES, TOAST } from './profile.data';
import { ProfileView, EditView, Toast } from './views';

/**
 * /profile — 로그인한 회원의 개인 정보 보기/수정.
 * 미인증이면 /login으로 보낸다(가드). 진입 시 GET /api/me로 읽기 모드,
 * "수정"으로 수정 모드 전환, "저장"은 PATCH /api/me → 토스트 + 읽기 모드 복귀.
 * 422 fieldErrors는 폼 에러 맵으로, 그 외 오류는 폼 레벨 메시지로 표시.
 */
export default function ProfilePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <ProfileInner />;
}

function ProfileInner() {
  const { data: me, isLoading, isError } = useMe();
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const form = useForm({ bio: '', githubUrl: '', blogUrl: '' });

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const update = useUpdateMe({
    onSuccess: () => {
      setEditing(false);
      setFormError('');
      showToast(TOAST.saved);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const fieldErrors = err?.response?.data?.fieldErrors;
      if (status === 422 && fieldErrors) form.setErrors(fieldErrors);
      else setFormError(MESSAGES.saveError);
    },
  });

  const startEdit = () => {
    form.setValues({
      bio: me.bio ?? '',
      githubUrl: me.githubUrl ?? '',
      blogUrl: me.blogUrl ?? '',
    });
    form.setErrors({});
    setFormError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    form.reset();
    setFormError('');
    setEditing(false);
  };

  const save = () => {
    const errors = validateProfile(form.values);
    if (Object.keys(errors).length) {
      form.setErrors(errors);
      return;
    }
    setFormError('');
    update.mutate(form.values);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <Header />
      <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-9) var(--container-pad)' }}>
        {isLoading && (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>{MESSAGES.loading}</p>
        )}
        {isError && (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--brand)' }}>{MESSAGES.loadError}</p>
        )}
        {me && !editing && <ProfileView me={me} onEdit={startEdit} />}
        {me && editing && (
          <EditView
            me={me}
            values={form.values}
            errors={form.errors}
            field={form.field}
            onSave={save}
            onCancel={cancelEdit}
            saving={update.isPending}
            formError={formError}
          />
        )}
      </main>
      <Toast message={toast} />
    </div>
  );
}
