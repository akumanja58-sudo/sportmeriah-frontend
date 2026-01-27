import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    metadataBase: new URL('https://sportmeriah.com'),
    title: {
        default: 'SportMeriah - Nonton Streaming Bola & Olahraga Gratis',
        template: '%s | SportMeriah'
    },
    description: 'Nonton live streaming bola dan olahraga gratis di SportMeriah. Premier League, La Liga, Serie A, Champions League, dan liga top dunia lainnya. Kualitas HD, tanpa buffering!',
    keywords: [
        'streaming bola gratis',
        'nonton bola online',
        'live streaming sepakbola',
        'nonton liga inggris',
        'streaming premier league',
        'nonton la liga gratis',
        'live streaming serie a',
        'nonton champions league',
        'streaming olahraga gratis',
        'sportmeriah',
        'nonton bola hd',
        'live score',
        'jadwal bola hari ini'
    ],
    authors: [{ name: 'SportMeriah' }],
    creator: 'SportMeriah',
    publisher: 'SportMeriah',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: 'https://sportmeriah.com',
        siteName: 'SportMeriah',
        title: 'SportMeriah - Nonton Streaming Bola & Olahraga Gratis',
        description: 'Nonton live streaming bola dan olahraga gratis. Premier League, La Liga, Serie A, Champions League, dan liga top dunia lainnya. Kualitas HD!',
        images: [
            {
                url: '/sportmeriah-icon.png',
                width: 1200,
                height: 630,
                alt: 'SportMeriah - Streaming Bola Gratis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SportMeriah - Nonton Streaming Bola & Olahraga Gratis',
        description: 'Nonton live streaming bola dan olahraga gratis. Premier League, La Liga, Serie A, Champions League. Kualitas HD!',
        images: ['/sportmeriah-icon.png'],
        creator: '@sportmeriah',
    },
    verification: {
        google: 'google-site-verification-code', // Ganti dengan code dari Google Search Console
    },
    alternates: {
        canonical: 'https://sportmeriah.com',
    },
    icons: {
        icon: '/sportmeriah-icon.ico',
        shortcut: '/sportmeriah-icon.ico',
        apple: '/sportmeriah-icon.ico',
    },
    manifest: '/manifest.json',
};

export const viewport = {
    themeColor: '#1f2937',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
