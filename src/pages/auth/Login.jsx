import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Mail, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBusinessSetup } = useAuthStore();
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Always call hooks before any early return (React Rules of Hooks)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Redirect already-logged-in users away from the login page
  if (isAuthenticated) {
    return <Navigate to={isBusinessSetup ? '/dashboard' : '/setup'} replace />;
  }

  const onSubmit = async (data) => {
    setIsUnconfirmed(false);
    setResendStatus('');
    setSubmittedEmail(data.email);
    try {
      const user = await authService.login(data.email, data.password);
      login(user);
      
      if (user.hasCompletedSetup) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      const isNotConfirmed = err.code === 'email_not_confirmed' || (err.message && err.message.toLowerCase().includes('verify your email'));
      if (isNotConfirmed) {
        setIsUnconfirmed(true);
      }
      setError('root', { message: err.message || 'Login failed' });
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    setResendStatus('sending');
    try {
      await authService.resendVerification(submittedEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy text-center mb-2">Sign in to your account</h2>
      <p className="text-[13px] text-ink2 text-center mb-8">
        Enter your credentials to access your billing workspace.
      </p>

      {location.state?.verifiedNotice && (
        <div className="mb-6">
          <Alert
            variant="success"
            message="Your email has been successfully verified! You can now sign in to your account."
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <TextInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-ink2 uppercase tracking-[0.3px]">Password</label>
            <Link to="/forgot-password" className="text-[11px] font-semibold text-navy hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        {errors.root && (
          isUnconfirmed ? (
            <Alert
              variant="warning"
              icon={Mail}
              title="Email verification required"
              message="Please check your inbox for the confirmation link to activate your account."
              action={
                <div className="w-full flex items-center justify-between">
                  {resendStatus === 'sent' ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-green">
                      <CheckCircle2 size={13} /> Fresh link sent! Check your inbox.
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      isLoading={resendStatus === 'sending'}
                      disabled={resendStatus === 'sending'}
                      className="text-[11.5px] font-semibold bg-white"
                    >
                      <Mail size={12} />
                      Resend verification email
                    </Button>
                  )}
                  {resendStatus === 'error' && (
                    <span className="text-[11.5px] text-ink2 font-medium">
                      Failed to resend. Try again.
                    </span>
                  )}
                </div>
              }
            />
          ) : (
            <Alert variant="error" message={errors.root.message} />
          )
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Sign in
        </Button>

        <p className="text-[12px] text-ink2 text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-navy hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
