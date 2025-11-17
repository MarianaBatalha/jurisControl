import React from 'react';

import Header from '../components/Header';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';

import { ICONS } from '../constants';
import { User, UserStatus, UserRole } from '../types';
import { useUsers } from '../hooks/useUsers';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';


const USERS_PAGE_SIZE = 8;

const UserTableRowSkeleton: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-gray-200"></div>
                <div className="ml-4">
                    <div className="h-4 bg-brand-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-brand-gray-200 rounded w-40 mt-1"></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-brand-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-20 bg-brand-gray-200 rounded-full"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-brand-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">
            <div className="h-4 bg-brand-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end gap-2">
                <div className="h-8 w-8 bg-brand-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-brand-gray-200 rounded"></div>
            </div>
        </td>
    </tr>
);

const roleColors: { [key in UserRole]: { bg: string; text: string; border: string; ring: string; } } = {
    [UserRole.Admin]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', ring: 'focus:ring-purple-500' },
    [UserRole.Advogado]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', ring: 'focus:ring-blue-500' },
};

const statusColors: { [key in UserStatus]: { bg: string; text: string; border: string; ring: string; } } = {
    [UserStatus.Active]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', ring: 'focus:ring-green-500' },
    [UserStatus.Inactive]: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', ring: 'focus:ring-yellow-500' },
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-brand-gray-600 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);


const AdminUsers: React.FC = () => {
    const {
        modalState,
        setModalState,
        confirmDelete,
        setConfirmDelete,
        searchQuery,
        setSearchQuery,
        isFilterPanelOpen,
        setFilterPanelOpen,
        filters,
        handleCheckboxChange,
        totalActiveFilters,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        usersData,
        isLoading,
        isSaving,
        isDeleting,
        handleSave,
        handleDeleteConfirm,
        handleApplyFilters,
        handleClearFilters,
        totalPages,
    } = useUsers();

    const renderContent = () => {
        if (isLoading && !usersData) {
            return Array.from({ length: USERS_PAGE_SIZE }).map((_, i) => <UserTableRowSkeleton key={i} />);
        }
        if (usersData?.data.length === 0) {
            const emptyTitle = searchQuery || totalActiveFilters > 0 ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado";
            const emptyMessage = searchQuery || totalActiveFilters > 0 ? "Tente ajustar sua busca ou limpar os filtros." : "Comece cadastrando um novo usuário para gerenciar o acesso.";
            return (
                <tr>
                    <td colSpan={6}>
                        <div className="py-10">
                            <EmptyState
                              icon={<ICONS.User />}
                              title={emptyTitle}
                              message={emptyMessage}
                              action={!searchQuery && totalActiveFilters === 0 ? (
                                <Button onClick={() => setModalState({ type: 'new' })}>
                                    + Adicionar Usuário
                                </Button>
                              ) : undefined}
                            />
                        </div>
                    </td>
                </tr>
            );
        }
        return usersData?.data.map(user => {
            const statusVariant = user.status === UserStatus.Active ? 'success' : 'yellow';

            return (
                <tr key={user.id} className="hover:bg-brand-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-brand-gray-200 rounded-full flex items-center justify-center">
                                <ICONS.User className="w-6 h-6 text-brand-gray-500"/>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-brand-gray-900">{user.name}</div>
                                <div className="text-sm text-brand-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-600">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={statusVariant}>
                            {user.status}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500 font-mono">{user.password}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <Button variant="primary-ghost" size="icon-sm" onClick={() => setModalState({type: 'edit', data: user})} aria-label={`Editar usuário ${user.name}`}>
                                <ICONS.Edit className="w-5 h-5"/>
                            </Button>
                            <Button variant="destructive-ghost" size="icon-sm" onClick={() => setConfirmDelete(user)} aria-label={`Excluir usuário ${user.name}`}>
                                <ICONS.Trash className="w-5 h-5"/>
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div>
            <Header title="Gerenciamento de Usuários" subtitle="Adicione, edite e gerencie o acesso dos usuários ao sistema">
                <Button onClick={() => setModalState({ type: 'new' })}>
                    + Adicionar Usuário
                </Button>
            </Header>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full group">
                    <label htmlFor="search-users" className="sr-only">Buscar usuários</label>
                    <ICONS.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400 group-focus-within:text-brand-blue-600 transition-colors" />
                    <input 
                        id="search-users"
                        type="text" 
                        placeholder="Buscar por nome ou e-mail..." 
                        className="w-full pl-11 pr-4 py-2.5 bg-brand-gray-100 border-2 border-transparent rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:bg-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 text-brand-gray-800 placeholder:text-brand-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                     <label htmlFor="sort-users" className="sr-only">Ordenar usuários</label>
                    <select
                        id="sort-users"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-brand-gray-700 bg-white border border-brand-gray-300 rounded-md shadow-sm hover:bg-brand-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
                    >
                        <option value="date_desc">Mais Recente</option>
                        <option value="date_asc">Mais Antigo</option>
                        <option value="name_asc">Nome A-Z</option>
                        <option value="name_desc">Nome Z-A</option>
                    </select>
                    <Button 
                        variant="outline"
                        onClick={() => setFilterPanelOpen(true)}
                        aria-expanded={isFilterPanelOpen}
                        aria-controls="filter-panel"
                        className="relative"
                    >
                        <ICONS.Filter className="w-4 h-4"/>
                        Filtros
                        {totalActiveFilters > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue-600 text-white text-xs" aria-hidden="true">
                                {totalActiveFilters}
                            </span>
                        )}
                         <span className="sr-only">{totalActiveFilters} filtros ativos</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-gray-200">
                        <thead className="bg-brand-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Usuário</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Nível de Acesso</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Senha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Data de Criação</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-200">
                            {renderContent()}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Modal 
                isOpen={modalState.type !== null} 
                onClose={() => setModalState({ type: null })} 
                title={modalState.type === 'edit' ? "Editar Usuário" : "Novo Usuário"}
            >
                <UserForm 
                    onClose={() => setModalState({ type: null })} 
                    onSave={handleSave}
                    isSaving={isSaving}
                    initialData={modalState.data}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirm}
                isConfirming={isDeleting}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o usuário ${confirmDelete?.name}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
            />
            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setFilterPanelOpen(false)}
                title="Filtros de Usuários"
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            >
                <FilterSection title="Nível de Acesso">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(UserRole).map(role => {
                            const isChecked = filters.role.includes(role);
                            const colors = roleColors[role];
                            const uniqueId = `role-${role.replace(/\s+/g, '-')}`;
                            return (
                                <div key={role}>
                                    <input
                                        type="checkbox"
                                        id={uniqueId}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('role', role)}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor={uniqueId}
                                        className={`w-full text-center block text-sm font-medium p-3 rounded-lg border cursor-pointer transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                                            isChecked
                                            ? `${colors.bg} ${colors.text} ${colors.border} ${colors.ring}`
                                            : `border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-300 hover:bg-brand-gray-50 ${colors.ring}`
                                        }`}
                                    >
                                        {role}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </FilterSection>

                <FilterSection title="Status">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(UserStatus).map(status => {
                            const isChecked = filters.status.includes(status);
                            const colors = statusColors[status];
                            const uniqueId = `status-${status.replace(/\s+/g, '-')}`;
                            return (
                                <div key={status}>
                                    <input
                                        type="checkbox"
                                        id={uniqueId}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('status', status)}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor={uniqueId}
                                        className={`w-full text-center block text-sm font-medium p-3 rounded-lg border cursor-pointer transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                                            isChecked
                                            ? `${colors.bg} ${colors.text} ${colors.border} ${colors.ring}`
                                            : `border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-300 hover:bg-brand-gray-50 ${colors.ring}`
                                        }`}
                                    >
                                        {status}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </FilterSection>
            </FilterPanel>
        </div>
    );
};

export default AdminUsers;