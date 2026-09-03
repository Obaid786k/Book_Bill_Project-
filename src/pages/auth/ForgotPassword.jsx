import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  
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
  }, [isSuccess, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      setError('root', { message: err.message || 'Failed to send reset link' });
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendError('');
    try {
      await authService.resetPassword(submittedEmail);
      window.location.reload();
    } catch (err) {
      // Use local state — the form (and its setError) is unmounted at this point
      setResendError(err.message || 'Failed to resend reset link');
    } finally {
      setIsResending(false);
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
          <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
            We've sent a password reset link to your email address. <br/><br/>
            We're waiting for you to click the link in your email — this page will update automatically once you do.
          </p>
        ) : (
          <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
            Still waiting? The link might have expired or hasn't arrived. You can resend the email below.
          </p>
        )}

        {resendError && (
          <div className="text-red text-[12px] bg-red-bg/20 p-2 rounded text-center mb-4">
            {resendError}
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {isTimedOut ? (
            <>
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleResend}
                isLoading={isResending}
              >
                Resend reset link
              </Button>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleResend}
              isLoading={isResending}
            >
              Resend email
            </Button>
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
          {...register('email')}
          error={errors.email?.message}
        />
        
        {errors.root && (
          <div className="text-red text-[12px] bg-red-bg/20 p-2 rounded text-center">
            {errors.root.message}
          </div>
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
