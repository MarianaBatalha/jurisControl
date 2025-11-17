
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Process, ProcessStatus, ProcessFormData, PaymentOrigin } from '../types';
import { PAGE_SIZE, exportProcesses } from '../api';
import { useGetProcesses } from './api/processes/useGetProcesses';
import { useSaveProcess } from './api/processes/useSaveProcess';
import { useDeleteProcess } from './api/processes/useDeleteProcess';
import { exportToCsv } from '../lib/utils';


type ProcessFilters = {
    status: ProcessStatus[];
    origin: PaymentOrigin[];
    minDate: string;
    maxDate: string;
    minValue: number | '';
    maxValue: number | '';
};

const initialFilters: ProcessFilters = {
    status: [],
    origin: [],
    minDate: '',
    maxDate: '',
    minValue: '',
    maxValue: '',
};

export const useProcesses = () => {
    const [modalState, setModalState] = useState<{ type: 'new' | 'edit' | null; data?: Process }>({ type: null });
    const [confirmDelete, setConfirmDelete] = useState<Process | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [filters, setFilters] = useState<ProcessFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<ProcessFilters>(initialFilters);
    const [sortBy, setSortBy] = useState('date_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    const { data: processesData, isLoading } = useGetProcesses({ 
        page: currentPage, 
        limit: PAGE_SIZE, 
        searchQuery, 
        filters: appliedFilters, 
        sortBy 
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);
    
    const { mutate: saveProcess, isPending: isSaving } = useSaveProcess();
    const { mutate: removeProcess, isPending: isDeleting } = useDeleteProcess();

    const handleSave = async (data: ProcessFormData) => {
        const id = modalState.type === 'edit' ? modalState.data?.id : undefined;
        saveProcess({ data, id }, {
            onSuccess: () => {
                setModalState({ type: null });
            },
        });
    };
    
    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            removeProcess(confirmDelete.id, {
                onSuccess: () => {
                    setConfirmDelete(null);
                },
            });
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setFilterPanelOpen(false);
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setFilterPanelOpen(false);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const handleCheckboxChange = (field: 'status' | 'origin', value: string) => {
        setFilters(prev => {
            const currentValues = prev[field] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

     const handleExport = async () => {
        setIsExporting(true);
        const exportToast = toast.loading('Preparando dados para exportação...');
        try {
            const dataToExport = await exportProcesses({
                searchQuery,
                filters: appliedFilters,
                sortBy,
            });

            if (dataToExport.length === 0) {
                toast.error('Nenhum dado para exportar com os filtros atuais.', { id: exportToast });
                return;
            }

            const headers = {
                processNumber: 'Número do Processo',
                claimant: 'Requerente',
                company: 'Empresa',
                caseValue: 'Valor da Causa',
                status: 'Status',
                distributionDate: 'Data de Distribuição',
                agreementDate: 'Data do Acordo',
                sentenceDate: 'Data da Sentença',
                agreementValue: 'Valor do Acordo',
                sentenceValue: 'Valor da Sentença',
                origin: 'Origem',
                lawyer: 'Advogado',
                court: 'Tribunal/Vara',
                actionType: 'Tipo de Ação',
                observations: 'Observações'
            };

            exportToCsv(dataToExport, 'processos.csv', headers);
            toast.success('Dados exportados com sucesso!', { id: exportToast });

        } catch (error) {
            toast.error('Falha ao exportar dados.', { id: exportToast });
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    const totalActiveFilters = useMemo(() => {
        let count = 0;
        if (appliedFilters.status.length > 0) count++;
        if (appliedFilters.origin.length > 0) count++;
        if (appliedFilters.minDate || appliedFilters.maxDate) count++;
        if (appliedFilters.minValue !== '' || appliedFilters.maxValue !== '') count++;
        return count;
    }, [appliedFilters]);

    const totalPages = processesData ? Math.ceil(processesData.total / PAGE_SIZE) : 0;

    return {
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
        appliedFilters,
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
        totalPages,
    };
};