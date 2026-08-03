import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { jaramMark } from './login.assets';
import { useForm } from './useForm';
import { MESSAGES, LOGIN_ERROR, SIGNUP_ERROR, FACULTY_ETC, newcomerGen } from './login.data';
import { isEmail, isHanyang, isStudentId, isStrongPw, isPhone, isGen, genNumber, formatPhone } from './login.validation';
import * as api from './login.api';
import { useLoginMutation } from './useLoginMutation';
import {
  AuthHeader,
  LoginView,
  SignupView,
  SignupStep2View,
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
 * Submit handlers validate locally, then call the real Spring endpoints via
 * login.api.js (paths are a proposed REST contract until the backend
 * confirms them — see that file's header). The reset step still opens the
 * next screen through a local shortcut instead of a real emailed link
 * (see ResetSentView's `onOpenLink`).
 */
export default function LoginPage({ initialView = 'login' }) {
  const navigate = useNavigate();
  const [view, setView] = useState(initialView); // login | signup | signup2 | signupDone | reset | resetSent | resetNew | resetDone
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const login = useForm({ email: '', pw: '' });
  const signup = useForm({
    // 1단계
    name: '', sid: '', email: '', pw: '', pw2: '',
    // 2단계 (추가 정보)
    studentType: 'current', gen: '', facultyChoice: '', facultyEtc: '', phone: '', enrolled: true,
  });
  const reset = useForm({ email: '' });
  const newPw = useForm({ pw: '', pw2: '' });

  const loginMutation = useLoginMutation({
    // 로그인 성공 → 홈으로 이동. replace로 뒤로가기 시 로그인 화면이 다시 뜨지 않게 한다.
    onSuccess: () => navigate('/', { replace: true }),
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

  // --- signup 1단계: 기본 정보 검증 후 2단계로 ---
  function submitSignupStep1() {
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
    setView('signup2');
  }

  // --- signup 2단계: 추가 정보 검증 후 최종 신청 ---
  async function submitSignup() {
    const v = signup.values;
    const e = {};
    if (v.studentType === 'current' && !isGen(v.gen)) e.gen = MESSAGES.genRequired;
    if (!v.facultyChoice) e.facultyChoice = MESSAGES.facultyRequired;
    else if (v.facultyChoice === FACULTY_ETC && !v.facultyEtc.trim()) e.facultyEtc = MESSAGES.facultyEtcRequired;
    if (!v.phone.trim()) e.phone = MESSAGES.phoneRequired;
    else if (!isPhone(v.phone)) e.phone = MESSAGES.phoneFormat;
    if (Object.keys(e).length) {
      signup.setErrors(e);
      return;
    }
    signup.setErrors({});
    setFormError('');
    setLoading(true);
    try {
      await api.signup({
        name: v.name,
        studentId: v.sid,
        email: v.email,
        password: v.pw,
        // studentType은 그대로 보내지 않고 두 값으로 풀어 보낸다.
        // 기수: 재학생은 입력값, 신입생은 가입 연도 기준 자동 계산. 와이어는 정수.
        gen: genNumber(v.studentType === 'current' ? v.gen : String(newcomerGen())),
        faculty: v.facultyChoice === FACULTY_ETC ? v.facultyEtc.trim() : v.facultyChoice,
        phone: formatPhone(v.phone),
        enrolled: v.enrolled,
        // 등급: 서버가 이 값으로 정한다(신입생→수습회원, 재학생→준회원). 기수와 무관하다.
        newcomer: v.studentType === 'new',
      });
      setView('signupDone');
    } catch (err) {
      if (err && err.code === 'EMAIL_TAKEN') {
        // 이메일 중복은 1단계 필드 → 1단계로 되돌려 보여준다.
        signup.setErrors({ email: MESSAGES.emailTaken });
        setView('signup');
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
          {view === 'signup' && <SignupView form={signup} loading={loading} formError={formError} onSubmit={submitSignupStep1} onLogin={() => go('login')} />}
          {view === 'signup2' && (
            <SignupStep2View
              form={signup}
              loading={loading}
              formError={formError}
              onSubmit={submitSignup}
              onBack={() => { setFormError(''); setView('signup'); }}
            />
          )}
          {view === 'signupDone' && <SignupDoneView onLogin={() => go('login')} />}
          {view === 'reset' && <ResetRequestView form={reset} onSubmit={submitResetSend} onLogin={() => go('login')} />}
          {view === 'resetSent' && <ResetSentView onOpenLink={() => go('resetNew')} onLogin={() => go('login')} />}
          {view === 'resetNew' && <ResetNewView form={newPw} onSubmit={submitNewPw} onRetry={() => go('reset')} />}
          {view === 'resetDone' && <ResetDoneView onLogin={() => go('login')} />}
        </div>
      </main>
    </div>
  );
}
