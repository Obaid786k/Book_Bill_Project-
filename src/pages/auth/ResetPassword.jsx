import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { settingsService } from '../../services/settingsService';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { passwordSchema } from '../../lib/validation';
import { getFriendlyError } from '../../utils/errorMessages';
import { supabase } from '../../lib/supabaseClient';
import GlobalLoading from '../../components/common/states/GlobalLoading';

const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ["password"],
    });
  }
});

const ResetPassword = () => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid' | 'success'
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(resetSchema)
  });

  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const fullUrl = (hash + ' ' + search).toLowerCase();

    // 1. Check for error in hash FIRST before anything else decides what to show
    if (
      fullUrl.includes('error=access_denied') || 
      fullUrl.includes('error_code=otp_expired') ||
      fullUrl.includes('otp_expired')
    ) {
      const friendly = getFriendlyError({ code: 'otp_expired' });
      setErrorMessage(friendly.message);
      setStatus('invalid');
      return;
    }

    if (fullUrl.includes('error=')) {
      const friendly = getFriendlyError({ code: 'access_denied' });
      setErrorMessage(friendly.message);
      setStatus('invalid');
      return;
    }

    let isMounted = true;

    // 2. Check if a recovery session is already active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setStatus('valid');
      }
    });

    // 3. Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setStatus('valid');
      }
    });

    // 4. If no recovery session arrives after a grace timeout, treat link as invalid/expired
    const timeoutId = setTimeout(async () => {
      if (!isMounted) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const friendly = getFriendlyError({ code: 'otp_expired' });
        setErrorMessage(friendly.message);
        setStatus('invalid');
      }
    }, 2500);

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      await settingsService.changePassword(null, data.password);
      setStatus('success');
      localStorage.setItem('bb_password_reset', 'true');
    } catch (err) {
      setError('root', { message: err.message || 'Failed to update password' });
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch {
      // Ignore
    }
  };

  if (status === 'checking') {
    return <GlobalLoading />;
  }

  if (status === 'invalid') {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4 relative">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Link Expired or Already Used</h2>
        <p className="text-[13px] text-ink2 mb-8 leading-relaxed max-w-sm mx-auto">
          {errorMessage || "This password reset link is invalid or has already expired. For your security, reset links can only be used once."}
        </p>
        <Button variant="primary" className="w-full" onClick={handleClose}>
          Close this tab
        </Button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green mx-auto mb-6 relative">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Password Updated</h2>
        <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
          Your password has been successfully reset.<br/>
          You can now close this tab and return to your original session, or log in again.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="primary" className="w-full" onClick={handleClose}>
            Close this tab
          </Button>
          <Link to="/login">
            <Button variant="outline" className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-navy text-center mb-2">Set new password</h2>
      <p className="text-[13px] text-ink2 text-center mb-8">
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <PasswordInput
          label="New Password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
          hint="Must be at least 6 characters with uppercase, lowercase, number & symbol."
        />
        
        <PasswordInput
          label="Confirm New Password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          hint="Must be at least 6 characters with uppercase, lowercase, number & symbol."
        />
        
        {errors.root && (
          <Alert variant="error" message={errors.root.message} />
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Update password
        </Button>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-[12px] text-ink2 hover:text-navy font-semibold transition-colors">
            <ArrowLeft size={13} /> Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
