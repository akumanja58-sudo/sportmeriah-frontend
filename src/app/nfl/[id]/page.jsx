import NFLPlayerClient from './NFLPlayerClient';

export default async function NFLPlayerPage({ params }) {
    const { id } = await params;
    return <NFLPlayerClient streamId={id} />;
}