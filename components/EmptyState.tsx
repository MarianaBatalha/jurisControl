import React from 'react';

interface EmptyStateProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string;
    message: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
    return (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue-100">
                 {React.cloneElement(icon, { className: "w-8 h-8 text-brand-blue-600" })}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-brand-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-brand-gray-500">{message}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;
