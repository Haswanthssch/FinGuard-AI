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
        <label className="block text-body font-medium text-gray-900 mb-sm">
          {label}
          {props.required && <span className="text-red-500 ml-xs">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-lg top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          className={cn(
            'w-full px-lg py-md border rounded-md text-body transition-all duration-200',
            'placeholder-gray-400 text-gray-900',
            'focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500',
            icon && iconPosition === 'left' && 'pl-2xl',
            icon && iconPosition === 'right' && 'pr-2xl',
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
          <div className="absolute right-lg top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-caption text-red-600 mt-sm">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-caption text-gray-500 mt-sm">{helperText}</p>
      )}
    </div>
  );
}
