import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useResendCooldown
 * Shared cooldown state machine for resend email actions.
 * States: 'idle' | 'sending' | 'cooldown'
 * Exposes: { status, secondsLeft, trigger, startCooldown }
 * 
 * @param {number} cooldownSeconds Default duration in seconds (30s)
 * @param {object} options Configuration options
 * @param {boolean} options.autoStart Whether to immediately enter cooldown on mount (e.g., initial email send)
 */
export const useResendCooldown = (cooldownSeconds = 30, { autoStart = false } = {}) => {
  const [status, setStatus] = useState(autoStart ? 'cooldown' : 'idle');
  const [secondsLeft, setSecondsLeft] = useState(autoStart ? cooldownSeconds : 0);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback((duration = cooldownSeconds) => {
    clearTimer();
    setStatus('cooldown');
    setSecondsLeft(duration);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setStatus('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds, clearTimer]);

  useEffect(() => {
    if (autoStart) {
      startCooldown(cooldownSeconds);
    }
    return () => clearTimer();
  }, [autoStart, cooldownSeconds, startCooldown, clearTimer]);

  const trigger = useCallback(async (sendFn) => {
    if (status === 'sending' || status === 'cooldown') return;

    setStatus('sending');
    clearTimer();

    try {
      if (sendFn) {
        await sendFn();
      }
      // On success, start cooldown countdown
      startCooldown(cooldownSeconds);
    } catch (err) {
      // Revert to idle on error so user can re-try
      setStatus('idle');
      throw err;
    }
  }, [status, cooldownSeconds, clearTimer, startCooldown]);

  return {
    status,
    secondsLeft,
    trigger,
    startCooldown,
  };
};

export default useResendCooldown;
