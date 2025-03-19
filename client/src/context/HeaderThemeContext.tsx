// context/HeaderThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface HeaderThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const HeaderThemeContext = createContext<HeaderThemeContextProps | undefined>(undefined);

export const useHeaderTheme = (): HeaderThemeContextProps => {
    const context = useContext(HeaderThemeContext);
    if (!context) {
        throw new Error('useHeaderTheme must be used within a HeaderThemeProvider');
    }
    return context;
};

export const HeaderThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light'); // default theme

    return (
        <HeaderThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </HeaderThemeContext.Provider>
    );
};
