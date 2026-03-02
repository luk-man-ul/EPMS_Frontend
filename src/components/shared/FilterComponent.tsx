interface FilterOption {
  value: string;
  label: string;
}

interface FilterComponentProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
}

const FilterComponent = ({ 
  label, 
  options, 
  value, 
  onChange,
  allowClear = true 
}: FilterComponentProps) => {
  const isActive = value !== null && value !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#666666',
      }}>
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        style={{
          padding: '10px 16px',
          border: `1px solid ${isActive ? '#1a1a1a' : '#e5e5e5'}`,
          borderRadius: '10px',
          fontSize: '14px',
          background: isActive ? '#ffffff' : '#fafafa',
          transition: 'all 0.2s ease',
          outline: 'none',
          cursor: 'pointer',
          fontWeight: isActive ? 500 : 400,
          color: isActive ? '#1a1a1a' : '#666666',
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.borderColor = '#1a1a1a';
        }}
        onBlur={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#fafafa';
            e.currentTarget.style.borderColor = '#e5e5e5';
          }
        }}
      >
        {allowClear && (
          <option value="">All</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterComponent;
