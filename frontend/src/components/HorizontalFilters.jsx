import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

// Multi-select dropdown component
function MultiSelectDropdown({ label, value = [], options = [], onChange, placeholder = "All" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (opt) => {
        if (value.includes(opt)) {
            onChange(value.filter(v => v !== opt));
        } else {
            onChange([...value, opt]);
        }
    };

    const displayText = value.length === 0
        ? placeholder
        : value.length === 1
            ? value[0]
            : `${value.length} selected`;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 
                           bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200
                           text-sm hover:border-primary-400 focus:outline-none focus:border-primary-500
                           min-w-[130px]"
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <span className="absolute -top-2 left-2 px-1 text-xs bg-white dark:bg-surface-800 text-surface-500">
                {label}
            </span>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white dark:bg-surface-800 
                                border border-surface-300 dark:border-surface-600 rounded-lg shadow-lg z-50">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleOption(opt)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm 
                                       hover:bg-surface-100 dark:hover:bg-surface-700 
                                       text-surface-700 dark:text-surface-200"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center
                                            ${value.includes(opt)
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-surface-300 dark:border-surface-500'}`}>
                                {value.includes(opt) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function SortDropdown({ value, onChange }) {
    const sortOptions = [
        { value: 'date_desc', label: 'Date (Newest)' },
        { value: 'date_asc', label: 'Date (Oldest)' },
        { value: 'customer_asc', label: 'Customer Name (A-Z)' },
        { value: 'customer_desc', label: 'Customer Name (Z-A)' },
        { value: 'amount_desc', label: 'Amount (High-Low)' },
        { value: 'amount_asc', label: 'Amount (Low-High)' },
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500 whitespace-nowrap">Sort by:</span>
            <select
                value={value || 'date_desc'}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 rounded-lg border border-surface-300 dark:border-surface-600 
                           bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200
                           text-sm cursor-pointer hover:border-primary-400 focus:outline-none focus:border-primary-500"
            >
                {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function HorizontalFilters({
    filterOptions = {},
    filters = {},
    onFilterChange,
    sortBy,
    onSortChange,
    isLoading = false
}) {
    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearAllFilters = () => {
        onFilterChange({
            region: [],
            gender: [],
            productCategory: [],
            paymentMethod: [],
            tags: [],
            minAge: null,
            maxAge: null,
            startDate: '',
            endDate: '',
        });
    };

    const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val !== '';
        return val !== null && val !== undefined;
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-100 dark:bg-surface-800/50 rounded-xl animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-28 bg-surface-200 dark:bg-surface-700 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-surface-100 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700/50">
            {/* Customer Region */}
            <MultiSelectDropdown
                label="Customer Region"
                value={filters.region || []}
                options={filterOptions.regions}
                onChange={(val) => handleFilterChange('region', val)}
                placeholder="All Regions"
            />

            {/* Gender */}
            <MultiSelectDropdown
                label="Gender"
                value={filters.gender || []}
                options={filterOptions.genders}
                onChange={(val) => handleFilterChange('gender', val)}
                placeholder="All"
            />

            {/* Age Range */}
            <div className="relative flex items-center gap-2 px-3 pt-4 pb-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800">
                <span className="absolute -top-2 left-2 px-1 text-xs bg-white dark:bg-surface-800 text-surface-500">
                    Age Range
                </span>
                <div className="relative mt-1">
                    <input
                        type="number"
                        placeholder="0"
                        value={filters.minAge || ''}
                        onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-14 px-2 py-1 rounded border border-surface-200 dark:border-surface-600 
                                   bg-surface-50 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm 
                                   focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute -top-2 left-1 px-0.5 text-[10px] bg-surface-50 dark:bg-surface-700 text-surface-400">
                        Min
                    </span>
                </div>
                <span className="text-surface-400 text-sm mt-1">-</span>
                <div className="relative mt-1">
                    <input
                        type="number"
                        placeholder="100"
                        value={filters.maxAge || ''}
                        onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-14 px-2 py-1 rounded border border-surface-200 dark:border-surface-600 
                                   bg-surface-50 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm 
                                   focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute -top-2 left-1 px-0.5 text-[10px] bg-surface-50 dark:bg-surface-700 text-surface-400">
                        Max
                    </span>
                </div>
            </div>

            {/* Product Category */}
            <MultiSelectDropdown
                label="Product Category"
                value={filters.productCategory || []}
                options={filterOptions.productCategories}
                onChange={(val) => handleFilterChange('productCategory', val)}
                placeholder="All Categories"
            />

            {/* Tags */}
            <MultiSelectDropdown
                label="Tags"
                value={filters.tags || []}
                options={filterOptions.tags?.slice(0, 20)}
                onChange={(val) => handleFilterChange('tags', val)}
                placeholder="All Tags"
            />

            {/* Payment Method */}
            <MultiSelectDropdown
                label="Payment Method"
                value={filters.paymentMethod || []}
                options={filterOptions.paymentMethods}
                onChange={(val) => handleFilterChange('paymentMethod', val)}
                placeholder="All"
            />

            {/* Date Range */}
            <div className="relative flex items-center gap-2 px-3 pt-4 pb-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800">
                <span className="absolute -top-2 left-2 px-1 text-xs bg-white dark:bg-surface-800 text-surface-500">
                    Date
                </span>
                <div className="relative mt-1">
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="px-2 py-1 rounded border border-surface-200 dark:border-surface-600 
                                   bg-surface-50 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm 
                                   focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute -top-2 left-1 px-0.5 text-[10px] bg-surface-50 dark:bg-surface-700 text-surface-400">
                        Start
                    </span>
                </div>
                <span className="text-surface-400 text-sm mt-1">-</span>
                <div className="relative mt-1">
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="px-2 py-1 rounded border border-surface-200 dark:border-surface-600 
                                   bg-surface-50 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm 
                                   focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute -top-2 left-1 px-0.5 text-[10px] bg-surface-50 dark:bg-surface-700 text-surface-400">
                        End
                    </span>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-600 
                               hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                    Clear
                </button>
            )}

            {/* Sort Dropdown */}
            <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
    );
}
