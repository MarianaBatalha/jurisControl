
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createPayment, updatePayment } from '../../../api';
import { PaymentFormData } from '../../../types';

export const useSavePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, id }: { data: PaymentFormData, id?: string }) => {
            return id ? updatePayment(id, data) : createPayment(data);
        },
        onSuccess: (data, variables) => {
            const action = variables.id ? 'atualizado' : 'criado';
            toast.success(`Pagamento ${action} com sucesso!`);
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['allPayments'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Ocorreu um erro ao salvar o pagamento.');
        },
    });
};
