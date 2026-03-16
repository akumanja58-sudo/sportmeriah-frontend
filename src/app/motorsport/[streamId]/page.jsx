import MotorsportPlayerClient from '../../components/MotorsportPlayerClient';

export async function generateMetadata({ params }) {
    return {
        title: `Motorsport Live Stream | NobarMeriah`,
        description: 'Nonton live streaming Formula 1, MotoGP, dan motorsport lainnya gratis di NobarMeriah.',
    };
}

export default async function MotorsportPlayerPage({ params }) {
    const { streamId } = await params;
    return <MotorsportPlayerClient streamId={streamId} />;
}