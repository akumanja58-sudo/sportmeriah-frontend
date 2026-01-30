// app/tennis/[id]/page.jsx
// SERVER COMPONENT - untuk Dynamic SEO metadata

import TennisMatchPageClient from './TennisMatchPageClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

export async function generateMetadata({ params }) {
    const matchId = params.id;

    try {
        const res = await fetch(`${API_URL}/api/tennis`, {
            next: { revalidate: 60 }
        });
        const data = await res.json();

        if (data.success && data.matches) {
            const match = data.matches.find(m => String(m.id) === String(matchId));

            if (match) {
                const player1 = match.player1?.name || 'Player 1';
                const player2 = match.player2?.name || 'Player 2';
                const matchTitle = `${player1} vs ${player2}`;
                const tournament = match.tournament?.name || 'Tennis';

                return {
                    title: `Live Streaming ${matchTitle} - ${tournament}`,
                    description: `Nonton live streaming Tennis ${matchTitle} gratis di SportMeriah. ${tournament} dengan kualitas HD tanpa buffering!`,
                    openGraph: {
                        title: `🎾 LIVE: ${matchTitle} - ${tournament}`,
                        description: `Nonton live streaming Tennis ${matchTitle} gratis!`,
                        url: `https://www.sportmeriah.com/tennis/${matchId}`,
                        siteName: 'SportMeriah',
                        images: [
                            {
                                url: '/og-image.png',
                                width: 200,
                                height: 200,
                                alt: matchTitle,
                            },
                        ],
                        locale: 'id_ID',
                        type: 'website',
                    },
                    twitter: {
                        card: 'summary',
                        title: `🎾 LIVE: ${matchTitle} - ${tournament}`,
                        description: `Nonton live streaming Tennis ${matchTitle} gratis!`,
                    },
                    alternates: {
                        canonical: `https://www.sportmeriah.com/tennis/${matchId}`,
                    },
                };
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    return {
        title: 'Live Streaming Tennis',
        description: 'Nonton live streaming Tennis gratis di SportMeriah.',
    };
}

export default function TennisMatchPage({ params, searchParams }) {
    return <TennisMatchPageClient params={params} searchParams={searchParams} />;
}
