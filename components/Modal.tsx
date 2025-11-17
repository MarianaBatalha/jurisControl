import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { ICONS } from '../constants';

interface ModalProps extends PropsWithChildren {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<Element | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            triggerRef.current = document.activeElement;
            window.addEventListener('keydown', handleEsc);

            setTimeout(() => {
                modalRef.current?.focus();
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                const handleTabKeyPress = (e: KeyboardEvent) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                lastElement.focus();
                                e.preventDefault();
                            }
                        } else {
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
                    window.removeEventListener('keydown', handleEsc);
                    (triggerRef.current as HTMLElement)?.focus();
                };
            }, 100);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                ref={modalRef}
                tabIndex={-1}
                className="bg-brand-gray-50 w-full max-w-4xl h-full shadow-xl flex flex-col outline-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-20">
                    <h2 id="modal-title" className="text-2xl font-bold text-brand-gray-800">{title}</h2>
                    <button onClick={onClose} aria-label="Fechar modal" className="text-brand-gray-400 hover:text-brand-gray-600 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2">
                        <ICONS.Close className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;