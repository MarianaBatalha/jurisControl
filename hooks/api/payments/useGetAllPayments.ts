
import { useQuery } from '@tanstack/react-query';
import { getAllPayments } from '../../../api';

export const useGetAllPayments = () => {
    return useQuery({
        queryKey: ['allPayments'],
        queryFn: getAllPayments,
    });
};
