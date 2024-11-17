"use client"

import "./page.css";
import { AppProvider } from "./components/app-provider/app-provider";
import { VisualCoding } from "./visual-coding";

export default function Home() {
  return (
    <AppProvider>
      <VisualCoding />
    </AppProvider>
  );
}