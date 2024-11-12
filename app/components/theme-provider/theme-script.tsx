"use client"

export function ThemeScript() {
    return (
        <script dangerouslySetInnerHTML= {{
            __html:
                `(function (){
                    const storedTheme = localStorage.getItem("theme");
                    const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "auto" ? storedTheme : "auto";
                    const computedTheme = theme !== "auto" ? theme : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                    document.documentElement.dataset.theme = computedTheme;
                })();`
            }}
        />
    );
}