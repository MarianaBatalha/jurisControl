
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Processes from './pages/Processes';
import Payments from './pages/Payments';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUsers from './pages/AdminUsers';
import { UserRole } from './types';


const queryClient = new QueryClient();

const AppLayout: React.FC = () => (
  <div className="flex h-screen bg-brand-gray-100">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </main>
  </div>
);

// This component will handle the initial redirect based on the user's role.
const RootRedirector: React.FC = () => {
  const { user } = useAuth();
  const defaultPath = user?.role === UserRole.Advogado ? '/processes' : '/dashboard';
  return <Navigate to={defaultPath} replace />;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* The index route now intelligently redirects based on role */}
              <Route index element={<RootRedirector />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="processes" element={<Processes />} />
              <Route path="payments" element={<Payments />} />
              <Route 
                path="admin/users"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </HashRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
            },
            error: {
               style: {
                background: '#fef2f2',
                color: '#b91c1c',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;