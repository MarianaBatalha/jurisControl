
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteUser } from '../../../api';

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success("Usuário excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toast.error(error.message || "Ocorreu um erro ao excluir o usuário.");
        }
    });
};
