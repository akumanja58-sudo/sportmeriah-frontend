'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ backgroundColor: '#0a0c14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>404</h1>
                <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Halaman tidak ditemukan</p>
                <Link href="/" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: '500' }}>
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}