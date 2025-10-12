import './Input.css';
import * as React from 'react';

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  disabled=false
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 ${className}`}>
      {label && <label className="text-gray-600 text-sm sm:w-1/3">{label}</label>}
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-gray-400 rounded-md p-2 text-sm sm:text-base w-full"
      />
    </div>
  );
}
