import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuthPolling = (onSuccess) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  // Store callback in a ref so changing it never restarts the polling interval
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const checkSession = async () => {
      // Skip poll when the tab is hidden — saves unnecessary Supabase calls
      if (document.visibilityState === 'hidden') return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        onSuccessRef.current(session);
      }
    };

    // Poll every 3 seconds
    intervalId = setInterval(checkSession, 3000);

    // Stop after 5 minutes (300_000 ms)
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setIsTimedOut(true);
    }, 300000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []); // ← empty deps: interval starts once, never restarts

  return { isTimedOut };
};
