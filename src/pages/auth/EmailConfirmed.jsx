import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { getFriendlyError } from '../../utils/errorMessages';
import { supabase } from '../../lib/supabaseClient';
import GlobalLoading from '../../components/common/states/GlobalLoading';

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const [status, setStatus] = useState('checking'); // 'checking' | 'verified' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const fullUrl = (hash + ' ' + search).toLowerCase();

    // 1. Check for error in hash FIRST before any session checks
    if (
      fullUrl.includes('error=access_denied') || 
      fullUrl.includes('error_code=otp_expired') ||
      fullUrl.includes('otp_expired')
    ) {
      const friendly = getFriendlyError({ code: 'otp_expired' });
      setErrorMessage(friendly.message);
      setStatus('error');
      return;
    }

    if (fullUrl.includes('error=')) {
      const friendly = getFriendlyError({ code: 'access_denied' });
      setErrorMessage(friendly.message);
      setStatus('error');
      return;
    }

    // 2. Check if a valid session exists or is established
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('verified');
      }
    });

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session) {
        setStatus('verified');
      } else {
        // Wait briefly for Supabase to exchange hash token
        const timer = setTimeout(async () => {
          if (!isMounted) return;
          const retry = await supabase.auth.getSession();
          if (retry.data?.session) {
            setStatus('verified');
          } else {
            // No hash and no session -> direct navigation, fallback to login
            navigate('/login', { replace: true });
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleClose = () => {
    try {
      window.close();
    } catch {
      // Ignore if browser blocks window.close()
    }
  };

  if (status === 'checking' || isInitializing) {
    return <GlobalLoading />;
  }

  if (status === 'error') {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4 relative">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Link Expired or Already Used</h2>
        <p className="text-[13px] text-ink2 mb-8 leading-relaxed max-w-sm mx-auto">
          {errorMessage || 'This link has expired or has already been used. For your security, links can only be used once.'}
        </p>
        <Button variant="primary" className="w-full" onClick={handleClose}>
          Close this tab
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-4 animate-fade-in">
      <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green mx-auto mb-4 relative">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2">Verified! You're all set.</h2>
      <p className="text-[13px] text-ink2 mb-8 leading-relaxed">
        Your email has been successfully verified.<br/>
        If you have your original tab open, it will advance automatically.
      </p>
      <div className="flex flex-col gap-3">
        <Button 
          variant="primary" 
          className="w-full" 
          onClick={handleClose}
        >
          Close this tab
        </Button>
        <Link to="/dashboard">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmailConfirmed;
