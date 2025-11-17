
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPayments } from '../../../api';
import { PaymentStatus, PaymentOrigin } from '../../../types';

type GetPaymentsHookParams = {
    page: number;
    limit: number;
    searchQuery?: string;
    filters?: {
        status: PaymentStatus[];
        type: string[];
        origin: PaymentOrigin[];
        minDueDate: string;
        maxDueDate: string;
        minValue: number | '';
        maxValue: number | '';
    };
    sortBy?: string;
}

export const useGetPayments = (params: GetPaymentsHookParams) => {
    return useQuery({
        queryKey: ['payments', params.page, params.searchQuery, params.filters, params.sortBy],
        queryFn: () => getPayments(params),
        placeholderData: keepPreviousData,
    });
};
