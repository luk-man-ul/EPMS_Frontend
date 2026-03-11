import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  placeholder = 'Select an option',
  multiple = false,
  disabled,
  required,
  className = '',
  name,
  id,
}: SelectProps) {
  const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      onChange?.(selected);
    } else {
      onChange?.(e.target.value);
    }
  };
  
  const selectId = id || name || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={`${baseClasses} ${errorClasses} ${className}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        multiple={multiple}
        required={required}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
