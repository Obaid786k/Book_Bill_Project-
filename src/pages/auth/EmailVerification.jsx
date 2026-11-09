import React, { useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { authService } from '../../services/authService';
import { useToast } from '../../components/feedback/Toast';
import { useAuthStore } from '../../store/authStore';
import { useAuthPolling } from '../../hooks/useAuthPolling';
import { useResendCooldown } from '../../hooks/useResendCooldown';
import { clsx } from 'clsx';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Kept in sessionStorage so a page refresh doesn't lose it.
  const email = (() => {
    const fromState = location.state?.email;
    try {
      if (fromState) sessionStorage.setItem('bb_verify_email', fromState);
      return fromState || sessionStorage.getItem('bb_verify_email') || '';
    } catch {
      return fromState || '';
    }
  })();

  const { login } = useAuthStore();
  const { status, secondsLeft, trigger } = useResendCooldown(30, { autoStart: true });

  const onVerified = useCallback(async () => {
    // Fetch fresh user data directly — avoids calling initialize() again
    // which would register a duplicate onAuthStateChange listener.
    const userData = await authService.getCurrentUser();
    if (userData) {
      login(userData);
      navigate(userData.hasCompletedSetup ? '/dashboard' : '/setup', { replace: true });
    }
  }, [login, navigate]);

  const { isTimedOut } = useAuthPolling(onVerified);

  const handleResend = async () => {
    try {
      await trigger(async () => {
        await authService.resendVerification(email);
        toast.success("Verification email sent");
      });
    } catch {
      toast.error("Failed to resend link. Please try again.");
    }
  };

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-navy-lt/10 rounded-full flex items-center justify-center text-navy mx-auto mb-6 relative">
        {!isTimedOut && <Loader2 size={64} className="absolute inset-0 text-navy/20 animate-spin-slow" />}
        <Mail size={32} className="relative z-10" />
      </div>
      
      <h2 className="text-2xl font-bold text-navy mb-2">Verify your email</h2>
      
      {!isTimedOut ? (
        <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
          We've sent a verification link to <span className="font-semibold text-ink">{email || 'your email'}</span>. <br/><br/>
          We're waiting for you to click the link in your email — this page will update automatically once you do.
        </p>
      ) : (
        <div className="mb-6">
          <Alert
            variant="warning"
            message="Still waiting? The link might have expired or hasn't arrived. You can resend the email below."
          />
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        {email && (
        <Button
          variant={isTimedOut ? "primary" : "outline"}
          className={clsx(
            "w-full transition-colors duration-150",
            status === 'cooldown' && "text-ink3"
          )}
          onClick={handleResend}
          isLoading={status === 'sending'}
          disabled={status !== 'idle'}
        >
          {status === 'sending'
            ? 'Sending...'
            : status === 'cooldown'
            ? `Resend email in ${secondsLeft}s`
            : (isTimedOut ? 'Resend verification link' : 'Resend email')
          }
        </Button>
        )}

        {(isTimedOut || !email) && (
          <Link to="/login">
            <Button variant="outline" className="w-full">
              {email ? 'Return to Login' : 'Go to Login'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
