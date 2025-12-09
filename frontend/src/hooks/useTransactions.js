import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../services/api';

/**
 * Hook for fetching paginated transactions with search, filter, and sort
 */
export function useTransactions(queryParams = {}) {
    const {
        page = 1,
        limit = 20,
        keyword = '',
        region = [],
        gender = [],
        status = [],
        paymentMethod = [],
        productCategory = [],
        tags = [],
        deliveryType = [],
        minAge,
        maxAge,
        minAmount,
        maxAmount,
        sortBy = 'date_desc',
    } = queryParams;

    return useQuery({
        queryKey: [
            'transactions',
            page,
            limit,
            keyword,
            region,
            gender,
            status,
            paymentMethod,
            productCategory,
            tags,
            deliveryType,
            minAge,
            maxAge,
            minAmount,
            maxAmount,
            sortBy,
        ],
        queryFn: () =>
            transactionApi.getTransactions({
                page,
                limit,
                keyword,
                region,
                gender,
                status,
                paymentMethod,
                productCategory,
                tags,
                deliveryType,
                minAge,
                maxAge,
                minAmount,
                maxAmount,
                sortBy,
            }),
        staleTime: 30 * 1000, // 30 seconds
        keepPreviousData: true,
    });
}

/**
 * Hook for fetching filter options
 */
export function useFilterOptions() {
    return useQuery({
        queryKey: ['filterOptions'],
        queryFn: () => transactionApi.getFilterOptions(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for fetching transaction statistics (supports filters)
 */
export function useTransactionStats(queryParams = {}) {
    return useQuery({
        queryKey: ['transactionStats', queryParams],
        queryFn: () => transactionApi.getStats(queryParams),
        staleTime: 30 * 1000, // 30 seconds - refresh more often when filtered
    });
}

/**
 * Hook for fetching a single transaction
 */
export function useTransaction(id) {
    return useQuery({
        queryKey: ['transaction', id],
        queryFn: () => transactionApi.getTransaction(id),
        enabled: !!id,
    });
}
