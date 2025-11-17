
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProcesses, PAGE_SIZE } from '../../../api';
import { ProcessStatus, PaymentOrigin } from '../../../types';

type GetProcessesHookParams = {
    page: number;
    searchQuery?: string;
    filters?: {
        status: ProcessStatus[];
        origin: PaymentOrigin[];
        minDate: string;
        maxDate: string;
        minValue: number | '';
        maxValue: number | '';
    };
    sortBy?: string;
    limit: number;
}

export const useGetProcesses = (params: GetProcessesHookParams) => {
    return useQuery({
        queryKey: ['processes', params.page, params.searchQuery, params.filters, params.sortBy],
        queryFn: () => getProcesses(params),
        placeholderData: keepPreviousData,
    });
};
