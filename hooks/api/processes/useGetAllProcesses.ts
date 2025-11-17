
import { useQuery } from '@tanstack/react-query';
import { getAllProcesses } from '../../../api';

export const useGetAllProcesses = () => {
    return useQuery({
        queryKey: ['allProcesses'],
        queryFn: getAllProcesses,
    });
};
