import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ICONS, PAYMENT_TYPES } from '../constants';
import { Payment, PaymentFormData, PaymentStatus, Process, PaymentOrigin } from '../types';
import InputField from './forms/InputField';
import SelectField from './forms/SelectField';
import TextAreaField from './forms/TextAreaField';
import OriginSelector from './forms/OriginSelector';
import { Button } from './ui/Button';

const SectionCard: React.FC<{title: string; children: React.ReactNode, className?: string}> = ({title, children, className=""}) => (
    <div className={`bg-white p-6 rounded-xl border border-brand-gray-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const getInitialState = (processes: Process[]): PaymentFormData => ({
    processId: processes[0]?.id || '',
    type: 'Acordo',
    value: 0,
    installmentNumber: 1,
    totalInstallments: 1,
    dueDate: new Date().toISOString().split('T')[0],
    paymentDate: undefined,
    status: PaymentStatus.Pending,
    paymentMethod: 'Transferência Bancária',
    documents: [],
    observations: '',
    idPortalGps: '',
    crCentroCusto: '',
    origin: PaymentOrigin.Trade,
});

const PAYMENT_METHODS = ['Transferência Bancária', 'Depósito Judicial', 'PIX', 'Boleto', 'Cheque'];

interface NewPaymentFormProps {
    onClose: () => void;
    onSave: (data: PaymentFormData) => Promise<void>;
    isSaving: boolean;
    initialData?: Payment | null;
    processes: Process[];
}

const NewPaymentForm: React.FC<NewPaymentFormProps> = ({ onClose, onSave, isSaving, initialData, processes }) => {
    const [formData, setFormData] = useState<PaymentFormData>(getInitialState(processes));
    const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
    const [totalValue, setTotalValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toInputDate = (dateStr?: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...getInitialState(processes),
                ...initialData,
                dueDate: toInputDate(initialData.dueDate),
                paymentDate: toInputDate(initialData.paymentDate),
                installmentNumber: initialData.installmentNumber ?? 1,
                totalInstallments: initialData.totalInstallments ?? 1,
            });
        } else {
            setFormData(getInitialState(processes));
        }
    }, [initialData, processes]);

    useEffect(() => {
        const installmentValue = Number(formData.value) || 0;
        const totalInstallments = Number(formData.totalInstallments) || 1;
        setTotalValue(installmentValue * totalInstallments);
    }, [formData.value, formData.totalInstallments]);

    const validateForm = (data: PaymentFormData): boolean => {
        const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};
        
        if (!data.processId) newErrors.processId = "Selecione um processo";
        if (Number(data.value) <= 0) newErrors.value = "O valor deve ser positivo";
        if (!data.dueDate) newErrors.dueDate = "Campo obrigatório";

        const installmentNumber = Number(data.installmentNumber);
        const totalInstallments = Number(data.totalInstallments);

        if (installmentNumber < 1 || !Number.isInteger(installmentNumber)) newErrors.installmentNumber = "Deve ser um número inteiro positivo";
        if (totalInstallments < 1 || !Number.isInteger(totalInstallments)) newErrors.totalInstallments = "Deve ser um número inteiro positivo";

        if (totalInstallments < installmentNumber) newErrors.totalInstallments = "Total deve ser >= Parcela Nº";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        if (errors[name as keyof PaymentFormData]) {
             validateForm(newFormData);
        }
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value === '' ? '' : parseFloat(value) };
        setFormData(newFormData);

         if (errors[name as keyof PaymentFormData]) {
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
            const dataToSave = {
                ...formData,
                value: Number(formData.value) || 0,
                installmentNumber: Number(formData.installmentNumber) || 1,
                totalInstallments: Number(formData.totalInstallments) || 1,
            }
            onSave(dataToSave);
        } else {
            toast.error("Por favor, corrija os erros destacados no formulário.");
        }
    };
    
    const hasErrors = Object.values(errors).some(Boolean);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-brand-gray-50" noValidate>
            <div className="flex-grow overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-6">
                <SectionCard title="Informações do Pagamento">
                    <SelectField name="processId" label="Processo" value={formData.processId} onChange={handleChange} onBlur={handleBlur} error={errors.processId} required>
                        <option disabled value="">Selecione um processo</option>
                        {processes.map(p => (
                            <option key={p.id} value={p.id}>{p.processNumber} - {p.claimant}</option>
                        ))}
                    </SelectField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField name="type" label="Tipo de Pagamento" value={formData.type} onChange={handleChange} onBlur={handleBlur} required>
                            <option disabled value="">Selecione o tipo</option>
                            {PAYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </SelectField>
                        <OriginSelector
                            label="Origem"
                            value={formData.origin}
                            onChange={handleOriginChange}
                            error={errors.origin}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField name="idPortalGps" label="ID (Portal GPS)" value={formData.idPortalGps || ''} onChange={handleChange} onBlur={handleBlur} error={errors.idPortalGps} />
                        <InputField name="crCentroCusto" label="CR Centro de Custo" value={formData.crCentroCusto || ''} onChange={handleChange} onBlur={handleBlur} error={errors.crCentroCusto} />
                    </div>
                </SectionCard>
                
                <SectionCard title="Valores e Parcelamento">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <InputField name="value" label="Valor da Parcela (R$)" value={formData.value || ''} onChange={handleNumberChange} onBlur={handleBlur} error={errors.value} type="number" required icon={<ICONS.Payments />}/>
                            <div className="flex gap-4">
                                <InputField name="installmentNumber" label="Parcela Nº" value={formData.installmentNumber || ''} onChange={handleNumberChange} onBlur={handleBlur} error={errors.installmentNumber} type="number" />
                                <InputField name="totalInstallments" label="Total" value={formData.totalInstallments || ''} onChange={handleNumberChange} onBlur={handleBlur} error={errors.totalInstallments} type="number" />
                            </div>
                        </div>
                         <div className="bg-brand-gray-100 p-4 rounded-lg flex flex-col justify-center items-center">
                            <label className="text-sm font-medium text-brand-gray-600">Valor Total do Acordo</label>
                            <p className="text-3xl font-bold text-brand-blue-700 mt-2">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SectionCard title="Datas">
                        <InputField name="dueDate" label="Data de Vencimento" value={formData.dueDate} onChange={handleChange} onBlur={handleBlur} error={errors.dueDate} type="date" required />
                        <InputField name="paymentDate" label="Data do Pagamento" value={formData.paymentDate || ''} onChange={handleChange} onBlur={handleBlur} type="date" />
                    </SectionCard>
                     <SectionCard title="Status e Método">
                         <SelectField name="status" label="Status do Pagamento" value={formData.status} onChange={handleChange} onBlur={handleBlur}>
                            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </SelectField>
                         <SelectField name="paymentMethod" label="Forma de Pagamento" value={formData.paymentMethod} onChange={handleChange} onBlur={handleBlur}>
                            <option disabled value="">Selecione a forma</option>
                            {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                        </SelectField>
                     </SectionCard>
                </div>
                
                <SectionCard title="Documentos e Observações">
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
                        <p className="text-sm text-brand-gray-600 font-semibold">Anexar comprovante</p>
                        <p className="text-xs text-brand-gray-500">Arraste ou clique para enviar</p>
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
                     <TextAreaField name="observations" label="Observações" value={formData.observations} onChange={handleChange} onBlur={handleBlur} placeholder="Informações adicionais sobre o pagamento..." />
                </SectionCard>
            </div>
            <div className="px-6 py-4 border-t mt-auto flex justify-end gap-3 bg-white sticky bottom-0 z-10">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    Cancelar
                </Button>
                <Button type="submit" variant="success" disabled={isSaving || hasErrors} isLoading={isSaving}>
                    <ICONS.Save className="w-4 h-4"/>
                    Salvar
                </Button>
            </div>
        </form>
    );
};

export default NewPaymentForm;