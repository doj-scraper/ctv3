// app/layout.tsx
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "CellTech B2B ERP",
  description: "Wholesale Cellphone Parts Distribution Platform",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={
        {
          '--font-sora': "'Sora', sans-serif",
          '--font-inter': "'Inter', sans-serif",
          '--font-ibm-plex-mono': "'IBM Plex Mono', monospace",
        } as CSSProperties
      }
      >
      <body className="bg-ct-bg text-ct-text font-inter antialiased flex flex-col min-h-screen">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#00E5C0',
              colorBackground: '#070A12',
              colorText: '#F2F5FA',
              colorInputBackground: '#0C101A',
              colorInputText: '#F2F5FA',
              colorBorder: 'rgba(167, 177, 198, 0.14)',
              colorDanger: '#F87171',
              borderRadius: '1rem',
            },
          }}
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
