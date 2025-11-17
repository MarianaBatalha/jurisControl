import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ICONS } from '../constants';
import { User, UserRole, UserStatus, UserFormData } from '../types';
import InputField from './forms/InputField';
import SelectField from './forms/SelectField';
import { Button } from './ui/Button';

const SectionCard: React.FC<{title: string; children: React.ReactNode, className?: string}> = ({title, children, className=""}) => (
    <div className={`bg-white p-6 rounded-xl border border-brand-gray-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


const getInitialState = (): UserFormData => ({
    name: '',
    email: '',
    role: UserRole.Advogado,
    status: UserStatus.Active,
    password: '',
    confirmPassword: '',
});

interface UserFormProps {
    onClose: () => void;
    onSave: (data: UserFormData) => Promise<void>;
    isSaving: boolean;
    initialData?: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSave, isSaving, initialData }) => {
    const [formData, setFormData] = useState<UserFormData>(getInitialState());
    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...getInitialState(),
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                status: initialData.status,
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData]);

    const validateForm = (data: UserFormData): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};
        
        if (!data.name) newErrors.name = "Nome é obrigatório";
        if (!data.email) {
            newErrors.email = "E-mail é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Formato de e-mail inválido";
        }

        if (!isEditing) { // Creating new user
            if (!data.password) {
                newErrors.password = "Senha é obrigatória";
            } else if (data.password.length < 6) {
                newErrors.password = "A senha deve ter pelo menos 6 caracteres";
            }
            if (data.password !== data.confirmPassword) {
                newErrors.confirmPassword = "As senhas não coincidem";
            }
        } else { // Editing user, validate password only if user is trying to change it
            if (data.password || data.confirmPassword) {
                if (!data.password) {
                    newErrors.password = "Nova senha é obrigatória";
                } else if (data.password.length < 6) {
                    newErrors.password = "A nova senha deve ter pelo menos 6 caracteres";
                }
                if (data.password !== data.confirmPassword) {
                    newErrors.confirmPassword = "As senhas não coincidem";
                }
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        if (errors[name as keyof UserFormData]) {
            validateForm(newFormData);
        }
    };
    
    const handleBlur = () => {
      validateForm(formData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm(formData)) {
            onSave(formData);
        } else {
            toast.error("Por favor, corrija os erros destacados.");
        }
    };
    
    const hasErrors = Object.values(errors).some(Boolean);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-brand-gray-50" noValidate>
            <div className="flex-grow overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-6">
                 <SectionCard title="Informações do Usuário">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <InputField name="name" label="Nome Completo" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} required icon={<ICONS.User />} />
                        <InputField name="email" label="E-mail" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} type="email" required icon={<ICONS.Email />} />
                    </div>
                </SectionCard>
                
                 <SectionCard title="Acesso e Status">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField name="role" label="Nível de Acesso" value={formData.role} onChange={handleChange} onBlur={handleBlur} error={errors.role} required>
                            {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </SelectField>
                        <SelectField name="status" label="Status" value={formData.status} onChange={handleChange} onBlur={handleBlur} error={errors.status} required>
                            {Object.values(UserStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </SelectField>
                    </div>
                </SectionCard>

                {isEditing ? (
                    <SectionCard title="Alterar Senha (Opcional)">
                        <p className="text-sm text-brand-gray-500 -mt-2">Deixe os campos em branco para manter a senha atual.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="password" label="Nova Senha" value={formData.password || ''} onChange={handleChange} onBlur={handleBlur} error={errors.password} type="password" icon={<ICONS.Password />} />
                            <InputField name="confirmPassword" label="Confirmar Nova Senha" value={formData.confirmPassword || ''} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} type="password" icon={<ICONS.Password />} />
                        </div>
                    </SectionCard>
                ) : (
                    <SectionCard title="Credenciais de Acesso">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="password" label="Senha" value={formData.password || ''} onChange={handleChange} onBlur={handleBlur} error={errors.password} type="password" required icon={<ICONS.Password />} />
                            <InputField name="confirmPassword" label="Confirmar Senha" value={formData.confirmPassword || ''} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} type="password" required icon={<ICONS.Password />} />
                        </div>
                    </SectionCard>
                )}
            </div>
            <div className="px-6 py-4 border-t mt-auto flex justify-end gap-3 bg-white sticky bottom-0 z-10">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || hasErrors} isLoading={isSaving}>
                    <ICONS.Save className="w-4 h-4"/>
                    Salvar
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
