
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createUser, updateUser } from '../../../api';
import { UserFormData } from '../../../types';

export const useSaveUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, id }: { data: UserFormData, id?: string }) => {
            return id ? updateUser(id, data) : createUser(data);
        },
        onSuccess: (data, variables) => {
            const action = variables.id ? 'atualizado' : 'criado';
            toast.success(`Usuário ${action} com sucesso!`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Ocorreu um erro ao salvar o usuário.');
        },
    });
};
