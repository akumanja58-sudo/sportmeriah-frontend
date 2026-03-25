// ============================================================
// TEMPLATE: app/sports/[sport]/page.jsx
// Dynamic route that handles ALL sports automatically
// ============================================================

import SportPageClient, { SPORT_CONFIGS } from '../../components/SportPageClient';

// Generate static params for all sports
export async function generateStaticParams() {
    return Object.keys(SPORT_CONFIGS).map((sport) => ({
        sport: sport,
    }));
}

// Dynamic metadata per sport
export async function generateMetadata({ params }) {
    const { sport } = params;
    const config = SPORT_CONFIGS[sport];

    if (!config) {
        return {
            title: 'Sport Not Found - SportMeriah',
        };
    }

    return {
        title: config.seoTitle,
        description: config.seoDesc,
        keywords: [
            `streaming ${config.name} gratis`,
            `nonton ${config.name} online`,
            `live streaming ${config.name}`,
            `${config.name} hari ini`,
        ],
        openGraph: {
            title: `${config.emoji} ${config.seoTitle}`,
            description: config.seoDesc,
            url: `https://www.nobarmeriah.com/sports/${sport}`,
            siteName: 'SportMeriah',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: `SportMeriah - Streaming ${config.name} Gratis`,
                },
            ],
            locale: 'id_ID',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${config.emoji} ${config.seoTitle}`,
            description: config.seoDesc,
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: `https://www.nobarmeriah.com/sports/${sport}`,
        },
    };
}

export default function SportPage({ params }) {
    const { sport } = params;
    return <SportPageClient sport={sport} />;
}
