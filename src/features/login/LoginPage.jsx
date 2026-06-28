import React, { useState, useRef, useCallback } from 'react';
import './login.css';
import { jaramMark } from './login.assets';
import { useForm } from './useForm';
import { MESSAGES, LOGIN_ERROR, SIGNUP_ERROR, TOAST } from './login.data';
import { isEmail, isHanyang, isStudentId, isStrongPw } from './login.validation';
import * as api from './login.api';
import { useLoginMutation } from './useLoginMutation';
import {
  AuthHeader,
  Toast,
  LoginView,
  SignupView,
  SignupDoneView,
  ResetRequestView,
  ResetSentView,
  ResetNewView,
  ResetDoneView,
} from './views';

/**
 * JARAM auth page — login, membership application (officer approval), and
 * password reset, as a single-route view machine.
 *
 * `view` selects the screen; each form's state lives in its own `useForm`.
 * Submit handlers validate locally, then call the placeholder API in
 * login.api.js — wire those to the Spring backend and replace the demo
 * navigation (toast on success, demo reset-link shortcut) with real routing.
 */
export default function LoginPage({ initialView = 'login' }) {
  const [view, setView] = useState(initialView); // login | signup | signupDone | reset | resetSent | resetNew | resetDone
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const login = useForm({ email: '', pw: '' });
  const signup = useForm({ name: '', sid: '', email: '', pw: '', pw2: '' });
  const reset = useForm({ email: '' });
  const newPw = useForm({ pw: '', pw2: '' });

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const loginMutation = useLoginMutation({
    onSuccess: () => {
      showToast(TOAST.login);
      // TODO: redirect into the authenticated area, e.g. navigate('/');
    },
    onError: (err) => setFormError(LOGIN_ERROR[err && err.code] || LOGIN_ERROR.SERVER),
  });

  const go = useCallback(
    (next) => {
      setView(next);
      setFormError('');
      setLoading(false);
      loginMutation.reset();
      login.setErrors({});
      signup.setErrors({});
      reset.setErrors({});
      newPw.setErrors({});
    },
    [login, signup, reset, newPw, loginMutation],
  );

  // --- login ---
  function submitLogin() {
    const v = login.values;
    const e = {};
    if (!v.email.trim()) e.email = MESSAGES.emailRequired;
    else if (!isEmail(v.email)) e.email = MESSAGES.emailFormat;
    else if (!isHanyang(v.email)) e.email = MESSAGES.emailHanyang;
    if (!v.pw) e.pw = MESSAGES.pwRequired;
    if (Object.keys(e).length) {
      login.setErrors(e);
      return;
    }
    login.setErrors({});
    setFormError('');
    loginMutation.mutate({ email: v.email, password: v.pw });
  }

  // --- signup ---
  async function submitSignup() {
    const v = signup.values;
    const e = {};
    if (!v.name.trim()) e.name = MESSAGES.nameRequired;
    if (!isStudentId(v.sid)) e.sid = MESSAGES.sidRequired;
    if (!v.email.trim() || !isEmail(v.email) || !isHanyang(v.email)) e.email = MESSAGES.emailHanyang;
    if (!isStrongPw(v.pw)) e.pw = MESSAGES.pwRule;
    if (v.pw2 !== v.pw || !v.pw2) e.pw2 = MESSAGES.pwMismatch;
    if (Object.keys(e).length) {
      signup.setErrors(e);
      return;
    }
    signup.setErrors({});
    setFormError('');
    setLoading(true);
    try {
      await api.signup({ name: v.name, studentId: v.sid, email: v.email, password: v.pw });
      setView('signupDone');
    } catch (err) {
      if (err && err.code === 'EMAIL_TAKEN') {
        signup.setErrors({ email: MESSAGES.emailTaken });
      } else {
        setFormError(SIGNUP_ERROR.SERVER);
      }
    } finally {
      setLoading(false);
    }
  }

  // --- reset ---
  async function submitResetSend() {
    const v = reset.values;
    const e = {};
    if (!v.email.trim()) e.email = MESSAGES.emailRequired;
    else if (!isEmail(v.email) || !isHanyang(v.email)) e.email = MESSAGES.emailHanyang;
    if (Object.keys(e).length) {
      reset.setErrors(e);
      return;
    }
    reset.setErrors({});
    try {
      await api.requestReset({ email: v.email });
    } catch (_) {
      /* show the same confirmation regardless, to avoid leaking which emails exist */
    }
    setView('resetSent');
  }

  async function submitNewPw() {
    const v = newPw.values;
    const e = {};
    if (!isStrongPw(v.pw)) e.pw = MESSAGES.pwRule;
    if (v.pw2 !== v.pw || !v.pw2) e.pw2 = MESSAGES.pwMismatch;
    if (Object.keys(e).length) {
      newPw.setErrors(e);
      return;
    }
    newPw.setErrors({});
    try {
      await api.resetPassword({ token: '<from URL>', password: v.pw });
    } catch (_) {
      /* surface a real error here in production */
    }
    setView('resetDone');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <AuthHeader />

      <main
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 6vw, 5rem) var(--container-pad)',
          overflow: 'hidden',
        }}
      >
        <img
          src={jaramMark}
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', right: -60, bottom: -80, height: 'clamp(280px, 34vw, 460px)', opacity: 0.05, pointerEvents: 'none' }}
        />

        <div style={{ position: 'relative', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          {view === 'login' && (
            <LoginView form={login} loading={loginMutation.isPending} formError={formError} onSubmit={submitLogin} onSignup={() => go('signup')} onReset={() => go('reset')} />
          )}
          {view === 'signup' && <SignupView form={signup} loading={loading} formError={formError} onSubmit={submitSignup} onLogin={() => go('login')} />}
          {view === 'signupDone' && <SignupDoneView onLogin={() => go('login')} />}
          {view === 'reset' && <ResetRequestView form={reset} onSubmit={submitResetSend} onLogin={() => go('login')} />}
          {view === 'resetSent' && <ResetSentView onOpenLink={() => go('resetNew')} onLogin={() => go('login')} />}
          {view === 'resetNew' && <ResetNewView form={newPw} onSubmit={submitNewPw} onRetry={() => go('reset')} />}
          {view === 'resetDone' && <ResetDoneView onLogin={() => go('login')} />}
        </div>
      </main>

      <Toast message={toast} />
    </div>
  );
}
