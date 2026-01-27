import './globals.css';

export const metadata = {
    title: 'SportMeriah - Nonton Bola Gratis',
    description: 'Streaming bola gratis tanpa iklan',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body>{children}</body>
        </html>
    );
}