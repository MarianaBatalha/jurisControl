import React from 'react';

interface InputFieldProps {
    name: string;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
    error?: string;
    icon?: React.ReactElement<{ className?: string }>;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, onBlur, placeholder, type = "text", required = false, readOnly = false, error, icon }) => {
    const errorId = error ? `${name}-error` : undefined;
    const hasIcon = icon !== undefined;
    return (
    <div className="flex-1">
        <label htmlFor={name} className="block text-sm font-medium text-brand-gray-700 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
             {hasIcon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   {React.cloneElement(icon, { className: "w-5 h-5 text-brand-gray-400" })}
                </div>
            )}
            <input 
                id={name} 
                name={name} 
                type={type} 
                value={value} 
                onChange={onChange}
                onBlur={onBlur} 
                placeholder={placeholder} 
                required={required}
                readOnly={readOnly}
                aria-invalid={!!error}
                aria-describedby={errorId}
                className={`w-full ${hasIcon ? 'pl-10' : 'px-3'} py-2 border rounded-lg shadow-sm transition-colors ${readOnly ? 'bg-brand-gray-100 text-brand-gray-500 cursor-not-allowed' : 'bg-brand-gray-50 text-brand-gray-900 placeholder:text-brand-gray-400'} ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-gray-300 focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500'}`}
            />
        </div>
        {error && <p id={errorId} className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
)};

export default InputField;
