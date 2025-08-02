import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = false,
      dot = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center font-medium transition-colors duration-200';
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-gray-100 text-gray-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      destructive: 'bg-red-100 text-red-800',
      outline: 'border border-gray-300 text-gray-700 bg-transparent'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm'
    };

    const classes = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      rounded ? 'rounded-full' : 'rounded-md',
      className
    );

    return (
      <span ref={ref} className={classes} {...props}>
        {dot && (
          <span className={cn(
            'w-2 h-2 rounded-full mr-1.5',
            variant === 'default' && 'bg-gray-400',
            variant === 'primary' && 'bg-primary-500',
            variant === 'secondary' && 'bg-gray-500',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'destructive' && 'bg-red-500',
            variant === 'outline' && 'bg-gray-400'
          )} />
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'ml-1.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600',
              'hover:bg-gray-200 focus:bg-gray-200'
            )}
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge; 