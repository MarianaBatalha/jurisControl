
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteProcess } from '../../../api';

export const useDeleteProcess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProcess,
        onSuccess: () => {
            toast.success("Processo excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['processes'] });
            queryClient.invalidateQueries({ queryKey: ['allProcesses'] });
        },
        onError: (error) => {
            toast.error(error.message || "Ocorreu um erro ao excluir o processo.");
        }
    });
};
