// ============================================================
// TEMPLATE: app/sports/[sport]/[streamId]/page.jsx
// Player page for any sport stream
// ============================================================

import SportPlayerClient from '../../../components/SportPlayerClient';
import { SPORT_CONFIGS } from '../../../components/SportPageClient';

export async function generateMetadata({ params }) {
    const { sport, streamId } = params;
    const config = SPORT_CONFIGS[sport];
    const name = config?.name || 'Sports';

    return {
        title: `Live ${name} Stream - SportMeriah`,
        description: `Nonton live streaming ${name} gratis di SportMeriah. HD tanpa buffering!`,
    };
}

export default function SportPlayerPage({ params }) {
    const { sport, streamId } = params;
    return <SportPlayerClient sport={sport} streamId={streamId} />;
}
