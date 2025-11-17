
import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-gray-900">{title}</h1>
                <p className="text-brand-gray-500 mt-1">{subtitle}</p>
            </div>
            {children && <div>{children}</div>}
        </div>
    );
};

export default Header;
