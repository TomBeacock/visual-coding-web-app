"use client"

import { PropsWithChildren, useEffect, createContext, useState, useRef, useContext } from 'react';

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme,
    toggleTheme: () => void,
}

const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => { },
} as ThemeContextType);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState("dark" as Theme);
    const isAuto = useRef(true);

    useEffect(() => {
        const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
        prefersDarkQuery.addEventListener("change", (event) => {
            if (isAuto.current) {
                setTheme(event.matches ? "dark" : "light");
            }
        });

        const storedTheme = localStorage.getItem("theme");
        const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "auto" ? storedTheme : "auto";
        const computedTheme = theme !== "auto" ? theme : prefersDarkQuery.matches ? "dark" : "light";
        isAuto.current = theme === "auto";

        setTheme(computedTheme);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        if (!isAuto.current) {
            localStorage.setItem("theme", theme);
        }
    }, [theme]);

    function toggleTheme() {
        isAuto.current = false;
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <ThemeContext.Provider
            value={{
                theme: theme,
                toggleTheme,
            }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);