import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/hooks/use-progress";
import { AuthProvider } from "@/context/auth-context";
import { ImportModal } from "@/components/auth/import-modal";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Ultimate Backend Interview Mastery",
  description: "Revision-first Java backend interview roadmap with code references, projects, and persistent notes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <ProgressProvider>
            <AppShell>{children}</AppShell>
            <ImportModal />
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
