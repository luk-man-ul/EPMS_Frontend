import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
}

const SearchBar = ({ 
  placeholder, 
  value, 
  onChange, 
  onClear,
  debounceMs = 300 
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div style={{ position: 'relative', width: '320px' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 16px',
          paddingRight: localValue ? '40px' : '16px',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          fontSize: '14px',
          background: '#fafafa',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.borderColor = '#1a1a1a';
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = '#fafafa';
          e.currentTarget.style.borderColor = '#e5e5e5';
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#666666',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
