import BohoPlayerClient from './BohoPlayerClient';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const matchId = decodeURIComponent(id);

    // Format title from match ID (e.g. "liverpool-vs-arsenal-12345" -> "Liverpool vs Arsenal")
    const titleParts = matchId.split('-');
    const vsIndex = titleParts.indexOf('vs');
    let title = 'Live Streaming | NobarMeriah';

    if (vsIndex > 0) {
        const home = titleParts.slice(0, vsIndex).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const awayParts = titleParts.slice(vsIndex + 1);
        // Remove trailing number ID if present
        const lastPart = awayParts[awayParts.length - 1];
        if (/^\d+$/.test(lastPart)) awayParts.pop();
        const away = awayParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        title = `${home} vs ${away} Live Streaming | NobarMeriah`;
    }

    return {
        title,
        description: `Nonton ${title} live streaming gratis di NobarMeriah. Kualitas HD, multi server, tanpa buffering.`,
        openGraph: {
            title,
            description: `Nonton ${title} live streaming gratis di NobarMeriah.`,
            type: 'website',
            siteName: 'NobarMeriah',
        },
    };
}

export default async function BohoPlayerPage({ params }) {
    const { id } = await params;
    return <BohoPlayerClient matchId={decodeURIComponent(id)} />;
}
