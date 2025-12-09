import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
    page = 1,
    totalPages = 1,
    totalCount = 0,
    limit = 20,
    onPageChange
}) {
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-800/30 rounded-xl border border-surface-700/50">
            {/* Info */}
            <div className="text-sm text-surface-400">
                Showing <span className="font-medium text-surface-200">{startItem.toLocaleString()}</span> to{' '}
                <span className="font-medium text-surface-200">{endItem.toLocaleString()}</span> of{' '}
                <span className="font-medium text-surface-200">{totalCount.toLocaleString()}</span> results
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
                {/* Jump back 5 pages */}
                <button
                    onClick={() => onPageChange(Math.max(1, page - 5))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-700/50"
                    title="Back 5 pages"
                >
                    <ChevronsLeft className="w-4 h-4 text-surface-300" />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-700/50"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4 text-surface-300" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-surface-500">...</span>
                        ) : (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`
                  min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200
                  ${page === pageNum
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'text-surface-300 hover:bg-surface-700/50'}
                `}
                            >
                                {pageNum}
                            </button>
                        )
                    ))}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-700/50"
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4 text-surface-300" />
                </button>

                {/* Jump forward 5 pages */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 5))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-700/50"
                    title="Forward 5 pages"
                >
                    <ChevronsRight className="w-4 h-4 text-surface-300" />
                </button>
            </div>
        </div>
    );
}
