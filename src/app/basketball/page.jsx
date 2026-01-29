'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { MdSportsBasketball } from 'react-icons/md';
import { FaTelegram, FaWhatsapp, FaTrophy } from 'react-icons/fa';
import { IoHome, IoCalendar } from 'react-icons/io5';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// ========== STATUS HELPERS ==========
function isLiveStatus(status) {
    const liveStatuses = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'HT', 'BT', 'LIVE'];
    return liveStatuses.includes(status);
}

function isFinishedStatus(status) {
    const finishedStatuses = ['FT', 'AOT', 'POST'];
    return finishedStatuses.includes(status);
}

function isUpcomingStatus(status) {
    return status === 'NS';
}

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function NbaPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();

        // Refresh setiap 60 detik untuk update status LIVE
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/basketball`);
            const data = await res.json();

            if (data.success && data.matches) {
                setMatches(data.matches);
            }
        } catch (error) {
            console.error('Failed to fetch NBA matches:', error);
        } finally {
            setLoading(false);
        }
    };

    // Separate LIVE, Upcoming, and Finished
    const liveMatches = matches.filter(m => isLiveStatus(m.status.short));
    const upcomingMatches = matches.filter(m => isUpcomingStatus(m.status.short));
    const finishedMatches = matches.filter(m => isFinishedStatus(m.status.short));

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-7xl mx-auto px-4 py-6">

                {/* ========== BANNER SECTION ========== */}
                <div className="mb-6 space-y-2">
                    {BANNERS.map((banner) => (
                        <div key={banner.id} className="banner-slot">
                            <a href={banner.link} target="_blank" rel="noopener">
                                <img
                                    src={banner.src}
                                    alt={`Banner ${banner.id}`}
                                    className="w-full rounded-lg hover:opacity-90 transition-opacity"
                                    onError={(e) => e.target.parentElement.parentElement.style.display = 'none'}
                                />
                            </a>
                        </div>
                    ))}
                </div>

                {/* ========== PAGE HEADER ========== */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                        <MdSportsBasketball className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">NBA Basketball</h1>
                        <p className="text-gray-400 text-sm">Live streaming NBA games</p>
                    </div>
                </div>

                {/* ========== MAIN CONTENT ========== */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ========== SIDEBAR (Kiri) ========== */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
                            {/* Back to Home */}
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
                            >
                                <IoHome /> Kembali ke Beranda
                            </Link>

                            {/* Stats */}
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FaTrophy className="text-orange-500" />
                                NBA Stats
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Total Matches</span>
                                    <span className="text-white font-semibold">{matches.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Live Now</span>
                                    <span className="text-red-500 font-semibold">{liveMatches.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Upcoming</span>
                                    <span className="text-orange-500 font-semibold">{upcomingMatches.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>With Stream</span>
                                    <span className="text-green-500 font-semibold">{matches.filter(m => m.hasStream).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== MAIN CONTENT (Kanan) ========== */}
                    <div className="w-full lg:w-3/4 order-1 lg:order-2">

                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                                <span className="loader"></span>
                                <p className="text-gray-400 mt-4">Memuat pertandingan NBA...</p>
                                <style jsx>{`
                                    .loader {
                                        width: 48px;
                                        height: 48px;
                                        border-radius: 50%;
                                        display: inline-block;
                                        border-top: 4px solid #f97316;
                                        border-right: 4px solid transparent;
                                        box-sizing: border-box;
                                        animation: rotation 1s linear infinite;
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
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({liveMatches.length} games)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {liveMatches.map((match) => (
                                                <NbaMatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Section */}
                                {upcomingMatches.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <IoCalendar className="text-orange-500" />
                                            Upcoming Games
                                            <span className="text-xs text-gray-400 font-normal">
                                                ({upcomingMatches.length} games)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingMatches.map((match) => (
                                                <NbaMatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={false}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Finished Section */}
                                {finishedMatches.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                            Finished Games
                                            <span className="text-xs font-normal">
                                                ({finishedMatches.length} games)
                                            </span>
                                        </h2>
                                        <div className="space-y-3">
                                            {finishedMatches.map((match) => (
                                                <NbaMatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isLive={false}
                                                    isFinished={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {matches.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">🏀</p>
                                        <p className="text-gray-400">Tidak ada pertandingan NBA tersedia saat ini</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ========== SEO DESCRIPTION ========== */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-xl font-semibold text-white">
                                Nonton Streaming NBA Gratis di SportMeriah
                            </h2>
                            <p>
                                Nonton streaming NBA gratis di SportMeriah. Kualitas terbaik, server tercepat, dan update real-time.
                            </p>
                            <p>
                                Tersedia berbagai pertandingan NBA musim 2025-2026. Tonton sekarang tanpa ribet!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== BOTTOM NAV MOBILE ========== */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
                        <MdSportsBasketball size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTelegram size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Telegram</span>
                    </a>
                    <a href="https://wa.me/6281234567890" target="_blank" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-green-400 transition-colors">
                        <FaWhatsapp size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">WhatsApp</span>
                    </a>
                </div>
            </nav>

            {/* Padding bottom untuk mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== NBA MATCH CARD COMPONENT ==========
function NbaMatchCard({ match, isLive, isFinished = false }) {
    const { homeTeam, awayTeam, status, scores, stream, date, id } = match;
    const hasStream = !!stream;

    // Link ke player page
    const matchUrl = hasStream
        ? `/basketball/${id}?stream=${stream.streamId}`
        : `/basketball/${id}`;

    // Get quarter info
    const getQuarterDisplay = () => {
        if (status.short === 'Q1') return 'Q1';
        if (status.short === 'Q2') return 'Q2';
        if (status.short === 'Q3') return 'Q3';
        if (status.short === 'Q4') return 'Q4';
        if (status.short === 'OT') return 'OT';
        if (status.short === 'HT') return 'HT';
        if (status.short === 'BT') return 'Break';
        return '';
    };

    return (
        <Link href={matchUrl}>
            <div className={`bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative ${!hasStream && !isFinished ? 'opacity-70' : ''}`}>

                {/* Live Badge - Top Left */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {getQuarterDisplay() || 'LIVE'}
                    </div>
                )}

                {/* Header - Status & League */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : isFinished ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isLive ? '🔴 Sedang Tayang' : isFinished ? 'Final' : `Upcoming - ${formatKickoffTime(date)}`}
                    </span>
                    <span className="text-orange-400 font-semibold">
                        NBA
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-2.5 gap-2">

                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                            {homeTeam.name}
                        </span>
                        <img
                            src={homeTeam.logo}
                            alt={homeTeam.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🏀'}
                        />
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-2">
                        {(isLive || isFinished) && scores?.home?.total !== null ? (
                            <span className={`text-sm sm:text-base font-bold ${isFinished ? 'text-gray-400' : 'text-white'}`}>
                                {scores.home.total ?? 0} - {scores.away.total ?? 0}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                            src={awayTeam.logo}
                            alt={awayTeam.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                            onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🏀'}
                        />
                        <span className="text-white text-xs sm:text-sm font-medium truncate">
                            {awayTeam.name}
                        </span>
                    </div>

                    {/* Tombol Tonton */}
                    <div className="flex-shrink-0 ml-2">
                        {hasStream ? (
                            <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : 'bg-orange-500 group-hover:bg-orange-600'}`}>
                                {isLive ? 'Tonton ▶' : 'Tonton'}
                            </span>
                        ) : isFinished ? (
                            <span className="text-gray-500 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded bg-gray-600">
                                Selesai
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
