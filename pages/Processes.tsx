import React from 'react';

import Header from '../components/Header';
import Modal from '../components/Modal';
import NewProcessForm from '../components/NewProcessForm';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';

import { ICONS } from '../constants';
import { Process, ProcessStatus, PaymentOrigin } from '../types';
import { PAGE_SIZE } from '../api';
import { useProcesses } from '../hooks/useProcesses';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const ProcessCard: React.FC<{ process: Process; onEdit: () => void; onDelete: () => void; }> = ({ process, onEdit, onDelete }) => {
    const statusVariant = {
        [ProcessStatus.InProgress]: 'primary',
        [ProcessStatus.Agreement]: 'success',
        [ProcessStatus.Completed]: 'secondary',
    } as const;
    
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <ICONS.Processes className="w-5 h-5 text-brand-blue-500" />
                    <div>
                        <p className="font-bold text-brand-gray-800">{process.processNumber}</p>
                        <p className="text-sm text-brand-gray-500">{process.actionType} - <span className="font-medium text-indigo-600">{process.origin}</span></p>
                    </div>
                </div>
                <Badge variant={statusVariant[process.status]}>{process.status}</Badge>
            </div>
            <div className="space-y-3 text-sm border-t pt-4">
                <InfoRow icon={<ICONS.User />} label="Requerente" value={process.claimant} />
                <InfoRow icon={<ICONS.Building />} label="Empresa" value={process.company} />
                <InfoRow icon={<ICONS.Calendar />} label="Data" value={new Date(process.distributionDate).toLocaleDateString('pt-BR')} />
                 <p className="text-green-600 font-bold text-lg pt-2 text-right">
                    {process.caseValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
                 <InfoRow icon={<ICONS.User />} label="Advogado" value={process.lawyer || '-'} />
                 <InfoRow icon={<ICONS.JurisControlLogo className="w-4 h-4" />} label="Tribunal" value={process.court} />
            </div>
            <div className="mt-auto pt-4 border-t flex justify-end gap-2">
                 <Button variant="destructive-ghost" size="icon-sm" onClick={onDelete} aria-label={`Excluir processo ${process.processNumber}`}>
                    <ICONS.Trash className="w-4 h-4"/>
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Editar processo ${process.processNumber}`}>
                    <ICONS.Edit className="w-4 h-4"/>
                    Editar
                </Button>
            </div>
        </div>
    );
};

const ProcessCardSkeleton: React.FC = () => (
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


const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center text-brand-gray-600">
        <span className="w-5">{icon}</span>
        <span className="font-semibold w-24 ml-2">{label}:</span>
        <span className="text-brand-gray-800">{value}</span>
    </div>
)

const statusColors: { [key in ProcessStatus]: { bg: string; text: string; border: string; ring: string; } } = {
    [ProcessStatus.InProgress]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', ring: 'focus:ring-blue-500' },
    [ProcessStatus.Agreement]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', ring: 'focus:ring-green-500' },
    [ProcessStatus.Completed]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', ring: 'focus:ring-gray-500' },
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-brand-gray-600 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);


const Processes: React.FC = () => {
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
        processesData,
        isLoading,
        isSaving,
        isDeleting,
        isExporting,
        handleSave,
        handleDeleteConfirm,
        handleApplyFilters,
        handleClearFilters,
        handleExport,
        totalPages
    } = useProcesses();


    const renderContent = () => {
        if (isLoading && !processesData) {
            return Array.from({ length: PAGE_SIZE }).map((_, i) => <ProcessCardSkeleton key={i} />);
        }
        if (processesData?.data.length === 0) {
            const emptyTitle = searchQuery ? "Nenhum processo encontrado" : (totalActiveFilters > 0 ? "Nenhum processo corresponde aos filtros" : "Nenhum processo cadastrado");
            const emptyMessage = searchQuery ? "Tente ajustar sua busca ou limpar os filtros." : (totalActiveFilters > 0 ? "Tente ajustar ou limpar os filtros aplicados." : "Comece cadastrando seu primeiro processo para gerenciá-lo aqui.");

            return (
              <div className="lg:col-span-3">
                <EmptyState
                  icon={<ICONS.Processes />}
                  title={emptyTitle}
                  message={emptyMessage}
                  action={!searchQuery && totalActiveFilters === 0 && (
                    <Button onClick={() => setModalState({ type: 'new' })}>
                        + Novo Processo
                    </Button>
                  )}
                />
              </div>
            );
        }
        return processesData?.data.map(p => (
            <ProcessCard 
                key={p.id} 
                process={p} 
                onEdit={() => setModalState({ type: 'edit', data: p })}
                onDelete={() => setConfirmDelete(p)}
            />
        ));
    };

    return (
        <div>
            <Header title="Gestão de Processos" subtitle="Cadastro e acompanhamento de processos trabalhistas">
                <Button onClick={() => setModalState({ type: 'new' })}>
                    + Novo Processo
                </Button>
            </Header>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full group">
                    <label htmlFor="search-processes" className="sr-only">Buscar processos</label>
                    <ICONS.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400 group-focus-within:text-brand-blue-600 transition-colors" />
                    <input
                        id="search-processes"
                        type="text"
                        placeholder="Buscar por número do processo, requerente, empresa ou advogado..."
                        className="w-full pl-11 pr-4 py-2.5 bg-brand-gray-100 border-2 border-transparent rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:bg-white focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 text-brand-gray-800 placeholder:text-brand-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                     <label htmlFor="sort-processes" className="sr-only">Ordenar processos</label>
                    <select
                        id="sort-processes"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-brand-gray-700 bg-white border border-brand-gray-300 rounded-md shadow-sm hover:bg-brand-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
                    >
                        <option value="date_desc">Mais Recente</option>
                        <option value="date_asc">Mais Antigo</option>
                        <option value="value_desc">Maior Valor</option>
                        <option value="value_asc">Menor Valor</option>
                        <option value="claimant_asc">Requerente A-Z</option>
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

            <Modal 
                isOpen={modalState.type !== null} 
                onClose={() => setModalState({ type: null })} 
                title={modalState.type === 'edit' ? "Editar Processo" : "Novo Processo"}
            >
                <NewProcessForm 
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
                message={`Tem certeza que deseja excluir o processo ${confirmDelete?.processNumber}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
            />
            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setFilterPanelOpen(false)}
                title="Filtros de Processos"
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
            >
                <FilterSection title="Status">
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(ProcessStatus).map(status => {
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
                                        className={`w-full text-left flex items-center text-sm font-medium p-3 rounded-lg border cursor-pointer transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${
                                            isChecked
                                            ? `${colors.bg} ${colors.text} ${colors.border} ${colors.ring}`
                                            : `border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-300 hover:bg-brand-gray-50 focus-within:ring-2 ${colors.ring}`
                                        }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${isChecked ? colors.text.replace('text-', 'bg-').replace('-700', '-500') : 'bg-brand-gray-300'}`}></span>
                                        {status}
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

                <FilterSection title="Data de Distribuição">
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="minDate" className="sr-only">De</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-brand-gray-500">De:</div>
                                <input id="minDate" type="date" name="minDate" value={filters.minDate} onChange={handleFilterChange} className="w-full text-right pr-3 pl-12 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="maxDate" className="sr-only">Até</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-brand-gray-500">Até:</div>
                                <input id="maxDate" type="date" name="maxDate" value={filters.maxDate} onChange={handleFilterChange} className="w-full text-right pr-3 pl-12 py-2 border border-brand-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 bg-white text-brand-gray-900" />
                            </div>
                        </div>
                    </div>
                </FilterSection>

                <FilterSection title="Valor da Causa (R$)">
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

export default Processes;