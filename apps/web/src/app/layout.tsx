import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const roboto = Roboto({ subsets: ['latin', 'vietnamese'], weight: ['300', '400', '500', '700', '900'] });

export const metadata: Metadata = {
    title: 'Hệ thống Quản lý Cảng',
    description: 'Quản lý Chuyến tàu và Vận hành Cảng',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${roboto.className} text-[13px]`}>
                <Providers>
                    {children}
                    <div id="datepicker-portal" />
                    <Toaster position="top-right" />
                </Providers>
            </body>
        </html>
    );
}
