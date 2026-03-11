import React from 'react';

export type ErrorType = 'field' | 'form' | 'page';

export interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  type = 'field',
  onDismiss,
  className = '',
}: ErrorMessageProps) {
  const typeClasses: Record<ErrorType, string> = {
    field: 'text-sm text-red-600',
    form: 'p-4 bg-red-50 border border-red-200 rounded-md',
    page: 'p-6 bg-red-50 border-l-4 border-red-500 rounded-md shadow-md',
  };
  
  const iconSize: Record<ErrorType, string> = {
    field: 'h-4 w-4',
    form: 'h-5 w-5',
    page: 'h-6 w-6',
  };
  
  return (
    <div className={`${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        <svg
          className={`${iconSize[type]} text-red-500 mr-2 flex-shrink-0 mt-0.5`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          {type === 'page' && (
            <h3 className="text-lg font-semibold text-red-800 mb-1">Error</h3>
          )}
          <p className={type === 'field' ? 'text-sm' : 'text-red-700'}>{message}</p>
        </div>
        {onDismiss && type !== 'field' && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
