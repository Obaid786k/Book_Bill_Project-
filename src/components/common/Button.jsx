import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, toolbar-outline, toolbar-ghost
  size = 'default', // default, sm, icon
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  // Mirroring .btn classes from reference_invoice exactly
  const baseClasses = "font-body font-semibold border-none rounded-[5px] cursor-pointer inline-flex items-center gap-[5px] transition-all duration-150 active:scale-[0.97] whitespace-nowrap justify-center outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
  
  const sizeClasses = {
    default: "text-[12.5px] py-[7px] px-[13px]",
    sm: "text-[12px] py-[5px] px-[10px] rounded-[4px]",
    icon: "p-[7px]",
    'icon-sm': "p-[2px] text-[13px]" // For tight spaces like invoice rows
  };

  const variantClasses = {
    primary: "bg-gold text-white hover:opacity-90",
    secondary: "bg-transparent border-solid border border-navy text-navy hover:bg-row-alt",
    navy: "bg-navy text-white hover:opacity-90",
    danger: "bg-red text-white hover:opacity-90",
    // Standard light-theme versions for general app usage
    outline: "bg-transparent text-ink border-solid border border-bb hover:bg-row-alt",
    ghost: "bg-transparent text-ink hover:bg-row-alt",
    'ghost-danger': "bg-transparent text-red hover:bg-red-bg",
    dashed: "bg-green/10 text-green border border-dashed border-green/30 hover:bg-green/20",
    // Dark-theme versions exactly matching reference invoice toolbar
    'toolbar-outline': "bg-transparent text-white/80 border-solid border border-white/20 hover:bg-white/10",
    'toolbar-ghost': "bg-white/10 text-white border-solid border border-white/20 hover:bg-white/20",
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
};
