import React from 'react';
import { Select } from 'antd';

export interface SearchableSelectProps<T = string> {
  value?: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const SearchableSelect = <T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  error = false
}: SearchableSelectProps<T>) => {
  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  return (
    <Select
      showSearch
      value={value || undefined}
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={onChange}
      onSearch={onSearch}
      disabled={disabled}
      className={`${className} ${error ? 'ant-select-error' : ''}`}
      style={{ width: '100%', height: '48px' }}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      allowClear={true}
    />
  );
};

export default SearchableSelect;