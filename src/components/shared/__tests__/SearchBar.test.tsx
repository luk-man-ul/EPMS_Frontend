import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchBar placeholder="Search..." value="" onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeDefined();
  });

  it('calls onChange after debounce', async () => {
    const onChange = vi.fn();
    render(<SearchBar placeholder="Search..." value="" onChange={onChange} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 200 });
  });

  it('shows clear button when value is present', () => {
    const onChange = vi.fn();
    render(<SearchBar placeholder="Search..." value="test" onChange={onChange} />);
    
    const clearButton = screen.getByText('✕');
    expect(clearButton).toBeDefined();
  });

  it('clears value when clear button is clicked', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar placeholder="Search..." value="test" onChange={onChange} onClear={onClear} />);
    
    const clearButton = screen.getByText('✕');
    fireEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });
});
