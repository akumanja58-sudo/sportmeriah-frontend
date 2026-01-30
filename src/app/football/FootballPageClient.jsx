'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdSportsSoccer, MdHome, MdRefresh, MdLiveTv, MdFilterList, MdSearch } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

export default function FootballPageClient() {
    const [streams, setStreams] = useState({ live: [], all: [] });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, liveCount: 0 });

    useEffect(() => {
        fetchStreams();
        const interval = setInterval(fetchStreams, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchStreams = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/api/football`);
            const data = await response.json();

            if (data.success) {
                setStreams({
                    live: data.matches?.live || [],
                    all: [...(data.matches?.upcoming || []), ...(data.extraChannels || [])]
                });
                setCategories(data.categories || []);
                setStats({
                    total: data.stats?.total || 0,
                    liveCount: data.stats?.live || 0
                });
            } else {
                setError(data.error || 'Failed to fetch streams');
            }
        } catch (err) {
            console.error('Error fetching streams:', err);
            setError('Gagal memuat data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Filter streams based on search and category
    const filterStreams = (streamList) => {
        return streamList.filter(stream => {
            const matchesSearch = searchQuery === '' ||
                stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                stream.originalName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                stream.category?.id === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    };

    const filteredLive = filterStreams(streams.live);
    const filteredAll = filterStreams(streams.all);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <MdSportsSoccer className="text-6xl text-green-500 animate-bounce mx-auto mb-4" />
                    <p className="text-xl">Memuat siaran Football...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <MdSportsSoccer className="text-3xl" />
                            <h1 className="text-2xl font-bold">Football Streaming</h1>
                        </div>
                        <button
                            onClick={fetchStreams}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                        >
                            <MdRefresh className="text-xl" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            📺 {stats.total} Siaran
                        </div>
                        <div className="bg-red-500/80 px-3 py-1 rounded-full animate-pulse">
                            🔴 {stats.liveCount} Live
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari pertandingan atau channel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:border-green-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Semua Liga</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={fetchStreams}
                            className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Live Streams */}
                {filteredLive.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="bg-red-600 px-2 py-0.5 rounded text-sm animate-pulse">LIVE</span>
                            Sedang Berlangsung
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLive.map(stream => (
                                <StreamCard key={stream.id} stream={stream} isLive={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* All Streams */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MdLiveTv className="text-green-500" />
                        Semua Siaran ({filteredAll.length})
                    </h2>

                    {filteredAll.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <MdSportsSoccer className="text-5xl mx-auto mb-3 opacity-50" />
                            <p>Tidak ada siaran ditemukan</p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 text-green-400 hover:underline"
                                >
                                    Reset pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAll.map(stream => (
                                <StreamCard key={stream.id} stream={stream} isLive={false} />
                            ))}
                        </div>
                    )}
                </section>

                {/* SEO Content */}
                <section className="mt-12 bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-3">Streaming Football Gratis di SportMeriah</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        SportMeriah menyediakan layanan live streaming football gratis dengan kualitas HD.
                        Tonton pertandingan dari berbagai liga top dunia termasuk Premier League (Liga Inggris),
                        La Liga (Liga Spanyol), Serie A (Liga Italia), UEFA Champions League, Europa League,
                        MLS, dan masih banyak lagi. Nikmati streaming sepakbola tanpa buffering dengan server
                        yang stabil dan cepat.
                    </p>
                </section>
            </div>

            {/* Promo Banners */}
            <div className="max-w-6xl mx-auto px-4 mt-6 space-y-3">
                <a href="https://gifmeriah4d.com" target="_blank" rel="noopener noreferrer">
                    <img src="/banners/GIFMERIAH4D.gif" alt="GIFMERIAH4D" className="w-full rounded-lg" />
                </a>
                <a href="https://pesiarbet.com" target="_blank" rel="noopener noreferrer">
                    <img src="/banners/promo-pesiarbet.gif" alt="Pesiarbet" className="w-full rounded-lg" />
                </a>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
                <div className="flex justify-around py-3">
                    <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
                        <MdHome className="text-2xl" />
                        <span className="text-xs">Home</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center text-green-500">
                        <MdSportsSoccer className="text-2xl" />
                        <span className="text-xs">Football</span>
                    </Link>
                    <button onClick={fetchStreams} className="flex flex-col items-center text-gray-400 hover:text-white">
                        <MdRefresh className="text-2xl" />
                        <span className="text-xs">Refresh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stream Card Component
function StreamCard({ stream, isLive }) {
    // Handle both formats (API Sports match or IPTV channel)
    const matchName = stream.homeTeam
        ? `${stream.homeTeam.name} vs ${stream.awayTeam.name}`
        : stream.name || 'Unknown Match';

    const leagueName = stream.league?.name || stream.category?.name || 'Football';

    // Use fixture ID for API Sports match, stream ID for IPTV channel
    const linkId = stream.stream?.id || stream.id;

    return (
        <Link
            href={`/football/${linkId}`}
            className="block bg-gray-800 hover:bg-gray-750 rounded-lg overflow-hidden transition hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10"
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2">{matchName}</h3>
                    {isLive && (
                        <span className="bg-red-600 px-2 py-0.5 rounded text-xs whitespace-nowrap animate-pulse">
                            LIVE
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 text-xs bg-gray-700 px-2 py-0.5 rounded">
                        {leagueName}
                    </span>

                    <span className="text-green-400 text-xs">
                        ▶ Tonton
                    </span>
                </div>
            </div>
        </Link>
    );
}
