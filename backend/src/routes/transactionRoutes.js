import express from 'express';
import {
    getTransactions,
    getTransactionById,
    getFilterOptions,
    exportTransactions,
    getTransactionStats
} from '../controllers/transactionController.js';

const router = express.Router();

// GET /api/transactions/filters - Get filter dropdown options
router.get('/filters', getFilterOptions);

// GET /api/transactions/export - Export transactions as CSV
router.get('/export', exportTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', getTransactionStats);

// GET /api/transactions - Get paginated transactions with search/filter/sort
router.get('/', getTransactions);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', getTransactionById);

export default router;
