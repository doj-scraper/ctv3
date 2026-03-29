import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Sora, Inter } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], weight: '700', variable: '--font-sora' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sora.variable} ${inter.variable}`}>
        <body className="bg-ct-bg text-ct-text">{children}</body>
      </html>
    </ClerkProvider>
  );
}