import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const VARIANT_CONFIG = {
  warning: {
    container: 'bg-gold-bg border border-gold/30',
    icon: AlertTriangle,
    iconColor: 'text-gold',
    iconBg: 'bg-gold/10',
    titleColor: 'text-gold',
    messageColor: 'text-ink2',
    borderDivider: 'border-gold/20',
  },
  error: {
    container: 'bg-red-bg border border-red/25',
    icon: AlertCircle,
    iconColor: 'text-red',
    iconBg: 'bg-red/10',
    titleColor: 'text-red',
    messageColor: 'text-red',
    borderDivider: 'border-red/20',
  },
  success: {
    container: 'bg-green/10 border border-green/30',
    icon: CheckCircle2,
    iconColor: 'text-green',
    iconBg: 'bg-green/15',
    titleColor: 'text-green',
    messageColor: 'text-ink2',
    borderDivider: 'border-green/20',
  },
  info: {
    container: 'bg-navy-lt/10 border border-navy/20',
    icon: Info,
    iconColor: 'text-navy',
    iconBg: 'bg-navy/10',
    titleColor: 'text-navy',
    messageColor: 'text-ink2',
    borderDivider: 'border-navy/20',
  },
};

export const Alert = ({
  variant = 'info',
  title,
  message,
  children,
  action,
  icon: CustomIcon,
  className,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const IconComponent = CustomIcon || config.icon;

  // Single-line compact layout when no title/action/children
  const isCompact = !title && !action && !children;

  if (isCompact) {
    return (
      <div
        role="alert"
        className={clsx(
          'rounded-[6px] p-3 flex items-start gap-2.5 text-left',
          config.container,
          className
        )}
      >
        <IconComponent className={clsx('w-4 h-4 shrink-0 mt-0.5', config.iconColor)} />
        <div className={clsx('text-[12.5px] font-medium leading-snug flex-1 min-w-0', config.messageColor)}>
          {message}
        </div>
      </div>
    );
  }

  // Structured layout for notices with title, body, or actions
  return (
    <div
      role="alert"
      className={clsx(
        'rounded-[6px] p-3.5 flex items-start gap-3 text-left',
        config.container,
        className
      )}
    >
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          config.iconBg,
          config.iconColor
        )}
      >
        <IconComponent size={15} />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('text-[13px] font-semibold leading-tight', config.titleColor)}>
            {title}
          </p>
        )}
        {message && (
          <p className={clsx('text-[12px] leading-relaxed', title ? 'mt-1 text-ink2' : config.messageColor)}>
            {message}
          </p>
        )}
        {children && <div className="mt-1 text-[12px]">{children}</div>}
        {action && (
          <div className={clsx('mt-2.5 pt-2 border-t flex items-center justify-between', config.borderDivider)}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
