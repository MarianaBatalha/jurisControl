
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProcess, updateProcess } from '../../../api';
import { ProcessFormData } from '../../../types';

export const useSaveProcess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, id }: { data: ProcessFormData, id?: string }) => {
            return id ? updateProcess(id, data) : createProcess(data);
        },
        onSuccess: (data, variables) => {
            const action = variables.id ? 'atualizado' : 'criado';
            toast.success(`Processo ${action} com sucesso!`);
            queryClient.invalidateQueries({ queryKey: ['processes'] });
            queryClient.invalidateQueries({ queryKey: ['allProcesses'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Ocorreu um erro ao salvar o processo.');
        },
    });
};
