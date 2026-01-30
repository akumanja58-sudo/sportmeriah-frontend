import FootballPlayerClient from './FootballPlayerClient';

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Default metadata
  let title = 'Live Streaming Football | SportMeriah';
  let description = 'Nonton live streaming football gratis di SportMeriah. Kualitas HD, tanpa buffering.';

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';
    const res = await fetch(`${API_URL}/api/football/stream/${id}`, { next: { revalidate: 60 } });
    const data = await res.json();

    if (data.success && data.stream) {
      const streamName = data.stream.name || 'Football';
      title = `${streamName} - Live Streaming | SportMeriah`;
      description = `Nonton ${streamName} live streaming gratis di SportMeriah. Kualitas HD, server stabil, tanpa buffering.`;
    }

    if (data.match) {
      const homeName = data.match.homeTeam?.name || 'Home';
      const awayName = data.match.awayTeam?.name || 'Away';
      const leagueName = data.match.league?.name || 'Football';
      title = `${homeName} vs ${awayName} - ${leagueName} Live | SportMeriah`;
      description = `Nonton ${homeName} vs ${awayName} (${leagueName}) live streaming gratis di SportMeriah. Kualitas HD, tanpa buffering.`;
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'SportMeriah',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function FootballPlayerPage({ params }) {
  const { id } = await params;
  return <FootballPlayerClient streamId={id} />;
}
