// app/sitemap.js
// This will auto-generate sitemap.xml at /sitemap.xml

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

export default async function sitemap() {
    const baseUrl = 'https://www.sportmeriah.com';
    
    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/football`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/basketball`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
    ];
    
    // Dynamic pages - Football matches
    let footballMatches = [];
    try {
        const footballRes = await fetch(`${API_URL}/api/fixtures/today`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const footballData = await footballRes.json();
        
        if (footballData.success && footballData.fixtures) {
            footballMatches = footballData.fixtures.map((fixture) => ({
                url: `${baseUrl}/match/${fixture.id}`,
                lastModified: new Date(),
                changeFrequency: 'hourly',
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Error fetching football for sitemap:', error);
    }
    
    // Dynamic pages - Basketball matches
    let basketballMatches = [];
    try {
        const basketballRes = await fetch(`${API_URL}/api/basketball`, {
            next: { revalidate: 3600 }
        });
        const basketballData = await basketballRes.json();
        
        if (basketballData.success && basketballData.matches) {
            basketballMatches = basketballData.matches.map((match) => ({
                url: `${baseUrl}/basketball/${match.id}`,
                lastModified: new Date(),
                changeFrequency: 'hourly',
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Error fetching basketball for sitemap:', error);
    }
    
    return [...staticPages, ...footballMatches, ...basketballMatches];
}
