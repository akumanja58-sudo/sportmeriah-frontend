// app/robots.js
// This will auto-generate robots.txt at /robots.txt

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/_next/',
                    '/admin/',
                    '/*.json$',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
            },
        ],
        sitemap: 'https://www.sportmeriah.com/sitemap.xml',
        host: 'https://www.sportmeriah.com',
    };
}
