import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-900 border border-gray-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  const sizeStyles = {
    sm: 'px-md py-xs text-caption',
    md: 'px-lg py-sm text-caption',
    lg: 'px-xl py-md text-body',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-sm rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
