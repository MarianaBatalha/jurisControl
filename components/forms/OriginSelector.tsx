import React from 'react';
import { PaymentOrigin } from '../../types';

interface OriginSelectorProps {
    label: string;
    value: string;
    onChange: (newValue: PaymentOrigin) => void;
    error?: string;
    required?: boolean;
}

const OriginSelector: React.FC<OriginSelectorProps> = ({ label, value, onChange, error, required = false }) => {
    const options = Object.values(PaymentOrigin);
    return (
        <div>
            <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                {label}{required && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-brand-gray-200 p-1" role="radiogroup">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray-200 ${
                            value === option
                                ? 'bg-white text-brand-blue-700 shadow-sm'
                                : 'bg-transparent text-brand-gray-600 hover:bg-brand-gray-300/50'
                        }`}
                        aria-pressed={value === option}
                        role="radio"
                        aria-checked={value === option}
                    >
                        {option}
                    </button>
                ))}
            </div>
             {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default OriginSelector;
