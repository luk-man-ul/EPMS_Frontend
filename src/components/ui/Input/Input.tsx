import React from 'react';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea';

export interface InputProps {
  type?: InputType;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
  name?: string;
  id?: string;
}

export function Input({
  type = 'text',
  label,
  error,
  helperText,
  required,
  disabled,
  placeholder,
  value,
  onChange,
  rows = 3,
  className = '',
  name,
  id,
}: InputProps) {
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };
  
  const inputId = id || name || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  const inputElement = type === 'textarea' ? (
    <textarea
      id={inputId}
      name={name}
      className={`${baseClasses} ${errorClasses} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      rows={rows}
    />
  ) : (
    <input
      id={inputId}
      name={name}
      type={type}
      className={`${baseClasses} ${errorClasses} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      required={required}
    />
  );
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {inputElement}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
