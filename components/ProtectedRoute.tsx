
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';
import { UserRole } from '../types';

const ProtectedRoute: React.FC<{ children: React.ReactElement, adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-gray-50">
                <div className="flex flex-col items-center">
                    <ICONS.JurisControlLogo className="w-12 h-12 text-brand-blue-600 animate-pulse"/>
                    <p className="mt-4 text-lg font-semibold text-brand-gray-700">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user?.role !== UserRole.Admin) {
        // Non-admins trying to access admin pages are sent to their default page
        const defaultPath = user?.role === UserRole.Advogado ? '/processes' : '/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    // Redirect 'Advogado' users away from the dashboard
    if (user?.role === UserRole.Advogado && location.pathname.startsWith('/dashboard')) {
        return <Navigate to="/processes" replace />;
    }

    return children;
};

export default ProtectedRoute;