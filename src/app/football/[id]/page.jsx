import { Metadata } from 'next';
import FootballPlayerClient from './FootballPlayerClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // Default metadata
  let title = 'Live Streaming Football | SportMeriah';
  let description = 'Nonton live streaming football gratis di SportMeriah dengan kualitas HD.';

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';
    const response = await fetch(`${API_URL}/api/football/stream/${id}`, {
      next: { revalidate: 60 }
    });
    const data = await response.json();

    if (data.success && data.stream) {
      title = `Live Streaming ${data.stream.name} - Football | SportMeriah`;
      description = `Nonton live streaming ${data.stream.name} gratis di SportMeriah. Streaming football dengan kualitas HD tanpa buffering.`;
    }
  } catch (error) {
    console.error('Error fetching stream metadata:', error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: `https://sportmeriah.com/football/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://sportmeriah.com/football/${id}`
    }
  };
}

export default function FootballPlayerPage({ params }) {
  return <FootballPlayerClient streamId={params.id} />;
}
