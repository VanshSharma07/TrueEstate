import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Routes, Route, Link, useSearchParams, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Download, RefreshCw, BarChart2, Maximize2, Minimize2 } from 'lucide-react';

import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import HorizontalFilters from './components/HorizontalFilters';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import Analytics from './pages/Analytics';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useTransactions, useFilterOptions, useTransactionStats } from './hooks/useTransactions';
import { transactionApi } from './services/api';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

// Custom SVG Icons for Stats Cards
const IconTransactions = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const IconRevenue = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);

const IconCompleted = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const IconFilter = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

function StatsCard({ icon: Icon, label, value, color = 'primary' }) {
    const colorClasses = {
        primary: 'border-primary-500/30 text-primary-400',
        emerald: 'border-emerald-500/30 text-emerald-400',
        amber: 'border-amber-500/30 text-amber-400',
        blue: 'border-blue-500/30 text-blue-400',
    };

    return (
        <div className={`glass-card p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-700/50">
                    <Icon className={`w-5 h-5 ${colorClasses[color].split(' ').pop()}`} />
                </div>
                <div>
                    <div className="text-xs text-surface-400">{label}</div>
                    <div className="text-lg font-semibold text-surface-100">{value}</div>
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const qClient = useQueryClient();
    const toast = useToast();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showFullTable, setShowFullTable] = useState(false);

    // Lock body scroll when full table modal is open
    useEffect(() => {
        if (showFullTable) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showFullTable]);

    // Parse URL params
    const queryParams = useMemo(() => ({
        page: parseInt(searchParams.get('page')) || 1,
        limit: parseInt(searchParams.get('limit')) || 10,
        keyword: searchParams.get('keyword') || '',
        region: searchParams.getAll('region'),
        gender: searchParams.getAll('gender'),
        status: searchParams.getAll('status'),
        paymentMethod: searchParams.getAll('paymentMethod'),
        productCategory: searchParams.getAll('productCategory'),
        tags: searchParams.getAll('tags'),
        deliveryType: searchParams.getAll('deliveryType'),
        minAge: searchParams.get('minAge') || undefined,
        maxAge: searchParams.get('maxAge') || undefined,
        minAmount: searchParams.get('minAmount') || undefined,
        maxAmount: searchParams.get('maxAmount') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        sortBy: searchParams.get('sortBy') || 'date_desc',
    }), [searchParams]);

    // Fetch data
    const { data: transactionsData, isLoading, isError } = useTransactions(queryParams);
    const { data: filterOptionsData, isLoading: isLoadingFilters } = useFilterOptions();
    const { data: statsData } = useTransactionStats(queryParams);

    const transactions = transactionsData?.data || [];
    const pagination = transactionsData?.pagination || { page: 1, totalPages: 1, totalCount: 0 };
    const filterOptions = filterOptionsData?.data || {};
    const stats = statsData?.data || {};

    // Refresh all data
    const handleRefresh = useCallback(() => {
        qClient.invalidateQueries({ queryKey: ['transactions'] });
        qClient.invalidateQueries({ queryKey: ['transactionStats'] });
        qClient.invalidateQueries({ queryKey: ['filterOptions'] });
        toast.success('Data refreshed');
    }, [qClient, toast]);

    // Update URL params
    const updateParams = useCallback((updates) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            newParams.delete(key);
            if (value === null || value === undefined || value === '') return;

            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v !== null && v !== undefined && v !== '') {
                        newParams.append(key, v);
                    }
                });
            } else {
                newParams.set(key, value);
            }
        });

        // Reset to page 1 when filters change (except for page changes)
        if (!('page' in updates)) {
            newParams.set('page', '1');
        }

        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleSearch = (keyword) => {
        updateParams({ keyword });
    };

    const handleFilterChange = (newFilters) => {
        const filterUpdates = {
            region: newFilters.region || [],
            gender: newFilters.gender || [],
            status: newFilters.status || [],
            paymentMethod: newFilters.paymentMethod || [],
            productCategory: newFilters.productCategory || [],
            deliveryType: newFilters.deliveryType || [],
            tags: newFilters.tags || [],
            minAge: newFilters.minAge || null,
            maxAge: newFilters.maxAge || null,
            minAmount: newFilters.minAmount || null,
            maxAmount: newFilters.maxAmount || null,
            startDate: newFilters.startDate || null,
            endDate: newFilters.endDate || null,
        };
        updateParams(filterUpdates);
    };

    const handlePageChange = (page) => {
        updateParams({ page });
    };

    const handleSortChange = (sortBy) => {
        updateParams({ sortBy });
    };

    const handleExport = () => {
        try {
            transactionApi.exportCSV(queryParams);
            toast.success('Export started - check your downloads');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handleRowClick = (transaction) => {
        setSelectedTransaction(transaction);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            notation: 'compact',
        }).format(amount);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-lg bg-white border-b border-gray-200">
                    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
                        {/* Top Row: Vault on left, Sales Management System in center, Search on right */}
                        <div className="flex items-center justify-between gap-6 mb-4">
                            {/* Left: Vault/User section */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">V</span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="font-semibold text-gray-900 text-sm">Vault</div>
                                    <div className="text-xs text-gray-600">Vansh Bargotra</div>
                                </div>
                            </div>

                            {/* Center: Sales Management System */}
                            <div className="flex-1 text-center">
                                <h1 className="text-lg font-semibold text-gray-900">Sales Management System</h1>
                            </div>

                            {/* Right: Search Bar */}
                            <div className="w-full sm:max-w-xs flex-shrink-0">
                                <SearchBar
                                    value={queryParams.keyword}
                                    onChange={handleSearch}
                                    placeholder="Name, Phone no."
                                />
                            </div>
                        </div>

                        {/* Second Row: Filters and Refresh */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleRefresh}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <HorizontalFilters
                                filterOptions={filterOptions}
                                filters={{
                                    region: queryParams.region,
                                    gender: queryParams.gender,
                                    productCategory: queryParams.productCategory,
                                    paymentMethod: queryParams.paymentMethod,
                                    tags: queryParams.tags,
                                    minAge: queryParams.minAge,
                                    maxAge: queryParams.maxAge,
                                    startDate: queryParams.startDate,
                                    endDate: queryParams.endDate,
                                }}
                                onFilterChange={handleFilterChange}
                                sortBy={queryParams.sortBy}
                                onSortChange={handleSortChange}
                                isLoading={isLoadingFilters}
                            />
                        </div>
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <StatsCard
                            icon={IconTransactions}
                            label="Total units sold"
                            value={stats.totalQuantity?.toLocaleString() || '—'}
                            color="primary"
                        />
                        <StatsCard
                            icon={IconRevenue}
                            label="Total Amount"
                            value={formatCurrency(stats.totalRevenue || 0)}
                            color="emerald"
                        />
                        <StatsCard
                            icon={IconCompleted}
                            label="Total Discount"
                            value={formatCurrency(stats.totalDiscount || 0)}
                            color="amber"
                        />
                    </div>
                </div>

                {/* Main Content - Full Width */}
                <main className="max-w-[1920px] mx-auto px-4 sm:px-6 pb-6">
                    <div className="space-y-4">
                        {isError && (
                            <div className="glass-card p-6 text-center text-red-400">
                                <p className="font-medium">Failed to load transactions</p>
                                <p className="text-sm text-surface-500 mt-1">Please check if the backend server is running</p>
                                <button
                                    onClick={handleRefresh}
                                    className="btn-secondary mt-4"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Table Header with Full View Button */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-surface-700 dark:text-surface-200">Transactions</h2>
                            <button
                                onClick={() => setShowFullTable(true)}
                                className="btn-secondary flex items-center gap-2 text-sm"
                            >
                                <Maximize2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Full Table</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <TransactionTable
                                transactions={transactions}
                                isLoading={isLoading}
                                sortBy={queryParams.sortBy}
                                onSortChange={handleSortChange}
                                onRowClick={handleRowClick}
                            />
                        </div>

                        {!isLoading && transactions.length > 0 && (
                            <Pagination
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                totalCount={pagination.totalCount}
                                limit={queryParams.limit}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </main>

                {/* Transaction Detail Modal */}
                {selectedTransaction && (
                    <TransactionModal
                        transaction={selectedTransaction}
                        onClose={() => setSelectedTransaction(null)}
                    />
                )}

                {/* Full Table View Modal */}
                {showFullTable && (
                    <div className="fixed inset-0 z-50 bg-surface-900">
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-surface-700">
                                <h2 className="text-xl font-bold text-surface-100">Full Table View</h2>
                                <button
                                    onClick={() => setShowFullTable(false)}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                    Exit Full View
                                </button>
                            </div>
                            {/* Table */}
                            <div className="flex-1 overflow-auto p-4">
                                <TransactionTable
                                    transactions={transactions}
                                    isLoading={isLoading}
                                    sortBy={queryParams.sortBy}
                                    onSortChange={handleSortChange}
                                    onRowClick={handleRowClick}
                                />
                            </div>
                            {/* Pagination */}
                            <div className="p-4 border-t border-surface-700">
                                <Pagination
                                    page={pagination.page}
                                    totalPages={pagination.totalPages}
                                    totalCount={pagination.totalCount}
                                    limit={queryParams.limit}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
