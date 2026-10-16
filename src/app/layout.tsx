import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { appName } from '@/lib/shared';
import './global.css';

const geistSans = Geist({ subsets: ['latin', 'latin-ext', 'vietnamese'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: appName, template: `%s | ${appName}` },
  description: 'Personal learning platform: courses, hands-on labs, learning paths and progress tracking.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
