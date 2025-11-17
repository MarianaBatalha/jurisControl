import React from 'react';

const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true" {...props}><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true" {...props}><path d="m9 18 6-6-6-6"/></svg>
);


interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];
        const pageLimit = 5; 
        const ellipsis = '...';

        if (totalPages <= pageLimit + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push(ellipsis);
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push(ellipsis);
            }
            pages.push(totalPages);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Paginação">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Ir para a página anterior"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-brand-gray-500 bg-white border border-brand-gray-300 rounded-md hover:bg-brand-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
            >
                <ChevronLeft className="h-5 w-5" />
                <span>Anterior</span>
            </button>

            {pageNumbers.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={currentPage === page ? `Página ${page}, atual` : `Ir para a página ${page}`}
                        className={`w-10 h-10 text-sm font-medium border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 ${
                            currentPage === page
                                ? 'bg-brand-blue-600 text-white border-brand-blue-600'
                                : 'bg-white text-brand-gray-700 border-brand-gray-300 hover:bg-brand-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-3 py-2 text-sm font-medium text-brand-gray-700" aria-hidden="true">
                        {page}
                    </span>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Ir para a próxima página"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-brand-gray-500 bg-white border border-brand-gray-300 rounded-md hover:bg-brand-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
            >
                <span>Próximo</span>
                <ChevronRight className="h-5 w-5" />
            </button>
        </nav>
    );
};

export default Pagination;