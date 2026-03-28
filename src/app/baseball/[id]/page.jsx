import BaseballPlayerClient from './BaseballPlayerClient';

export default async function BaseballPlayerPage({ params }) {
    const { id } = await params;
    return <BaseballPlayerClient streamId={id} />;
}