'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// ========== STATUS HELPERS ==========
function isLiveStatus(status) {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'];
    return liveStatuses.includes(status);
}

function isFinishedStatus(status) {
    const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
    return finishedStatuses.includes(status);
}

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function FootballPage() {
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFixtures();

        // Refresh setiap 60 detik
        const interval = setInterval(fetchFixtures, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchFixtures = async () => {
        try {
            const res = await fetch(`${API_URL}/api/fixtures/today`);
            const data = await res.json();

            if (data.success && data.fixtures) {
                setFixtures(data.fixtures);
            }
        } catch (error) {
            console.error('Failed to fetch fixtures:', error);
        } finally {
            setLoading(false);
        }
    };

    // Separate LIVE, Upcoming, and Finished
    const liveMatches = fixtures.filter(f => isLiveStatus(f.status?.short));
    const upcomingMatches = fixtures.filter(f => f.status?.short === 'NS');
    const finishedMatches = fixtures.filter(f => isFinishedStatus(f.status?.short));

    // Stats
    const totalMatches = fixtures.length;
    const withStream = fixtures.filter(f => f.stream).length;

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            <IoHome size={20} />
                        </Link>
                        <span className="text-gray-600">/</span>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                            <MdSportsSoccer className="text-green-500" />
                            Sepakbola
                        </h1>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Stats */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <MdSportsSoccer className="text-green-500" />
                                Football Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Matches</span>
                                    <span className="text-white font-bold">{totalMatches}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Live Now</span>
                                    <span className="text-red-500 font-bold">{liveMatches.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Upcoming</span>
                                    <span className="text-orange-500 font-bold">{upcomingMatches.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">With Stream</span>
                                    <span className="text-green-500 font-bold">{withStream}</span>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/" className="block text-gray-400 hover:text-white text-sm">
                                        ← Kembali ke Beranda
                                    </Link>
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-sm flex items-center gap-2">
                                        <MdSportsBasketball size={16} />
                                        Lihat Basketball
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4 order-1 lg:order-2 space-y-6">

                        {loading ? (
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <span className="loader"></span>
                                </div>
                                <p className="text-gray-400">Memuat jadwal pertandingan...</p>
                                <style jsx>{`
                                    .loader {
                                        width: 48px;
                                        height: 48px;
                                        border-radius: 50%;
                                        display: inline-block;
                                        border-top: 4px solid #FFF;
                                        border-right: 4px solid transparent;
                                        box-sizing: border-box;
                                        animation: rotation 1s linear infinite;
                                        position: relative;
                                    }
                                    .loader::after {
                                        content: '';
                                        box-sizing: border-box;
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                        width: 48px;
                                        height: 48px;
                                        border-radius: 50%;
                                        border-left: 4px solid #FF3D00;
                                        border-bottom: 4px solid transparent;
                                        animation: rotation 0.5s linear infinite reverse;
                                    }
                                    @keyframes rotation {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <>
                                {/* LIVE Section */}
                                {liveMatches.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                        </h2>
                                        <div className="space-y-3">
                                            {liveMatches.map((fixture) => (
                                                <MatchCard
                                                    key={fixture.id}
                                                    fixture={fixture}
                                                    isLive={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Section */}
                                {upcomingMatches.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            ⏰ Upcoming
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingMatches.map((fixture) => (
                                                <MatchCard
                                                    key={fixture.id}
                                                    fixture={fixture}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Finished Section */}
                                {finishedMatches.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            ✅ Selesai
                                        </h2>
                                        <div className="space-y-3">
                                            {finishedMatches.map((fixture) => (
                                                <MatchCard
                                                    key={fixture.id}
                                                    fixture={fixture}
                                                    isLive={false}
                                                    isFinished={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {fixtures.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">⚽</p>
                                        <p className="text-gray-400">Tidak ada pertandingan tersedia saat ini</p>
                                        <Link href="/" className="text-green-500 hover:underline mt-4 inline-block">
                                            ← Kembali ke Beranda
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEO Description */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-xl font-semibold text-white">
                                Nonton Streaming Sepakbola Gratis
                            </h2>
                            <p>
                                Nonton streaming sepakbola gratis di SportMeriah. Liga Champions, Europa League,
                                Conference League, Premier League, La Liga, Serie A, Bundesliga, dan liga top lainnya.
                            </p>
                            <p>
                                Kualitas terbaik, server tercepat, dan update skor real-time. Tonton sekarang!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-2 sm:px-4 py-2 text-green-400">
                        <MdSportsSoccer size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-orange-400 transition-colors">
                        <MdSportsBasketball size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTelegram size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Telegram</span>
                    </a>
                </div>
            </nav>

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== MATCH CARD COMPONENT ==========
function MatchCard({ fixture, isLive, isFinished = false }) {
    const { teams, league, status, goals, stream, date, id } = fixture;
    const hasStream = !!stream;

    const matchUrl = hasStream
        ? `/match/${id}?stream=${stream.stream_id}`
        : `/match/${id}`;

    return (
        <Link href={matchUrl}>
            <div className={`bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative ${!hasStream ? 'opacity-70' : ''} ${isFinished ? 'opacity-60' : ''}`}>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {status?.elapsed ? `${status.elapsed}'` : 'LIVE'}
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : isFinished ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isLive ? '🔴 Sedang Tayang' : isFinished ? 'Selesai' : `Upcoming - ${formatKickoffTime(date)}`}
                    </span>
                    <span className="text-green-400 truncate max-w-[120px] sm:max-w-[200px] flex items-center gap-1">
                        <MdSportsSoccer size={12} />
                        {league?.name || 'Football'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-2.5 gap-2">

                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                            {teams?.home?.name || 'Home'}
                        </span>
                        <img
                            src={teams?.home?.logo}
                            alt={teams?.home?.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=⚽'}
                        />
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-2">
                        {(isLive || isFinished) ? (
                            <span className="text-white text-sm sm:text-base font-bold">
                                {goals?.home ?? 0} - {goals?.away ?? 0}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                            src={teams?.away?.logo}
                            alt={teams?.away?.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=⚽'}
                        />
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {teams?.away?.name || 'Away'}
                        </span>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 ml-2">
                        {hasStream ? (
                            <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : isFinished ? 'bg-gray-500' : 'bg-green-600 group-hover:bg-green-700'}`}>
                                {isLive ? 'Tonton ▶' : isFinished ? 'Selesai' : 'Tonton'}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded bg-gray-600">
                                No Stream
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
