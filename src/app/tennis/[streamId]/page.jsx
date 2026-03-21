import TennisPlayerClient from '../../components/TennisPlayerClient';

export async function generateMetadata({ params }) {
    return {
        title: 'Tennis Live Stream | NobarMeriah',
        description: 'Nonton live streaming tennis ATP, WTA, dan Grand Slam gratis di NobarMeriah.',
    };
}

export default async function TennisPlayerPage({ params }) {
    const { streamId } = await params;
    return <TennisPlayerClient streamId={streamId} />;
}
