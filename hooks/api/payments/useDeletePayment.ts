
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deletePayment } from '../../../api';

export const useDeletePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePayment,
        onSuccess: () => {
            toast.success("Pagamento excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['allPayments'] });
        },
        onError: (error) => {
            toast.error(error.message || "Ocorreu um erro ao excluir o pagamento.");
        }
    });
};
