import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import { PaymentStatus, ProcessStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useGetAllProcesses } from '../hooks/api/processes/useGetAllProcesses';
import { useGetAllPayments } from '../hooks/api/payments/useGetAllPayments';
import { Button } from './ui/Button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 border-l-4 ${
        isActive
          ? 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-600'
          : 'border-transparent text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-gray-800'
      }`
    }
  >
    <div className="w-5 h-5 mr-3">{icon}</div>
    {label}
  </NavLink>
);

interface StatusItemProps {
  label: string;
  count: number;
  color: string;
  isLoading: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, count, color, isLoading }) => (
  <div className="flex justify-between items-center text-sm text-brand-gray-600">
    <span>{label}</span>
    {isLoading ? (
      <div className="w-5 h-4 bg-brand-gray-200 rounded-full animate-pulse"></div>
    ) : (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
        {count}
      </span>
    )}
  </div>
);

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: processesData, isLoading: isLoadingProcesses } = useGetAllProcesses();
  const { data: paymentsData, isLoading: isLoadingPayments } = useGetAllPayments();


  const activeProcesses = processesData?.filter(p => p.status === ProcessStatus.InProgress).length ?? 0;
  const pendingPayments = paymentsData?.filter(p => p.status === PaymentStatus.Pending).length ?? 0;
  const dueToday = paymentsData?.filter(p => p.isOverdue).length ?? 0;

  return (
    <aside className="w-64 bg-white border-r border-brand-gray-200 flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-brand-blue-700 text-white p-2 rounded-lg">
          <ICONS.JurisControlLogo className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-lg font-bold text-brand-gray-800">JurisControl</h1>
            <p className="text-xs text-brand-gray-500">Controladoria Trabalhista</p>
        </div>
      </div>

      <nav aria-label="Navegação Principal" className="flex flex-col gap-2">
        <p className="px-4 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider" id="nav-header">Navegação Principal</p>
        {user?.role !== UserRole.Advogado && (
          <NavItem to="/dashboard" icon={<ICONS.Dashboard />} label="Dashboard" />
        )}
        <NavItem to="/processes" icon={<ICONS.Processes />} label="Processos" />
        <NavItem to="/payments" icon={<ICONS.Payments />} label="Pagamentos" />
      </nav>

      {user?.role === UserRole.Admin && (
        <div className="mt-8 pt-6 border-t border-brand-gray-200" role="region" aria-labelledby="admin-header">
            <p id="admin-header" className="px-4 mb-2 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Administração</p>
            <NavItem to="/admin/users" icon={<ICONS.AdminPanel />} label="Usuários" />
        </div>
      )}


      <div className="mt-8 pt-6 border-t border-brand-gray-200" role="region" aria-labelledby="status-header">
        <p id="status-header" className="px-4 mb-4 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Status Rápido</p>
        <div className="flex flex-col gap-3 px-4">
            <StatusItem label="Processos Ativos" count={activeProcesses} color="bg-blue-100 text-blue-800" isLoading={isLoadingProcesses} />
            <StatusItem label="Pagamentos Pendentes" count={pendingPayments} color="bg-orange-100 text-orange-800" isLoading={isLoadingPayments} />
            <StatusItem label="Em Atraso" count={dueToday} color="bg-red-100 text-red-800" isLoading={isLoadingPayments} />
        </div>
      </div>
      
      <div className="mt-auto">
        {user && (
            <div className="flex items-center gap-3 p-3 bg-brand-gray-100 rounded-lg">
                <div className="p-2 bg-brand-gray-200 rounded-full">
                    <ICONS.User className="w-5 h-5 text-brand-gray-600"/>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-brand-gray-800 truncate" title={user.name}>{user.name}</p>
                    <p className="text-xs text-brand-gray-500">{user.role}</p>
                </div>
                <Button
                    variant="destructive-ghost"
                    size="icon-sm"
                    onClick={logout}
                    aria-label="Sair"
                    className="rounded-full focus-visible:ring-red-500"
                >
                    <ICONS.Logout className="w-5 h-5" />
                </Button>
            </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
