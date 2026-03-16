import MotorsportPlayerClient from '../../components/MotorsportPlayerClient';

export async function generateMetadata({ params }) {
    return {
        title: `Motorsport Live Stream | NobarMeriah`,
        description: 'Nonton live streaming Formula 1, MotoGP, dan motorsport lainnya gratis di NobarMeriah.',
    };
}

export default function MotorsportStreamPage({ params }) {
    return <MotorsportPlayerClient streamId={params.streamId} />;
}
