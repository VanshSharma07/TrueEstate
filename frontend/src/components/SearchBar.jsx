import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchBar({ value = '', onChange, placeholder = 'Search...' }) {
    const [localValue, setLocalValue] = useState(value);
    const { theme } = useTheme();

    // Debounce the search
    const debounce = useCallback((fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }, []);

    const debouncedOnChange = useCallback(
        debounce((val) => {
            onChange(val);
        }, 300),
        [onChange]
    );

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedOnChange(val);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    // Determine icon color based on theme
    const iconColor = theme === 'dark' ? '#e2e8f0' : '#1f2937';

    return (
        <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="
                    w-full pl-12 pr-10 py-3 
                    bg-white dark:bg-surface-800/50 backdrop-blur-sm
                    border border-surface-300 dark:border-surface-600/50 rounded-xl
                    text-gray-900 dark:text-surface-100 placeholder-gray-400 dark:placeholder-surface-500 text-base
                    transition-all duration-200
                    focus:outline-none focus:border-primary-500 dark:focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                    hover:border-surface-400 dark:hover:border-surface-500
                "
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
