import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    metadataBase: new URL('https://www.nobarmeriah.com'),
    title: {
        default: 'NobarMeriah: Nonton Bola Live Streaming & Jadwal Siaran Langsung',
        template: '%s | NobarMeriah'
    },
    description: 'Nonton live streaming bola dan olahraga gratis di NobarMeriah. Premier League, La Liga, Serie A, Champions League, NBA Basketball, dan liga top dunia lainnya. Kualitas HD, tanpa buffering!',
    keywords: [
        'streaming bola gratis',
        'nonton bola online',
        'live streaming sepakbola',
        'nonton liga inggris',
        'streaming premier league',
        'nonton la liga gratis',
        'live streaming serie a',
        'nonton champions league',
        'streaming NBA gratis',
        'nonton basketball online',
        'live streaming NBA',
        'streaming olahraga gratis',
        'NobarMeriah',
        'nonton bola hd',
        'live score',
        'jadwal bola hari ini',
        'jadwal NBA hari ini'
    ],
    authors: [{ name: 'NobarMeriah' }],
    creator: 'NobarMeriah',
    publisher: 'NobarMeriah',
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
        url: 'https://www.nobarmeriah.com',
        siteName: 'NobarMeriah',
        title: 'NobarMeriah: Nonton Bola Live Streaming & Jadwal Siaran Langsung',
        description: 'Nonton live streaming bola dan olahraga gratis. Premier League, La Liga, Serie A, Champions League, NBA Basketball. Kualitas HD!',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'NobarMeriah - Streaming Bola & NBA Gratis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NobarMeriah: Nonton Bola Live Streaming & Jadwal Siaran Langsung',
        description: 'Nonton live streaming bola dan olahraga gratis. Premier League, Champions League, NBA Basketball. Kualitas HD!',
        images: ['/og-image.png'],
        creator: '@NobarMeriah',
        site: '@NobarMeriah',
    },
    verification: {
        google: 'google-site-verification-code', // Ganti dengan code dari Google Search Console
        // yandex: 'yandex-verification-code',
        // bing: 'bing-verification-code',
    },
    alternates: {
        canonical: 'https://www.nobarmeriah.com',
        languages: {
            'id-ID': 'https://www.nobarmeriah.com',
        },
    },
    icons: {
        icon: '/NobarMeriah-icon.ico',
        shortcut: '/NobarMeriah-icon.ico',
        apple: '/NobarMeriah-icon.ico',
        other: [
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                url: '/NobarMeriah-icon.ico',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                url: '/NobarMeriah-icon.ico',
            },
        ],
    },
    manifest: '/manifest.json',
    category: 'sports',
};

export const viewport = {
    themeColor: '#1f2937',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': 'https://www.nobarmeriah.com/#website',
            'url': 'https://www.nobarmeriah.com',
            'name': 'NobarMeriah',
            'description': 'Nonton live streaming bola dan olahraga gratis. Premier League, La Liga, Serie A, Champions League, NBA Basketball.',
            'publisher': {
                '@id': 'https://www.nobarmeriah.com/#organization'
            },
            'potentialAction': [
                {
                    '@type': 'SearchAction',
                    'target': {
                        '@type': 'EntryPoint',
                        'urlTemplate': 'https://www.nobarmeriah.com/search?q={search_term_string}'
                    },
                    'query-input': 'required name=search_term_string'
                }
            ],
            'inLanguage': 'id-ID'
        },
        {
            '@type': 'Organization',
            '@id': 'https://www.nobarmeriah.com/#organization',
            'name': 'NobarMeriah',
            'url': 'https://www.nobarmeriah.com',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://www.nobarmeriah.com/logo.png',
                'width': 512,
                'height': 512
            },
            'sameAs': [
                'https://t.me/NobarMeriah',
                'https://twitter.com/NobarMeriah'
            ]
        },
        {
            '@type': 'SportsOrganization',
            '@id': 'https://www.nobarmeriah.com/#sportsorg',
            'name': 'NobarMeriah',
            'url': 'https://www.nobarmeriah.com',
            'sport': ['Soccer', 'Basketball', 'Tennis', 'Motorsport']
        }
    ]
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" href="/icon-nobarmeriah.png" sizes="any" />
                <link rel="apple-touch-icon" href="/icon-nobarmeriah.png" />
                <link rel="preconnect" href="https://sportmeriah-backend-production.up.railway.app" />
                <link rel="dns-prefetch" href="https://sportmeriah-backend-production.up.railway.app" />
                <link rel="preconnect" href="https://media.api-sports.io" />
                <link rel="dns-prefetch" href="https://media.api-sports.io" />

                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
