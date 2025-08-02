import React from 'react';
import { cn } from '@/utils/cn';
import { Button, Input } from '@/components/ui';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  actions,
  className
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between p-6 bg-white border-b border-gray-200',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {title && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              leftIcon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </form>
        )}

        {actions && <div className="flex items-center space-x-2">{actions}</div>}

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4H4v1zM10 5h10V4H10v1zM4 9h6V8H4v1zM10 9h10V8H10v1zM4 13h6v-1H4v1zM10 13h10v-1H10v1z"
              />
            </svg>
          </Button>

          <Button variant="ghost" size="sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4H4v1zM10 5h10V4H10v1zM4 9h6V8H4v1zM10 9h10V8H10v1zM4 13h6v-1H4v1zM10 13h10v-1H10v1z"
              />
            </svg>
          </Button>

          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 