import React from 'react';

interface SelectFieldProps {
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ name, label, value, onChange, onBlur, required, children, error }) => {
    const errorId = error ? `${name}-error` : undefined;
    return (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-brand-gray-700 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <select 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            onBlur={onBlur}
            required={required}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm bg-brand-gray-50 text-brand-gray-900 transition-colors ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-gray-300 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500'}`}
        >
            {children}
        </select>
         {error && <p id={errorId} className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
)};

export default SelectField;
