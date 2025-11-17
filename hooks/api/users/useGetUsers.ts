
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getUsers } from '../../../api';
import { UserStatus, UserRole } from '../../../types';

type GetUsersHookParams = {
    page: number;
    limit: number;
    searchQuery?: string;
    filters?: {
        status: UserStatus[];
        role: UserRole[];
    };
    sortBy?: string;
}

export const useGetUsers = (params: GetUsersHookParams) => {
    return useQuery({
        queryKey: ['users', params.page, params.searchQuery, params.filters, params.sortBy],
        queryFn: () => getUsers(params),
        placeholderData: keepPreviousData,
    });
};
