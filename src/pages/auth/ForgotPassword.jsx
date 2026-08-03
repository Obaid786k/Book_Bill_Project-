import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(data.email);
      setIsSuccess(true);
    } catch (err) {
      setError('root', { message: err.message || 'Failed to send reset link' });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center text-green mx-auto mb-4">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Check your email</h2>
        <p className="text-[13px] text-ink2 mb-8">
          We've sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">Return to login</Button>
        </Link>
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
