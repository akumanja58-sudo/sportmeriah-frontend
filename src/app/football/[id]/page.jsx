import FootballPlayerClient from './FootballPlayerClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

export async function generateMetadata({ params, searchParams }) {
  const { id: fixtureId } = await params;

  // Default metadata
  let title = 'Live Streaming Sepakbola | SportMeriah';
  let description = 'Nonton live streaming sepakbola gratis di SportMeriah. Kualitas HD, tanpa buffering.';

  try {
    const res = await fetch(`${API_URL}/api/fixtures/${fixtureId}`, { next: { revalidate: 60 } });
    const data = await res.json();

    if (data.success && data.fixture) {
      const fixture = data.fixture;
      const homeName = fixture.teams?.home?.name || 'Home';
      const awayName = fixture.teams?.away?.name || 'Away';
      const leagueName = fixture.league?.name || 'Football';

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

export default async function FootballPlayerPage({ params, searchParams }) {
  const { id: fixtureId } = await params;
  return <FootballPlayerClient fixtureId={fixtureId} />;
}
