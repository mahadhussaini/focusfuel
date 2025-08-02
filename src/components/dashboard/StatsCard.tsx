import React from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader } from '@/components/ui';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  variant = 'default',
  className
}) => {
  const variants = {
    default: 'text-gray-900',
    success: 'text-success-600',
    warning: 'text-warning-600',
    destructive: 'text-red-600'
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn('text-2xl font-bold', variants[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.isPositive ? 'text-success-600' : 'text-red-600'
                  )}
                >
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <svg
                  className={cn(
                    'w-4 h-4 ml-1',
                    change.isPositive ? 'text-success-600' : 'text-red-600'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {change.isPositive ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  )}
                </svg>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                variant === 'default' && 'bg-primary-100 text-primary-600',
                variant === 'success' && 'bg-success-100 text-success-600',
                variant === 'warning' && 'bg-warning-100 text-warning-600',
                variant === 'destructive' && 'bg-red-100 text-red-600'
              )}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 