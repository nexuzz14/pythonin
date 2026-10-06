import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function Badge({
  variant = 'blue',
  size = 'sm',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-bold rounded-full transition-colors';

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-xs sm:text-sm',
  }[size];

  // Seluruh warna dioptimalkan agar memenuhi standar rasio kontras WCAG AA (>= 4.5:1)
  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200/80',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    slate: 'bg-slate-100 text-slate-800 border border-slate-200/80',
  }[variant];

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
