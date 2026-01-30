// app/tennis/page.jsx
// SERVER COMPONENT - untuk SEO metadata

import TennisPageClient from './TennisPageClient';

export const metadata = {
    title: 'Live Streaming Tennis - Jadwal ATP WTA & Grand Slam Hari Ini',
    description: 'Nonton live streaming Tennis gratis di SportMeriah. Jadwal lengkap pertandingan ATP, WTA, Grand Slam, skor live, dan streaming HD tanpa buffering!',
    keywords: [
        'streaming tennis gratis',
        'nonton tennis online',
        'live streaming ATP',
        'live streaming WTA',
        'jadwal tennis hari ini',
        'skor tennis live',
        'Australian Open streaming',
        'Wimbledon streaming',
        'French Open streaming',
        'US Open streaming',
        'tennis live stream'
    ],
    openGraph: {
        title: '🎾 Live Streaming Tennis - SportMeriah',
        description: 'Nonton live streaming Tennis gratis!',
        url: 'https://www.sportmeriah.com/tennis',
        siteName: 'SportMeriah',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SportMeriah - Streaming Tennis Gratis',
            },
        ],
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '🎾 Live Streaming Tennis - SportMeriah',
        description: 'Nonton live streaming Tennis gratis!',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: 'https://www.sportmeriah.com/tennis',
    },
};

export default function TennisPage() {
    return <TennisPageClient />;
}
