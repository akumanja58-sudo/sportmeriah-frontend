// app/football/page.jsx
// SERVER COMPONENT - untuk SEO metadata

import FootballPageClient from './FootballPageClient';

export const metadata = {
    title: 'Live Streaming Sepakbola - Jadwal & Skor Bola Hari Ini',
    description: 'Nonton live streaming sepakbola gratis di SportMeriah. Premier League, La Liga, Serie A, Bundesliga, Champions League, Europa League. Jadwal lengkap & skor live!',
    keywords: [
        'streaming bola gratis',
        'nonton bola online',
        'live streaming sepakbola',
        'jadwal bola hari ini',
        'skor bola live',
        'streaming premier league',
        'nonton la liga',
        'live streaming champions league',
        'streaming serie a',
        'nonton bundesliga',
        'streaming europa league'
    ],
    openGraph: {
        title: '⚽ Live Streaming Sepakbola - SportMeriah',
        description: 'Nonton live streaming sepakbola gratis. Premier League, La Liga, Serie A, Champions League!',
        url: 'https://www.sportmeriah.com/football',
        siteName: 'SportMeriah',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SportMeriah - Streaming Sepakbola Gratis',
            },
        ],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '⚽ Live Streaming Sepakbola - SportMeriah',
        description: 'Nonton live streaming sepakbola gratis!',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: 'https://www.sportmeriah.com/football',
    },
};

export default function FootballPage() {
    return <FootballPageClient />;
}
