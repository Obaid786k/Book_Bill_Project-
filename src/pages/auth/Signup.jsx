import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { authService } from '../../services/authService';
import { passwordSchema } from '../../lib/validation';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  terms: z.literal(true, { message: "You must accept the terms and conditions" }),
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

const Signup = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    try {
      await authService.signup(data.name, data.email, data.password);
      // Usually after signup, we send verification email
      navigate('/verify-email', { state: { email: data.email } });
    } catch (err) {
      setError('root', { message: err.message || 'Signup failed' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy text-center mb-2">Create an account</h2>
      <p className="text-[13px] text-ink2 text-center mb-8">
        Start managing your invoices and billing in seconds.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <TextInput
          label="Full Name"
          placeholder="John Doe"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />

        <TextInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
          hint="Must be at least 6 characters with uppercase, lowercase, number & symbol."
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          hint="Must be at least 6 characters with uppercase, lowercase, number & symbol."
        />

        <div className="flex items-start gap-2 mt-1">
          <input 
            type="checkbox" 
            id="terms" 
            className="mt-1 accent-navy"
            {...register('terms')} 
          />
          <label htmlFor="terms" className="text-[12px] text-ink2 leading-snug">
            I agree to the <Link to="/terms" className="text-navy hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-navy hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && <span className="text-red text-[12px]">{errors.terms.message}</span>}

        {errors.root && (
          <Alert variant="error" message={errors.root.message} />
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Create account
        </Button>

        <p className="text-[12px] text-ink2 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
