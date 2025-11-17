import React, { useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { Button } from './ui/Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isConfirming: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isConfirming }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<Element | null>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement;
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            
            // Focus trapping
            setTimeout(() => {
                confirmButtonRef.current?.focus();
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                const handleTabKeyPress = (e: KeyboardEvent) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) { // shift + tab
                            if (document.activeElement === firstElement) {
                                lastElement.focus();
                                e.preventDefault();
                            }
                        } else { // tab
                            if (document.activeElement === lastElement) {
                                firstElement.focus();
                                e.preventDefault();
                            }
                        }
                    }
                };
                
                const currentModalRef = modalRef.current;
                currentModalRef?.addEventListener('keydown', handleTabKeyPress);
                
                return () => {
                    currentModalRef?.removeEventListener('keydown', handleTabKeyPress);
                }
            }, 100);

            return () => {
                window.removeEventListener('keydown', handleEsc);
                (triggerRef.current as HTMLElement)?.focus();
            };
        }
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
            onClick={onClose}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
        >
            <div 
                ref={modalRef}
                className="bg-white w-full max-w-md m-4 rounded-lg shadow-xl flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ICONS.PendingPayments className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4 text-left">
                        <h3 id="confirmation-title" className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                        <div className="mt-2">
                            <p id="confirmation-message" className="text-sm text-gray-500">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button
                        ref={confirmButtonRef}
                        variant="destructive"
                        onClick={onConfirm}
                        isLoading={isConfirming}
                        className="w-full sm:w-auto"
                    >
                        {confirmText}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isConfirming}
                        className="mt-3 w-full sm:mt-0 sm:w-auto"
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
