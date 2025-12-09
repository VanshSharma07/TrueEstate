import Transaction from '../models/Transaction.js';
import QueryBuilder from '../services/QueryBuilder.js';

/**
 * Get paginated transactions with search, filter, and sort
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
    try {
        const queryBuilder = new QueryBuilder(req.query).buildAllFilters();
        const query = queryBuilder.getQuery();
        const sortOptions = queryBuilder.getSortOptions();
        const { page, limit, skip } = queryBuilder.getPagination();

        // Execute query with pagination
        const [transactions, totalCount] = await Promise.all([
            Transaction.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            transactionID: parseInt(req.params.id, 10)
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message
        });
    }
};

/**
 * Get unique filter options for dropdowns
 * GET /api/transactions/filters
 */
export const getFilterOptions = async (req, res) => {
    try {
        const [
            regions,
            genders,
            paymentMethods,
            statuses,
            productCategories,
            deliveryTypes,
            storeLocations,
            tags,
            ageRange,
            amountRange
        ] = await Promise.all([
            Transaction.distinct('region'),
            Transaction.distinct('gender'),
            Transaction.distinct('paymentMethod'),
            Transaction.distinct('status'),
            Transaction.distinct('productCategory'),
            Transaction.distinct('deliveryType'),
            Transaction.distinct('storeLocation'),
            Transaction.distinct('tags'),
            Transaction.aggregate([
                { $group: { _id: null, min: { $min: '$age' }, max: { $max: '$age' } } }
            ]),
            Transaction.aggregate([
                { $group: { _id: null, min: { $min: '$amount' }, max: { $max: '$amount' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                regions: regions.sort(),
                genders: genders.sort(),
                paymentMethods: paymentMethods.sort(),
                statuses: statuses.sort(),
                productCategories: productCategories.sort(),
                deliveryTypes: deliveryTypes.sort(),
                storeLocations: storeLocations.sort(),
                tags: tags.sort(),
                ageRange: {
                    min: ageRange[0]?.min || 0,
                    max: ageRange[0]?.max || 100
                },
                amountRange: {
                    min: amountRange[0]?.min || 0,
                    max: amountRange[0]?.max || 100000
                }
            }
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filter options',
            error: error.message
        });
    }
};

/**
 * Export transactions as CSV
 * GET /api/transactions/export
 */
export const exportTransactions = async (req, res) => {
    try {
        const queryBuilder = new QueryBuilder(req.query).buildAllFilters();
        const query = queryBuilder.getQuery();
        const sortOptions = queryBuilder.getSortOptions();

        // Limit export to prevent memory issues
        const maxExportRecords = 50000;
        const transactions = await Transaction.find(query)
            .sort(sortOptions)
            .limit(maxExportRecords)
            .lean();

        // Build CSV headers
        const headers = [
            'Transaction ID',
            'Date',
            'Customer ID',
            'Customer Name',
            'Phone',
            'Gender',
            'Age',
            'Region',
            'Product Category',
            'Tags',
            'Amount',
            'Final Amount',
            'Payment Method',
            'Status',
            'Delivery Type',
            'Store Location'
        ];

        // Build CSV rows
        const rows = transactions.map(t => [
            t.transactionID,
            new Date(t.date).toISOString().split('T')[0],
            t.customerID,
            `"${t.customerName}"`,
            t.phone,
            t.gender,
            t.age,
            t.region,
            t.productCategory,
            `"${t.tags.join(',')}"`,
            t.amount,
            t.finalAmount,
            t.paymentMethod,
            t.status,
            t.deliveryType,
            t.storeLocation
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Set response headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export transactions',
            error: error.message
        });
    }
};

/**
 * Get transaction statistics (supports filters)
 * GET /api/transactions/stats
 */
export const getTransactionStats = async (req, res) => {
    try {
        // Build query from filter params
        const queryBuilder = new QueryBuilder(req.query).buildAllFilters();
        const query = queryBuilder.getQuery();

        const [
            totalTransactions,
            revenueStats,
            statusBreakdown,
            categoryBreakdown,
            regionBreakdown
        ] = await Promise.all([
            Transaction.countDocuments(query),
            Transaction.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$finalAmount' },
                        totalQuantity: { $sum: '$quantity' },
                        totalDiscount: { $sum: { $subtract: ['$amount', '$finalAmount'] } }
                    }
                }
            ]),
            Transaction.aggregate([
                { $match: query },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Transaction.aggregate([
                { $match: query },
                { $group: { _id: '$productCategory', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ]),
            Transaction.aggregate([
                { $match: query },
                { $group: { _id: '$region', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
                { $sort: { revenue: -1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalTransactions,
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                totalQuantity: revenueStats[0]?.totalQuantity || 0,
                totalDiscount: revenueStats[0]?.totalDiscount || 0,
                statusBreakdown: statusBreakdown.map(s => ({ status: s._id, count: s.count })),
                categoryBreakdown: categoryBreakdown.map(c => ({
                    category: c._id,
                    count: c.count,
                    revenue: c.revenue
                })),
                regionBreakdown: regionBreakdown.map(r => ({
                    region: r._id,
                    count: r.count,
                    revenue: r.revenue
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
