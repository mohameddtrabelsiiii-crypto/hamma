import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "TaskForge AI", description: "Fast AI-powered business services." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
