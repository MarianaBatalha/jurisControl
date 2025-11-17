import React from 'react';

import Header from '../components/Header';
import Modal from '../components/Modal';
import NewPaymentForm from '../components/NewPaymentForm';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';

import { ICONS, PAYMENT_TYPES } from '../constants';
import { Payment, PaymentStatus, PaymentOrigin } from '../types';
import { PAGE_SIZE } from '../api';
import { usePayments } from '../hooks/usePayments';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const PaymentCard: React.FC<{ payment: Payment; onEdit: () => void; onDelete: () => void; }> = ({ payment, onEdit, onDelete }) => {
    const statusVariant = {
        [PaymentStatus.Paid]: 'success',
        [PaymentStatus.Pending]: 'warning',
        [PaymentStatus.Overdue]: 'destructive',
        [PaymentStatus.Canceled]: 'secondary'
    } as const;
    
    const isActuallyOverdue = payment.isOverdue && (payment.status === PaymentStatus.Overdue || payment.status === PaymentStatus.Pending);
    const dueDateColor = isActuallyOverdue ? 'text-red-500 font-bold' : 'text-brand-gray-800';

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <ICONS.Payments className="w-5 h-5 text-green-500" />
                    <div>
                        <p className="font-bold text-brand-gray-800 flex items-center gap-2">
                            {payment.processNumber}
                            {isActuallyOverdue && <span aria-label="Pagamento em atraso"><ICONS.PendingPayments className="w-4 h-4 text-red-500"/></span>}
                        </p>
                        <p className="text-sm text-brand-gray-500">{payment.type} - <span className="font-medium text-indigo-600">{payment.origin}</span></p>
                    </div>
                </div>
                <Badge variant={statusVariant[payment.status]}>{payment.status}</Badge>
            </div>
            <div className="space-y-3 text-sm border-t pt-4">
                <InfoRow icon={<ICONS.Payments />} label="Valor" value={payment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} valueClass="text-green-600 font-bold" />
                <InfoRow icon={<ICONS.Calendar />} label="Vencimento" value={`${new Date(payment.dueDate).toLocaleDateString('pt-BR')} ${isActuallyOverdue ? '(Vencido)' : ''}`} valueClass={dueDateColor} />
                 <InfoRow icon={<ICONS.CheckCircle />} label="Pagamento" value={payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('pt-BR') : '-'} />
                <InfoRow icon={<ICONS.Processes />} label="Forma" value={payment.paymentMethod} />
                {payment.documents && payment.documents.map((doc, index) => (
                    <InfoRow key={index} icon={<ICONS.File />} label={`Doc. ${index + 1}`} value={doc.name} valueClass="text-brand-blue-600 truncate hover:underline cursor-pointer"/>
                ))}
            </div>
            <div className="mt-auto pt-4 border-t">
                 {payment.observations && (
                    <div className="bg-brand-gray-50 p-3 rounded-md mb-4">
                        <p className="text-sm font-semibold text-brand-gray-700 mb-1">Observações:</p>
                        <p className="text-sm text-brand-gray-600">{payment.observations}</p>
                    </div>
                 )}
                 <div className="flex justify-end gap-2">
                    <Button variant="destructive-ghost" size="icon-sm" onClick={onDelete} aria-label={`Excluir pagamento do processo ${payment.processNumber}`}>
                        <ICONS.Trash className="w-4 h-4"/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Editar pagamento do processo ${payment.processNumber}`}>
                        <ICONS.Edit className="w-4 h-4"/>
                        Editar
                    </Button>
                </div>
            </div>
        </div>
    );
};

const PaymentCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-end">
             <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string, valueClass?: string }> = ({ icon, label, value, valueClass = 'text-brand-gray-800' }) => (
    <div className="flex items-center text-brand-gray-600">
        <span className="w-5">{icon}</span>
        <span className="font-semibold w-24 ml-2">{label}:</span>
        <span className={`flex-1 min-w-0 ${valueClass}`}>{value}</span>
    </div>
);

const statusColors: { [key in PaymentStatus]: { bg: string; text: string; border: string; ring: string; } } = {
    [PaymentStatus.Pending]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', ring: 'focus:ring-orange-500' },
    [PaymentStatus.Paid]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', ring: 'focus:ring-green-500' },
    [PaymentStatus.Overdue]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', ring: 'focus:ring-red-500' },
    [PaymentStatus.Canceled]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', ring: 'focus:ring-gray-500' },
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-brand-gray-600 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);


const Payments: React.FC = () => {
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
        handleFilterChange,
        handleCheckboxChange,
        totalActiveFilters,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        paymentsData,
        isLoadingPayments,
        allProcesses,
        isSaving,
        isDeleting,
        isExporting,
        handleSave,
        handleDeleteConfirm,
        handleApplyFilters,
        handleClearFilters,
        handleExport,
        totalPages
    } = usePayments();


    const renderContent = () => {
        if (isLoadingPayments && !paymentsData) {
            return Array.from({ length: PAGE_SIZE }).map((_, i) => <PaymentCardSkeleton key={i} />);
        }
        if (paymentsData?.data.length === 0) {
            const emptyTitle = searchQuery ? "Nenhum pagamento encontrado" : (totalActiveFilters > 0 ? "Nenhum pagamento corresponde aos filtros" : "Nenhum pagamento cadastrado");
            const emptyMessage = searchQuery ? "Tente ajustar sua busca ou limpar os filtros." : (totalActiveFilters > 0 ? "Tente ajustar ou limpar os filtros aplicados." : "Comece cadastrando seu primeiro pagamento para gerenciá-lo aqui.");

            return (
              <div className="lg:col-span-3">
                <EmptyState
                  icon={<ICONS.Payments />}
                  title={emptyTitle}
                  message={emptyMessage}
                  action={!searchQuery && totalActiveFilters === 0 && (
                    <Button variant="success" onClick={() => setModalState({ type: 'new' })}>
                        + Novo Pagamento
                    </Button>
                  )}
                />
              </div>
            );
        }
        return paymentsData?.data.map(p => (
            <PaymentCard 
                key={p.id} 
                payment={p} 
                onEdit={() => setModalState({ type: 'edit', data: p })}
                onDelete={() => setConfirmDelete(p)}
            />
        ));
    };

    return (
        <div>
            <Header title="Controle de Pagamentos" subtitle="Gestão de pagamentos e parcelas dos processos trabalhistas">
                 <Button variant="success" onClick={() => setModalState({ type: 'new' })}>
                    + Novo Pagamento
                </Button>
            </Header>

             <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full group">
                    <label htmlFor="search-payments" className="sr-only">Buscar pagamentos</label>
                    <ICONS.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400 group-focus-within:text-brand-blue-600 transition-colors" />
                    <input 
                        id="search-payments"
                        type="text" 
                        placeholder="Buscar por número do processo ou tipo de pagamento..." 
                        className="w-full pl-11 pr-4 py-2.5 bg-brand-gray-100 border-2 border-transparent rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:bg-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 text-brand-gray-800 placeholder:text-brand-gray-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <label htmlFor="sort-payments" className="sr-only">Ordenar pagamentos</label>
                    <select
                        id="sort-payments"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-brand-gray-700 bg-white border border-brand-gray-300 rounded-md shadow-sm hover:bg-brand-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
                    >
                        <option value="due_date_desc">Vencimento Mais Recente</option>
                        <option value="due_date_asc">Vencimento Mais Antigo</option>
                        <option value="value_desc">Maior Valor</option>
                        <option value="value_asc">Menor Valor</option>
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
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        isLoading={isExporting}
                        disabled={isExporting}
                    >
                        <ICONS.Download className="w-4 h-4"/>
                        Exportar
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {renderContent()}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <Modal isOpen={modalState.type !== null} onClose={() => setModalState({ type: null })} title={modalState.type === 'edit' ? "Editar Pagamento" : "Novo Pagamento"}>
                <NewPaymentForm 
                    onClose={() => setModalState({ type: null })}
                    onSave={handleSave}
                    isSaving={isSaving}
                    initialData={modalState.data}
                    processes={allProcesses}
                />
            </Modal>
             <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirm}
                isConfirming={isDeleting}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir este pagamento do processo ${confirmDelete?.processNumber}?`}
                confirmText="Excluir"
            />
            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setFilterPanelOpen(false)}
                title="Filtros de Pagamentos"
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            >
                 <FilterSection title="Status">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(PaymentStatus).map(status => {
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

                <FilterSection title="Tipo de Pagamento">
                    <div className="grid grid-cols-1 gap-2">
                        {PAYMENT_TYPES.map(type => {
                            const isChecked = filters.type.includes(type);
                            const uniqueId = `type-${type.replace(/\s+/g, '-')}`;
                            return (
                                <div key={type}>
                                    <input
                                        type="checkbox"
                                        id={uniqueId}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('type', type)}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor={uniqueId}
                                        className={`w-full text-left flex items-center text-sm font-medium p-3 rounded-lg border cursor-pointer transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                                            isChecked
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-500'
                                            : 'border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-300 hover:bg-brand-gray-50 focus:ring-blue-500'
                                        }`}
                                    >
                                         <span className={`w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${isChecked ? 'bg-blue-500' : 'bg-brand-gray-300'}`}></span>
                                        {type}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </FilterSection>

                <FilterSection title="Origem">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(PaymentOrigin).map(origin => {
                            const isChecked = filters.origin.includes(origin);
                            const uniqueId = `origin-${origin.replace(/\s+/g, '-')}`;
                            return (
                                <div key={origin}>
                                    <input
                                        type="checkbox"
                                        id={uniqueId}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange('origin', origin)}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor={uniqueId}
                                        className={`w-full text-center block text-sm font-medium p-3 rounded-lg border cursor-pointer transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                                            isChecked
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 focus:ring-indigo-500'
                                            : 'border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-300 hover:bg-brand-gray-50 focus:ring-indigo-500'
                                        }`}
                                    >
                                        {origin}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </FilterSection>

                <FilterSection title="Data de Vencimento">
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="minDueDate" className="sr-only">De</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-brand-gray-500">De:</div>
                                <input id="minDueDate" type="date" name="minDueDate" value={filters.minDueDate} onChange={handleFilterChange} className="w-full text-right pr-3 pl-12 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="maxDueDate" className="sr-only">Até</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-brand-gray-500">Até:</div>
                                <input id="maxDueDate" type="date" name="maxDueDate" value={filters.maxDueDate} onChange={handleFilterChange} className="w-full text-right pr-3 pl-12 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900" />
                            </div>
                        </div>
                    </div>
                </FilterSection>

                <FilterSection title="Valor da Parcela (R$)">
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="minValue" className="sr-only">Mínimo</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-brand-gray-500">R$</div>
                                <input id="minValue" type="number" name="minValue" placeholder="Mínimo" value={filters.minValue} onChange={handleFilterChange} className="w-full pl-9 pr-3 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900 placeholder:text-brand-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="maxValue" className="sr-only">Máximo</label>
                            <div className="relative">
                                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-brand-gray-500">R$</div>
                                <input id="maxValue" type="number" name="maxValue" placeholder="Máximo" value={filters.maxValue} onChange={handleFilterChange} className="w-full pl-9 pr-3 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900 placeholder:text-brand-gray-400" />
                            </div>
                        </div>
                    </div>
                </FilterSection>
            </FilterPanel>
        </div>
    );
};

export default Payments;