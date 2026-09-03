import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { TextInput } from '../../components/forms/TextInput';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isBusinessSetup } = useAuthStore();

  // Redirect already-logged-in users away from the login page
  if (isAuthenticated) {
    return <Navigate to={isBusinessSetup ? '/dashboard' : '/setup'} replace />;
  }
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const user = await authService.login(data.email, data.password);
      login(user);
      
      if (user.hasCompletedSetup) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      setError('root', { message: err.message || 'Login failed' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy text-center mb-2">Sign in to your account</h2>
      <p className="text-[13px] text-ink2 text-center mb-8">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-navy/30 text-navy font-semibold hover:bg-navy/5 hover:border-navy transition-colors"
        >
          Sign up free
        </Link>
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
          <div className="text-red text-[12px] bg-red-bg/20 p-2 rounded text-center">
            {errors.root.message}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </div>
  );
};

export default Login;
