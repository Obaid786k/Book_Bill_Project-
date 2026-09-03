import React, { useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../components/feedback/Toast';
import { useAuthStore } from '../../store/authStore';
import { useAuthPolling } from '../../hooks/useAuthPolling';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const email = location.state?.email || 'your email';
  
  const { login } = useAuthStore();
  const [isResending, setIsResending] = useState(false);

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
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast("Verification link resent successfully.");
    } catch {
      toast("Failed to resend link. Please try again.");
    } finally {
      setIsResending(false);
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
          We've sent a verification link to <span className="font-semibold text-ink">{email}</span>. <br/><br/>
          We're waiting for you to click the link in your email — this page will update automatically once you do.
        </p>
      ) : (
        <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
          Still waiting? The link might have expired or hasn't arrived. You can resend the email below.
        </p>
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
              Resend verification link
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
};

export default EmailVerification;
