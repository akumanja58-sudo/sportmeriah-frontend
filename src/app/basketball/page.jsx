// app/basketball/page.jsx
// SERVER COMPONENT - untuk SEO metadata

import BasketballPageClient from './BasketballPageClient';

export const metadata = {
    title: 'Live Streaming NBA Basketball - Jadwal & Skor NBA Hari Ini',
    description: 'Nonton live streaming NBA Basketball gratis di SportMeriah. Jadwal lengkap pertandingan NBA, skor live, dan streaming HD tanpa buffering!',
    keywords: [
        'streaming NBA gratis',
        'nonton NBA online',
        'live streaming basketball',
        'jadwal NBA hari ini',
        'skor NBA live',
        'streaming basketball gratis',
        'nonton Lakers',
        'nonton Warriors',
        'NBA live stream'
    ],
    openGraph: {
        title: '🏀 Live Streaming NBA Basketball - SportMeriah',
        description: 'Nonton live streaming NBA Basketball gratis!',
        url: 'https://www.sportmeriah.com/basketball',
        siteName: 'SportMeriah',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SportMeriah - Streaming NBA Gratis',
            },
        ],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '🏀 Live Streaming NBA Basketball - SportMeriah',
        description: 'Nonton live streaming NBA Basketball gratis!',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: 'https://www.sportmeriah.com/basketball',
    },
};

export default function BasketballPage() {
    return <BasketballPageClient />;
}
