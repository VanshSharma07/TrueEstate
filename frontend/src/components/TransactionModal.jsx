import React, { useEffect } from 'react';
import { X, User, ShoppingBag, CreditCard, Truck, MapPin, Calendar, Tag } from 'lucide-react';

export default function TransactionModal({ transaction, onClose }) {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!transaction) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const statusColors = {
        'Completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Returned': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-surface-800 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-surface-700">
                    <div>
                        <h2 className="text-xl font-semibold text-surface-100">
                            Transaction #{transaction.transactionID}
                        </h2>
                        <p className="text-sm text-surface-400 mt-1">
                            {formatDate(transaction.date)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[transaction.status] || 'bg-surface-700 text-surface-300'}`}>
                            {transaction.status}
                        </span>
                        <span className="text-2xl font-bold text-surface-100">
                            {formatCurrency(transaction.finalAmount)}
                        </span>
                    </div>

                    {/* Customer Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-surface-400 uppercase tracking-wider">
                            <User className="w-4 h-4" /> Customer Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-700/30">
                            <InfoRow label="Name" value={transaction.customerName} />
                            <InfoRow label="Customer ID" value={transaction.customerID} />
                            <InfoRow label="Phone" value={transaction.phone} />
                            <InfoRow label="Gender" value={transaction.gender} />
                            <InfoRow label="Age" value={transaction.age} />
                            <InfoRow label="Region" value={transaction.region} />
                            <InfoRow label="Type" value={transaction.customerType} />
                        </div>
                    </div>

                    {/* Product Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-surface-400 uppercase tracking-wider">
                            <ShoppingBag className="w-4 h-4" /> Product Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-700/30">
                            <InfoRow label="Product Name" value={transaction.productName} />
                            <InfoRow label="Product ID" value={transaction.productID} />
                            <InfoRow label="Brand" value={transaction.brand} />
                            <InfoRow label="Category" value={transaction.productCategory} />
                            <InfoRow label="Quantity" value={transaction.quantity} />
                            <InfoRow label="Price/Unit" value={formatCurrency(transaction.pricePerUnit)} />
                        </div>
                        {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {transaction.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-surface-400 uppercase tracking-wider">
                            <CreditCard className="w-4 h-4" /> Payment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-700/30">
                            <InfoRow label="Total Amount" value={formatCurrency(transaction.amount)} />
                            <InfoRow label="Discount" value={`${transaction.discountPercentage}%`} />
                            <InfoRow label="Final Amount" value={formatCurrency(transaction.finalAmount)} />
                            <InfoRow label="Payment Method" value={transaction.paymentMethod} />
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-surface-400 uppercase tracking-wider">
                            <Truck className="w-4 h-4" /> Delivery Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-700/30">
                            <InfoRow label="Delivery Type" value={transaction.deliveryType} />
                            <InfoRow label="Store Location" value={transaction.storeLocation} />
                            <InfoRow label="Store ID" value={transaction.storeID} />
                            <InfoRow label="Employee" value={transaction.employeeName} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <div className="text-xs text-surface-500">{label}</div>
            <div className="text-sm text-surface-200 font-medium">{value || '—'}</div>
        </div>
    );
}
