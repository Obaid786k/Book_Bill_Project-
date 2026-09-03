import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import GlobalLoading from '../../components/common/states/GlobalLoading';

const EmailConfirmed = () => {
  const { isInitializing } = useAuthStore();

  const handleClose = () => {
    try {
      window.close();
    } catch (e) {
      // Browser blocked window.close() silently
    }
  };

  if (isInitializing) {
    return <GlobalLoading />;
  }

  return (
    <div className="text-center py-4 animation-fade-in">
      <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green mx-auto mb-4 relative">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2">Verified! You're all set.</h2>
      <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
        Your email has been successfully verified.<br/>
        If you have your original tab open, it will now advance automatically.
      </p>
      <Button 
        variant="primary" 
        className="w-full" 
        onClick={handleClose}
      >
        Close this tab
      </Button>
    </div>
  );
};

export default EmailConfirmed;
