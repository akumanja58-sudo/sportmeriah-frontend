export async function generateMetadata({ params }) {
  const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

  // Next.js 15: params is now a Promise
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/matches/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    const channel = await res.json();

    if (!channel?.name) {
      return {
        title: 'Live Streaming | SportMeriah',
        description: 'Nonton live streaming bola gratis di SportMeriah',
      };
    }

    // Parse channel name
    let cleanTitle = channel.name.replace(/^USA\s*Soccer\d*:\s*/i, '');
    cleanTitle = cleanTitle.replace(/@\s*\d{1,2}:\d{2}\s*(am|pm)\s*EST/i, '').trim();

    // Extract teams if possible
    const vsMatch = cleanTitle.match(/(.+?)\s*:\s*(.+?)\s+vs\s+(.+)/i);
    let matchTitle = cleanTitle;
    let league = '';

    if (vsMatch) {
      league = vsMatch[1].replace(/^.+?\s*-\s*/, '').trim();
      matchTitle = `${vsMatch[2].trim()} vs ${vsMatch[3].trim()}`;
    }

    const title = `${matchTitle} Live Streaming`;
    const description = `Nonton ${matchTitle} live streaming gratis di SportMeriah. ${league ? `Pertandingan ${league}.` : ''} Kualitas HD, tanpa buffering, tanpa ribet!`;

    return {
      title,
      description,
      keywords: [
        matchTitle.toLowerCase(),
        `${matchTitle.toLowerCase()} live`,
        `nonton ${matchTitle.toLowerCase()}`,
        `streaming ${matchTitle.toLowerCase()}`,
        league.toLowerCase(),
        'live streaming bola',
        'nonton bola gratis',
        'sportmeriah'
      ],
      openGraph: {
        title: `${title} | SportMeriah`,
        description,
        url: `https://sportmeriah.com/match/${id}`,
        siteName: 'SportMeriah',
        type: 'video.other',
        images: [
          {
            url: '/sportmeriah-icon.png',
            width: 1200,
            height: 630,
            alt: matchTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | SportMeriah`,
        description,
        images: ['/sportmeriah-icon.png'],
      },
      alternates: {
        canonical: `https://sportmeriah.com/match/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Live Streaming | SportMeriah',
      description: 'Nonton live streaming bola gratis di SportMeriah',
    };
  }
}

export default function MatchLayout({ children }) {
  return children;
}
