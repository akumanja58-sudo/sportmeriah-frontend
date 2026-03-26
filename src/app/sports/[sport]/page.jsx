import SportPageClient, { SPORT_CONFIGS } from '../../components/SportPageClient';

export async function generateStaticParams() {
    return Object.keys(SPORT_CONFIGS).map((sport) => ({
        sport: sport,
    }));
}

export async function generateMetadata({ params }) {
    const { sport } = await params;
    const config = SPORT_CONFIGS[sport];

    if (!config) {
        return { title: 'Sport Not Found - NobarMeriah' };
    }

    return {
        title: config.seoTitle,
        description: config.seoDesc,
        openGraph: {
            title: config.seoTitle,
            description: config.seoDesc,
            url: `https://www.nobarmeriah.com/sports/${sport}`,
        },
    };
}

export default async function SportPage({ params }) {
    const { sport } = await params;
    return <SportPageClient sport={sport} />;
}