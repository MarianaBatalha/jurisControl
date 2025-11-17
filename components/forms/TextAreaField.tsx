import React from 'react';

interface TextAreaFieldProps {
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ name, label, value, onChange, onBlur, placeholder, rows = 4, error }) => {
    const errorId = error ? `${name}-error` : undefined;
    return (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-brand-gray-700 mb-1">{label}</label>
        <textarea 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange}
            onBlur={onBlur} 
            placeholder={placeholder} 
            rows={rows}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors bg-brand-gray-50 text-brand-gray-900 placeholder:text-brand-gray-400 ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-gray-300 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500'}`}
        />
        {error && <p id={errorId} className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
)};

export default TextAreaField;
