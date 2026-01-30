import { Metadata } from 'next';
import FootballPageClient from './FootballPageClient';

export const metadata = {
    title: 'Live Streaming Football Gratis - Premier League, La Liga, Serie A | SportMeriah',
    description: 'Nonton live streaming football gratis di SportMeriah. Premier League, La Liga, Serie A, UEFA Champions League, MLS dan liga sepakbola lainnya dengan kualitas HD.',
    keywords: 'streaming bola gratis, live football, premier league streaming, la liga live, serie a streaming, uefa champions league, nonton bola online, live sepakbola',
    openGraph: {
        title: 'Live Streaming Football Gratis | SportMeriah',
        description: 'Nonton live streaming football gratis - Premier League, La Liga, Serie A, UEFA Champions League',
        type: 'website',
        url: 'https://sportmeriah.com/football',
        images: [
            {
                url: 'https://sportmeriah.com/og-football.jpg',
                width: 1200,
                height: 630,
                alt: 'SportMeriah Football Streaming'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Live Streaming Football Gratis | SportMeriah',
        description: 'Nonton live streaming football gratis - Premier League, La Liga, Serie A, UEFA Champions League'
    },
    alternates: {
        canonical: 'https://sportmeriah.com/football'
    }
};

export default function FootballPage() {
    return <FootballPageClient />;
}
