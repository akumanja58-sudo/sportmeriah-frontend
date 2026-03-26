import SportPlayerClient from '../../../components/SportPlayerClient';
import { SPORT_CONFIGS } from '../../../components/SportPageClient';

export async function generateMetadata({ params }) {
    const { sport } = await params;
    const config = SPORT_CONFIGS[sport];
    const name = config?.name || 'Sports';

    return {
        title: `Live ${name} Stream - NobarMeriah`,
        description: `Nonton live streaming ${name} gratis di NobarMeriah. HD tanpa buffering!`,
    };
}

export default async function SportPlayerPage({ params }) {
    const { sport, streamId } = await params;
    return <SportPlayerClient sport={sport} streamId={streamId} />;
}