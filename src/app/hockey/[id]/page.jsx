import HockeyPlayerClient from './HockeyPlayerClient';

export default async function HockeyPlayerPage({ params }) {
    const { id } = await params;
    return <HockeyPlayerClient streamId={id} />;
}