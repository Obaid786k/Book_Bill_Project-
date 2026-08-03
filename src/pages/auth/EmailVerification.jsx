import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../components/feedback/Toast';

const EmailVerification = () => {
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || 'your email';
  
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast("Verification link resent successfully.");
    } catch (err) {
      toast("Failed to resend link. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-navy-lt/10 rounded-full flex items-center justify-center text-navy mx-auto mb-6">
        <Mail size={32} />
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2">Verify your email</h2>
      <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
        We've sent a verification link to <span className="font-semibold text-ink">{email}</span>. 
        Please click the link to activate your account.
      </p>
      
      <div className="flex flex-col gap-3">
        <Link to="/login">
          <Button variant="primary" className="w-full">
            Proceed to Login <ArrowRight size={16} />
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleResend}
          isLoading={isResending}
        >
          Resend verification link
        </Button>
      </div>
    </div>
  );
};

export default EmailVerification;
