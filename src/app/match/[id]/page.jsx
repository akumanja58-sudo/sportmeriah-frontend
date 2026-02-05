// app/match/[id]/page.jsx
// SERVER COMPONENT - untuk Dynamic SEO metadata
import MatchPageClient from './MatchPageClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

export async function generateMetadata({ params, searchParams }) {
    const { id: fixtureId } = await params;

    try {
        const res = await fetch(`${API_URL}/api/fixtures/today`, {
            next: { revalidate: 60 }
        });
        const data = await res.json();

        if (data.success && data.fixtures) {
            const fixture = data.fixtures.find(f => f.id === parseInt(fixtureId));
            if (fixture) {
                const homeTeam = fixture.teams?.home?.name || 'Home';
                const awayTeam = fixture.teams?.away?.name || 'Away';
                const league = fixture.league?.name || 'Football';
                const matchTitle = `${homeTeam} vs ${awayTeam}`;

                return {
                    title: `Live Streaming ${matchTitle} - ${league}`,
                    description: `Nonton live streaming ${matchTitle} gratis di SportMeriah. Pertandingan ${league} dengan kualitas HD tanpa buffering!`,
                    openGraph: {
                        title: `🔴 LIVE: ${matchTitle} - ${league}`,
                        description: `Nonton live streaming ${matchTitle} gratis!`,
                        url: `https://www.sportmeriah.com/match/${fixtureId}`,
                        siteName: 'SportMeriah',
                        images: [
                            {
                                url: fixture.teams?.home?.logo || '/og-image.png',
                                width: 200,
                                height: 200,
                                alt: homeTeam,
                            },
                        ],
                        locale: 'id_ID',
                        type: 'website',
                    },
                    twitter: {
                        card: 'summary',
                        title: `🔴 LIVE: ${matchTitle}`,
                        description: `Nonton live streaming ${matchTitle} gratis!`,
                    },
                    alternates: {
                        canonical: `https://www.sportmeriah.com/match/${fixtureId}`,
                    },
                };
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    return {
        title: 'Live Streaming Sepakbola',
        description: 'Nonton live streaming sepakbola gratis di SportMeriah.',
    };
}

export default async function MatchPage({ params, searchParams }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    return <MatchPageClient params={resolvedParams} searchParams={resolvedSearchParams} />;
}
