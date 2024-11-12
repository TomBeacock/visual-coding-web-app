import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider/theme-provider";
import { ThemeScript } from "./components/theme-provider/theme-script";

const roboto = Roboto_Flex({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visual Coding",
  description: "Visual coding web application",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript/>
      </head>
      <body className={roboto.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
