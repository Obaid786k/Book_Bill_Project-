import React, { createContext, useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

const ToastContext = createContext(null);

const MAX_TOASTS = 3;
const DURATION = { success: 3000, info: 3000, error: 6000 };
const ICONS = {
  success: { Icon: CheckCircle2, cls: 'text-green' },
  error: { Icon: AlertCircle, cls: 'text-red' },
  info: { Icon: Info, cls: 'text-navy' },
};

// Old call sites pass "✅ Saved" / "❌ Failed" / "🖨️ ..." — map the emoji to a type and strip it.
const LEADING_EMOJI = /^[\p{Extended_Pictographic}️‍\s]+/u;
const fromLegacy = (msg) => {
  const text = String(msg ?? '');
  let type = 'info';
  if (text.startsWith('✅')) type = 'success';
  else if (text.startsWith('❌')) type = 'error';
  return { type, message: text.replace(LEADING_EMOJI, '') };
};

const ToastItem = ({ t, onDismiss }) => {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(t.duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return undefined;
    startedAt.current = Date.now();
    const id = setTimeout(() => onDismiss(t.id), remaining.current);
    return () => {
      clearTimeout(id);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, t.id, onDismiss]);

  const { Icon, cls } = ICONS[t.type] || ICONS.info;
  const isError = t.type === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="pointer-events-auto w-full md:w-auto md:max-w-[360px] bg-paper border border-bb2 rounded-[12px] shadow-[0_8px_24px_rgba(15,28,46,.12)] px-3.5 py-2.5 flex items-center gap-2.5 font-body"
    >
      <Icon size={18} className={clsx('shrink-0', cls)} />
      <p className="flex-1 min-w-0 text-[14px] font-medium text-ink leading-snug">{t.message}</p>
      {t.action && (
        <button
          type="button"
          onClick={() => { t.action.onClick?.(); onDismiss(t.id); }}
          className={clsx('shrink-0 text-[13px] font-bold rounded px-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            /undo/i.test(t.action.label) ? 'text-red' : 'text-navy')}
        >
          {t.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(t.id)}
        aria-label="Dismiss"
        className="shrink-0 p-1 rounded text-ink3 hover:text-ink hover:bg-row-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  // Stable function: toast(msg) plus toast.success / toast.error / toast.info(msg, { action, duration }).
  const toast = useMemo(() => {
    const push = (type, message, opts = {}) => {
      nextId.current += 1;
      const item = {
        id: nextId.current,
        type,
        message,
        action: opts.action,
        duration: opts.duration ?? DURATION[type],
      };
      setToasts((prev) => [...prev, item].slice(-MAX_TOASTS));
    };
    const fn = (msg, opts) => {
      const { type, message } = fromLegacy(msg);
      push(type, message, typeof opts === 'number' ? { duration: opts } : opts || {});
    };
    fn.success = (msg, opts) => push('success', msg, opts);
    fn.error = (msg, opts) => push('error', msg, opts);
    fn.info = (msg, opts) => push('info', msg, opts);
    return fn;
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[9999] bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 flex flex-col items-stretch md:items-end gap-2 pointer-events-none no-print">
        <AnimatePresence initial={false}>
          {toasts.map((t) => <ToastItem key={t.id} t={t} onDismiss={dismiss} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
