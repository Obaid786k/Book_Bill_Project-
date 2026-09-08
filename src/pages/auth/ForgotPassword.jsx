import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { authService } from '../../services/authService';
import { useToast } from '../../components/feedback/Toast';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import { clsx } from 'clsx';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { status, secondsLeft, trigger: triggerResetResend, startCooldown } = useResendCooldown(30);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [resendError, setResendError] = useState('');

  // Cross-tab auto-detection when user finishes reset password flow in another tab
  useEffect(() => {
    if (!isSuccess) return;

    // Clear any leftover flag before we start waiting
    localStorage.removeItem('bb_password_reset');

    const intervalId = setInterval(() => {
      if (localStorage.getItem('bb_password_reset') === 'true') {
        localStorage.removeItem('bb_password_reset');
        navigate('/dashboard', { replace: true });
      }
    }, 1500);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setIsTimedOut(true);
    }, 300000); // 5 minutes

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isSuccess, resetCount, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    clearErrors();
    try {
      // Supabase enumeration protection: resetPasswordForEmail returns no error
      // whether email exists or not. Control flow proceeds identically for all inputs.
      await authService.resetPassword(data.email);
      setSubmittedEmail(data.email);
      startCooldown(30);
      setIsSuccess(true);
    } catch (err) {
      // Handle genuine failures (e.g. rate-limits, network offline)
      setError('root', { message: err.message || 'Failed to send reset link. Please try again.' });
    }
  };

  const handleResendReset = async () => {
    setResendError('');
    try {
      await triggerResetResend(async () => {
        await authService.resetPassword(submittedEmail);
        setIsTimedOut(false);
        setResetCount(prev => prev + 1);
        toast("Reset link sent ✓");
      });
    } catch (err) {
      setResendError(err.message || 'Failed to resend reset link');
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-navy-lt/10 rounded-full flex items-center justify-center text-navy mx-auto mb-6 relative">
          {!isTimedOut && <Loader2 size={64} className="absolute inset-0 text-navy/20 animate-spin-slow" />}
          <CheckCircle2 size={32} className="relative z-10" />
        </div>

        <h2 className="text-2xl font-bold text-navy mb-2">Check your email</h2>

        {!isTimedOut ? (
          <div className="text-[13px] text-ink2 mb-6 leading-relaxed space-y-3">
            <p>
              If an account exists for <span className="font-semibold text-ink">{submittedEmail}</span>, we've sent a link to reset your password. It may take a few minutes to arrive — don't forget to check your spam folder.
            </p>
            <p className="text-xs text-ink3">
              Didn't get it? Double-check the email address, or use the button below to resend.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <Alert
              variant="warning"
              message="Still waiting? If an account exists, check your spam folder or make sure the email was entered correctly. You can resend the email below."
            />
          </div>
        )}

        {resendError && (
          <div className="mb-4">
            <Alert variant="error" message={resendError} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant={isTimedOut ? "primary" : "outline"}
            className={clsx(
              "w-full transition-colors duration-150",
              status === 'cooldown' && "text-ink3"
            )}
            onClick={handleResendReset}
            isLoading={status === 'sending'}
            disabled={status !== 'idle'}
          >
            {status === 'sending'
              ? 'Sending...'
              : status === 'cooldown'
                ? `Resend email in ${secondsLeft}s`
                : (isTimedOut ? 'Resend reset link' : 'Resend email')
            }
          </Button>

          {isTimedOut && (
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy text-center mb-2">Reset password</h2>
      <p className="text-[13px] text-ink2 text-center mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <TextInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        {errors.root && (
          <Alert variant="error" message={errors.root.message} />
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="inline-flex items-center gap-1 text-[12px] text-ink2 hover:text-navy font-semibold transition-colors">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );

};

export default ForgotPassword;
