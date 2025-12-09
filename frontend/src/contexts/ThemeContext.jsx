import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Force light mode only
    const [theme] = useState('light');

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('light');
        root.classList.remove('dark');
    }, []);

    // No-op toggle function for compatibility
    const toggleTheme = () => {};

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
