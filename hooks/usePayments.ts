
import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Payment, PaymentStatus, PaymentFormData, PaymentOrigin } from '../types';
import { PAGE_SIZE, exportPayments } from '../api';
import { useGetPayments } from './api/payments/useGetPayments';
import { useSavePayment } from './api/payments/useSavePayment';
import { useDeletePayment } from './api/payments/useDeletePayment';
import { useGetAllProcesses } from './api/processes/useGetAllProcesses';
import { exportToCsv } from '../lib/utils';

type PaymentFilters = {
    status: PaymentStatus[];
    type: string[];
    origin: PaymentOrigin[];
    minDueDate: string;
    maxDueDate: string;
    minValue: number | '';
    maxValue: number | '';
};

const initialFilters: PaymentFilters = {
    status: [],
    type: [],
    origin: [],
    minDueDate: '',
    maxDueDate: '',
    minValue: '',
    maxValue: '',
};

export const usePayments = () => {
    const [modalState, setModalState] = useState<{ type: 'new' | 'edit' | null; data?: Payment }>({ type: null });
    const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [filters, setFilters] = useState<PaymentFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<PaymentFilters>(initialFilters);
    const [sortBy, setSortBy] = useState('due_date_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    const { data: paymentsData, isLoading: isLoadingPayments } = useGetPayments({
        page: currentPage,
        limit: PAGE_SIZE,
        searchQuery,
        filters: appliedFilters,
        sortBy
    });

    const { data: allProcesses = [] } = useGetAllProcesses();

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);

    const { mutate: savePayment, isPending: isSaving } = useSavePayment();
    const { mutate: removePayment, isPending: isDeleting } = useDeletePayment();

    const handleSave = async (data: PaymentFormData) => {
        const id = modalState.type === 'edit' ? modalState.data?.id : undefined;
        savePayment({ data, id }, {
            onSuccess: () => {
                setModalState({ type: null });
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            removePayment(confirmDelete.id, {
                onSuccess: () => {
                    setConfirmDelete(null);
                }
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
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (field: 'status' | 'type' | 'origin', value: string) => {
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
            const dataToExport = await exportPayments({
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
                type: 'Tipo',
                value: 'Valor',
                installmentNumber: 'Parcela N°',
                totalInstallments: 'Total de Parcelas',
                dueDate: 'Vencimento',
                paymentDate: 'Data de Pagamento',
                status: 'Status',
                origin: 'Origem',
                paymentMethod: 'Forma de Pagamento',
                observations: 'Observações'
            };
            
            exportToCsv(dataToExport, 'pagamentos.csv', headers);
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
        if (appliedFilters.type.length > 0) count++;
        if (appliedFilters.origin.length > 0) count++;
        if (appliedFilters.minDueDate || appliedFilters.maxDueDate) count++;
        if (appliedFilters.minValue !== '' || appliedFilters.maxValue !== '') count++;
        return count;
    }, [appliedFilters]);

    const totalPages = paymentsData ? Math.ceil(paymentsData.total / PAGE_SIZE) : 0;

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
        totalPages,
    };
};