import { Metadata } from 'next';
import FootballPageClient from './FootballPageClient';

export const metadata = {
    title: 'Live Streaming Football Gratis - Premier League, La Liga, Serie A | NobarMeriah',
    description: 'Nonton live streaming football gratis di NobarMeriah. Premier League, La Liga, Serie A, UEFA Champions League, MLS dan liga sepakbola lainnya dengan kualitas HD.',
    keywords: 'streaming bola gratis, live football, premier league streaming, la liga live, serie a streaming, uefa champions league, nonton bola online, live sepakbola',
    openGraph: {
        title: 'Live Streaming Football Gratis | NobarMeriah',
        description: 'Nonton live streaming football gratis - Premier League, La Liga, Serie A, UEFA Champions League',
        type: 'website',
        url: 'https://www.nobarmeriah.com/football',
        images: [
            {
                url: 'https://www.nobarmeriah.com/og-football.jpg',
                width: 1200,
                height: 630,
                alt: 'NobarMeriah Football Streaming'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Live Streaming Football Gratis | NobarMeriah',
        description: 'Nonton live streaming football gratis - Premier League, La Liga, Serie A, UEFA Champions League'
    },
    alternates: {
        canonical: 'https://www.nobarmeriah.com/football'
    }
};

export default function FootballPage() {
    return <FootballPageClient />;
}
