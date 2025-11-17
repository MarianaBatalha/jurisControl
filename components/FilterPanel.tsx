import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { Button } from './ui/Button';

interface FilterPanelProps extends PropsWithChildren {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onApply: () => void;
    onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, title, onApply, onClear, children }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<Element | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        if (isOpen) {
            triggerRef.current = document.activeElement;
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';

            // Focus trapping
            setTimeout(() => {
                panelRef.current?.focus();
                const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
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

                const currentPanelRef = panelRef.current;
                currentPanelRef?.addEventListener('keydown', handleTabKeyPress);

                return () => {
                    currentPanelRef?.removeEventListener('keydown', handleTabKeyPress);
                };
            }, 100);
            
        } else {
            document.body.style.overflow = 'auto';
            (triggerRef.current as HTMLElement)?.focus();
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    return (
        <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} 
            onClick={onClose}
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out outline-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 id="filter-panel-title" className="text-xl font-bold text-brand-gray-800">{title}</h2>
                    <button onClick={onClose} aria-label="Fechar painel de filtros" className="text-brand-gray-400 hover:text-brand-gray-600 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2">
                        <ICONS.Close className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow space-y-6">
                    {children}
                </div>
                <div className="p-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                    <Button variant="outline" onClick={onClear}>
                        Limpar
                    </Button>
                    <Button variant="primary" onClick={onApply}>
                        Aplicar Filtros
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
