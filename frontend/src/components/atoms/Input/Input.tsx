import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          className={cn(
            'w-full px-4 py-2.5 border rounded-md text-sm transition-all duration-200',
            'placeholder-gray-400 text-gray-900',
            'focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error
              ? 'border-red-500 bg-red-50 focus:ring-red-100 focus:border-red-500'
              : 'border-gray-200 bg-white hover:border-gray-300',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
            className
          )}
          disabled={disabled}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">
          {typeof error === 'string'
            ? error
            : (error as any)?.message || 'Invalid input'}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
