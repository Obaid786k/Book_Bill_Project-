import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/common/Button';
import { settingsService } from '../../services/settingsService';
import { CheckCircle2 } from 'lucide-react';
import { passwordSchema } from '../../lib/validation';

const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data) => {
    try {
      await settingsService.changePassword(null, data.password);
      setIsSuccess(true);
      localStorage.setItem('bb_password_reset', 'true');
      // We no longer auto-logout or auto-redirect here, 
      // as the user might be returning to their original tab.
    } catch (err) {
      setError('root', { message: err.message || 'Failed to update password' });
    }
  };

  const handleClose = () => {
    try {
      window.close();
    } catch (e) {
      // Ignore
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
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
    <div>
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
        />
        
        {errors.root && (
          <div className="text-red text-[12px] bg-red-bg/20 p-2 rounded text-center">
            {errors.root.message}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
