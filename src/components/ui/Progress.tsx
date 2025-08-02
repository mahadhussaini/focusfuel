import React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside';
  animated?: boolean;
  striped?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      labelPosition = 'top',
      animated = false,
      striped = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    };

    const variants = {
      default: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      destructive: 'bg-red-600'
    };

    const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
    const progressClasses = cn(
      'h-full transition-all duration-300 ease-out',
      variants[variant],
      animated && 'animate-pulse',
      striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px]'
    );

    const containerClasses = cn(
      baseClasses,
      sizes[size],
      className
    );

    return (
      <div className="w-full space-y-1">
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        
        <div ref={ref} className={containerClasses} {...props}>
          <div
            className={progressClasses}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>

        {showLabel && labelPosition === 'bottom' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">{Math.round(percentage)}%</span>
          </div>
        )}

        {showLabel && labelPosition === 'inside' && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow-sm">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress; 