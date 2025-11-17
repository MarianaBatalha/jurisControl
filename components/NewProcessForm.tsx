import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ICONS } from '../constants';
import { Process, ProcessFormData, ProcessStatus, PaymentOrigin } from '../types';
import InputField from './forms/InputField';
import SelectField from './forms/SelectField';
import TextAreaField from './forms/TextAreaField';
import OriginSelector from './forms/OriginSelector';
import { Button } from './ui/Button';

// --- Validation & Masking Helpers ---
const formatCPF = (value: string) => {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatCNPJ = (value: string) => {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const formatProcessNumber = (value: string) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .slice(0, 20)
      .replace(/(\d{7})(\d)/, '$1-$2')
      .replace(/(\d{7}-\d{2})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2})(\d{1,4})$/, '$1.$2');
};

const SectionCard: React.FC<{title: string; children: React.ReactNode, className?: string}> = ({title, children, className=""}) => (
    <div className={`bg-white p-6 rounded-xl border border-brand-gray-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const getInitialState = (): ProcessFormData => ({
    processNumber: '',
    court: '',
    claimant: '',
    cpf: '',
    company: '',
    cnpj: '',
    lawFirm: '',
    lawyer: '',
    actionType: '',
    status: ProcessStatus.InProgress,
    caseValue: 0,
    agreementValue: undefined,
    sentenceValue: undefined,
    distributionDate: new Date().toISOString().split('T')[0],
    agreementDate: undefined,
    sentenceDate: undefined,
    documents: [],
    observations: '',
    origin: PaymentOrigin.Trade,
});

interface NewProcessFormProps {
    onClose: () => void;
    onSave: (data: ProcessFormData) => Promise<void>;
    isSaving: boolean;
    initialData?: Process | null;
}

const NewProcessForm: React.FC<NewProcessFormProps> = ({ onClose, onSave, isSaving, initialData }) => {
    const [formData, setFormData] = useState<ProcessFormData>(getInitialState());
    const [errors, setErrors] = useState<Partial<Record<keyof ProcessFormData, string>>>({});
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toInputDate = (dateStr?: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...getInitialState(),
                ...initialData,
                distributionDate: toInputDate(initialData.distributionDate),
                agreementDate: toInputDate(initialData.agreementDate),
                sentenceDate: toInputDate(initialData.sentenceDate),
                agreementValue: initialData.agreementValue ?? undefined,
                sentenceValue: initialData.sentenceValue ?? undefined,
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData]);

    const validateForm = (data: ProcessFormData): boolean => {
        const newErrors: Partial<Record<keyof ProcessFormData, string>> = {};
        
        if (!data.processNumber) newErrors.processNumber = "Campo obrigatório";
        else if (data.processNumber.replace(/\D/g, '').length !== 20) newErrors.processNumber = "Formato de número inválido";

        if (!data.claimant) newErrors.claimant = "Campo obrigatório";
        if (data.cpf && data.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = "CPF inválido";
        
        if (!data.company) newErrors.company = "Campo obrigatório";
        if (data.cnpj && data.cnpj.replace(/\D/g, '').length !== 14) newErrors.cnpj = "CNPJ inválido";

        if (!data.actionType) newErrors.actionType = "Campo obrigatório";
        if (Number(data.caseValue) <= 0) newErrors.caseValue = "O valor deve ser positivo";
        if (!data.distributionDate) newErrors.distributionDate = "Campo obrigatório";
        if (!data.origin) newErrors.origin = "Campo obrigatório";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'cpf') finalValue = formatCPF(value);
        if (name === 'cnpj') finalValue = formatCNPJ(value);
        if (name === 'processNumber') finalValue = formatProcessNumber(value);

        const newFormData = { ...formData, [name]: finalValue };
        setFormData(newFormData);

        if (errors[name as keyof ProcessFormData]) {
            validateForm(newFormData);
        }
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value === '' ? undefined : parseFloat(value) };
        setFormData(newFormData);
        if (errors[name as keyof ProcessFormData]) {
             validateForm(newFormData);
        }
    };

    const handleOriginChange = (origin: PaymentOrigin) => {
        const newFormData = { ...formData, origin };
        setFormData(newFormData);
        if (errors.origin) {
            validateForm(newFormData);
        }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      validateForm(formData);
    };
    
    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => ({ name: file.name }));
            setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...newFiles] }));
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({ name: file.name }));
            setFormData(prev => ({...prev, documents: [...(prev.documents || []), ...newFiles]}));
        }
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        setFormData(prev => ({...prev, documents: prev.documents?.filter((_, index) => index !== indexToRemove)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm(formData)) {
            onSave(formData);
        } else {
            toast.error("Por favor, corrija os erros destacados no formulário.");
        }
    };
    
    const hasErrors = Object.values(errors).some(Boolean);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-brand-gray-50" noValidate>
            <div className="flex-grow overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-6">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 space-y-6">
                         <SectionCard title="Dados do Processo">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <InputField name="processNumber" label="Número do Processo" value={formData.processNumber} onChange={handleChange} onBlur={handleBlur} error={errors.processNumber} required placeholder="0000000-00.0000.0.00.0000" icon={<ICONS.Hashtag />} />
                                <InputField name="court" label="Tribunal/Vara" value={formData.court} onChange={handleChange} onBlur={handleBlur} placeholder="Ex: 1ª Vara do Trabalho" icon={<ICONS.JurisControlLogo />} />
                            </div>
                            <InputField name="actionType" label="Tipo de Ação" value={formData.actionType} onChange={handleChange} onBlur={handleBlur} error={errors.actionType} required />
                        </SectionCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard title="Dados do Requerente">
                                <InputField name="claimant" label="Nome Completo" value={formData.claimant} onChange={handleChange} onBlur={handleBlur} error={errors.claimant} required icon={<ICONS.User />} />
                                <InputField name="cpf" label="CPF" value={formData.cpf || ''} onChange={handleChange} onBlur={handleBlur} error={errors.cpf} placeholder="000.000.000-00" />
                            </SectionCard>
                             <SectionCard title="Dados da Empresa Ré">
                                <InputField name="company" label="Nome da Empresa" value={formData.company} onChange={handleChange} onBlur={handleBlur} error={errors.company} required icon={<ICONS.Building />}/>
                                <InputField name="cnpj" label="CNPJ" value={formData.cnpj || ''} onChange={handleChange} onBlur={handleBlur} error={errors.cnpj} placeholder="00.000.000/0000-00" />
                                <OriginSelector
                                    label="Origem"
                                    value={formData.origin}
                                    onChange={handleOriginChange}
                                    error={errors.origin}
                                    required
                                />
                            </SectionCard>
                        </div>
                         <SectionCard title="Representação Legal">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <InputField name="lawFirm" label="Escritório de Advocacia" value={formData.lawFirm || ''} onChange={handleChange} onBlur={handleBlur} />
                                <InputField name="lawyer" label="Advogado Responsável" value={formData.lawyer || ''} onChange={handleChange} onBlur={handleBlur} />
                            </div>
                        </SectionCard>
                        <SectionCard title="Observações">
                            <TextAreaField name="observations" label="" value={formData.observations || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Informações adicionais sobre o processo..." />
                        </SectionCard>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <SectionCard title="Status e Datas">
                            <SelectField name="status" label="Status do Processo" value={formData.status} onChange={handleChange} onBlur={handleBlur} required>
                                {Object.values(ProcessStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </SelectField>
                            <InputField name="distributionDate" label="Data de Distribuição" value={formData.distributionDate} onChange={handleChange} onBlur={handleBlur} error={errors.distributionDate} type="date" required/>
                            <InputField name="agreementDate" label="Data do Acordo" value={formData.agreementDate || ''} onChange={handleChange} onBlur={handleBlur} type="date" />
                            <InputField name="sentenceDate" label="Data da Sentença" value={formData.sentenceDate || ''} onChange={handleChange} onBlur={handleBlur} type="date" />
                        </SectionCard>
                        <SectionCard title="Valores">
                            <InputField name="caseValue" label="Valor da Causa (R$)" value={formData.caseValue} onChange={handleNumberChange} onBlur={handleBlur} error={errors.caseValue} type="number" />
                            <InputField name="agreementValue" label="Valor do Acordo (R$)" value={formData.agreementValue || ''} onChange={handleNumberChange} onBlur={handleBlur} type="number" />
                            <InputField name="sentenceValue" label="Valor da Sentença (R$)" value={formData.sentenceValue || ''} onChange={handleNumberChange} onBlur={handleBlur} type="number" />
                        </SectionCard>
                        <SectionCard title="Documentos">
                            <div
                                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                                tabIndex={0}
                                role="button"
                                aria-label="Clique ou arraste um arquivo para enviar"
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-brand-blue-500 bg-brand-blue-50' : 'border-brand-gray-300 hover:border-brand-blue-400 bg-white'}`}
                            >
                                <ICONS.Upload className="w-10 h-10 text-brand-gray-400 mb-2" />
                                <p className="text-sm text-brand-gray-600 font-semibold">Arraste ou clique para enviar</p>
                                <p className="text-xs text-brand-gray-500">PDF (máx 10MB)</p>
                            </div>
                            <input ref={fileInputRef} type="file" multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
                            {(formData.documents?.length || 0) > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="sr-only">Documentos enviados</h4>
                                    <ul className="space-y-2">
                                        {formData.documents?.map((doc, index) => (
                                            <li key={index} className="flex items-center justify-between p-2 bg-brand-gray-100 rounded-md text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <ICONS.File className="w-5 h-5 text-brand-gray-500 flex-shrink-0" />
                                                    <span className="text-brand-gray-800 truncate" title={doc.name}>{doc.name}</span>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveDocument(index)} aria-label={`Remover documento ${doc.name}`} className="text-red-500 hover:text-red-700 ml-2 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                                                    <ICONS.Close className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
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

export default NewProcessForm;
