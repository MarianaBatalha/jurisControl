
import { useState, useMemo, useEffect } from 'react';
import { User, UserStatus, UserRole, UserFormData } from '../types';
import { useGetUsers } from './api/users/useGetUsers';
import { useSaveUser } from './api/users/useSaveUser';
import { useDeleteUser } from './api/users/useDeleteUser';

const USERS_PAGE_SIZE = 8;

type UserFilters = {
    status: UserStatus[];
    role: UserRole[];
};

const initialFilters: UserFilters = {
    status: [],
    role: [],
};

export const useUsers = () => {
    const [modalState, setModalState] = useState<{ type: 'new' | 'edit' | null; data?: User }>({ type: null });
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [filters, setFilters] = useState<UserFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<UserFilters>(initialFilters);
    const [sortBy, setSortBy] = useState('date_desc');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: usersData, isLoading } = useGetUsers({
        page: currentPage,
        limit: USERS_PAGE_SIZE,
        searchQuery,
        filters: appliedFilters,
        sortBy
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);

    const { mutate: saveUser, isPending: isSaving } = useSaveUser();
    const { mutate: removeUser, isPending: isDeleting } = useDeleteUser();

    const handleSave = async (data: UserFormData) => {
        const id = modalState.type === 'edit' ? modalState.data?.id : undefined;
        saveUser({ data, id }, {
            onSuccess: () => {
                setModalState({ type: null });
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete) {
            removeUser(confirmDelete.id, {
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

    const handleCheckboxChange = (field: 'status' | 'role', value: string) => {
        setFilters(prev => {
            const currentValues = prev[field] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const totalActiveFilters = useMemo(() => {
        let count = 0;
        if (appliedFilters.status.length > 0) count++;
        if (appliedFilters.role.length > 0) count++;
        return count;
    }, [appliedFilters]);

    const totalPages = usersData ? Math.ceil(usersData.total / USERS_PAGE_SIZE) : 0;

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
        handleCheckboxChange,
        appliedFilters,
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
    };
};
