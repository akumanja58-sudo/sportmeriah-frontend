// app/basketball/[id]/page.jsx
// SERVER COMPONENT - untuk Dynamic SEO metadata

import BasketballMatchPageClient from './BasketballMatchPageClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

export async function generateMetadata({ params }) {
    const matchId = params.id;
    
    try {
        const res = await fetch(`${API_URL}/api/basketball`, {
            next: { revalidate: 60 }
        });
        const data = await res.json();
        
        if (data.success && data.matches) {
            const match = data.matches.find(m => m.id === parseInt(matchId));
            
            if (match) {
                const homeTeam = match.homeTeam?.name || 'Home';
                const awayTeam = match.awayTeam?.name || 'Away';
                const matchTitle = `${homeTeam} vs ${awayTeam}`;
                
                return {
                    title: `Live Streaming ${matchTitle} - NBA Basketball`,
                    description: `Nonton live streaming NBA ${matchTitle} gratis di SportMeriah. Basketball dengan kualitas HD tanpa buffering!`,
                    openGraph: {
                        title: `🏀 LIVE: ${matchTitle} - NBA`,
                        description: `Nonton live streaming NBA ${matchTitle} gratis!`,
                        url: `https://www.sportmeriah.com/basketball/${matchId}`,
                        siteName: 'SportMeriah',
                        images: [
                            {
                                url: match.homeTeam?.logo || '/og-image.png',
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
                        title: `🏀 LIVE: ${matchTitle} - NBA`,
                        description: `Nonton live streaming NBA ${matchTitle} gratis!`,
                    },
                    alternates: {
                        canonical: `https://www.sportmeriah.com/basketball/${matchId}`,
                    },
                };
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }
    
    return {
        title: 'Live Streaming NBA Basketball',
        description: 'Nonton live streaming NBA Basketball gratis di SportMeriah.',
    };
}

export default function BasketballMatchPage({ params, searchParams }) {
    return <BasketballMatchPageClient params={params} searchParams={searchParams} />;
}
