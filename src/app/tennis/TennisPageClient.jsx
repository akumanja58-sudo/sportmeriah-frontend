'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

// React Icons
import { MdSportsTennis } from 'react-icons/md';
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
function isLiveStatus(match) {
    if (match?.status?.live === true || match?.status?.live === '1') return true;
    const status = (match?.status?.short || match?.status?.long || '').toUpperCase();
    const liveStatuses = ['SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5', 'LIVE', 'IN PROGRESS', 'PLAYING'];
    return liveStatuses.some(s => status.includes(s));
}

function isFinishedStatus(match) {
    const status = (match?.status?.short || match?.status?.long || '').toUpperCase();
    const finishedStatuses = ['FINISHED', 'ENDED', 'RETIRED', 'WALKOVER', 'CANCELLED', 'POSTPONED'];
    return finishedStatuses.some(s => status.includes(s));
}

function isUpcomingStatus(match) {
    if (isLiveStatus(match) || isFinishedStatus(match)) return false;
    return true;
}

// ========== FORMAT TIME ==========
function formatKickoffTime(date, time) {
    if (time) return `${time} WIB`;
    if (date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes} WIB`;
    }
    return '-';
}

export default function TennisPageClient() {
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
            const res = await fetch(`${API_URL}/api/tennis`);
            const data = await res.json();

            if (data.success && data.matches) {
                setMatches(data.matches);
            }
        } catch (error) {
            console.error('Failed to fetch Tennis matches:', error);
        } finally {
            setLoading(false);
        }
    };

    // Separate LIVE, Upcoming, and Finished
    const liveMatches = matches.filter(m => isLiveStatus(m));
    const upcomingMatches = matches.filter(m => isUpcomingStatus(m));
    const finishedMatches = matches.filter(m => isFinishedStatus(m));

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
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <MdSportsTennis className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tennis</h1>
                        <p className="text-gray-400 text-sm">Live streaming ATP, WTA & Grand Slam</p>
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
                                <FaTrophy className="text-yellow-500" />
                                Tennis Stats
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
                                    <span className="text-yellow-500 font-semibold">{upcomingMatches.length}</span>
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
                                <p className="text-gray-400 mt-4">Memuat pertandingan Tennis...</p>
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
                                        border-left: 4px solid #EAB308;
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
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                        </h2>
                                        <div className="space-y-3">
                                            {liveMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={true} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Section */}
                                {upcomingMatches.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <IoCalendar className="text-yellow-500" />
                                            Upcoming
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={false} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Finished Section */}
                                {finishedMatches.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <FaTrophy className="text-gray-500" />
                                            Selesai
                                        </h2>
                                        <div className="space-y-3">
                                            {finishedMatches.map((match) => (
                                                <TennisMatchCard key={match.id} match={match} isLive={false} isFinished={true} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {matches.length === 0 && (
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <p className="text-4xl mb-4">🎾</p>
                                        <p className="text-gray-400">Tidak ada pertandingan Tennis tersedia saat ini</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ========== SEO DESCRIPTION ========== */}
                        <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                            <h2 className="text-xl font-semibold text-white">
                                Nonton Streaming Tennis Gratis di SportMeriah
                            </h2>
                            <p>
                                Nonton streaming Tennis gratis di SportMeriah. Kualitas terbaik, server tercepat, dan update real-time.
                            </p>
                            <p>
                                Tersedia berbagai pertandingan ATP, WTA, dan Grand Slam (Australian Open, French Open, Wimbledon, US Open). Tonton sekarang tanpa ribet!
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
                    <Link href="/tennis" className="flex flex-col items-center px-2 sm:px-4 py-2 text-yellow-400">
                        <MdSportsTennis size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Tennis</span>
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

// ========== TENNIS MATCH CARD COMPONENT ==========
function TennisMatchCard({ match, isLive, isFinished = false }) {
    const { player1, player2, status, scores, stream, date, time, id, tournament, serve } = match;
    const hasStream = !!stream;

    // Link ke player page
    const matchUrl = hasStream
        ? `/tennis/${id}?stream=${stream.streamId}`
        : `/tennis/${id}`;

    // Get set display for live matches
    const getSetDisplay = () => {
        const statusStr = (status?.short || status?.long || '').toUpperCase();
        if (statusStr.includes('SET 1')) return 'Set 1';
        if (statusStr.includes('SET 2')) return 'Set 2';
        if (statusStr.includes('SET 3')) return 'Set 3';
        if (statusStr.includes('SET 4')) return 'Set 4';
        if (statusStr.includes('SET 5')) return 'Set 5';
        return statusStr || 'LIVE';
    };

    // Format score display
    const getScoreDisplay = () => {
        if (!scores || scores.length === 0) return null;
        return scores.map(s => `${s.player1}-${s.player2}`).join(' ');
    };

    return (
        <Link href={matchUrl}>
            <div className={`bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group overflow-hidden relative ${!hasStream && !isFinished ? 'opacity-70' : ''}`}>

                {/* Live Badge - Top Left */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {getSetDisplay()}
                    </div>
                )}

                {/* Header - Status & Tournament */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : isFinished ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isLive ? '🔴 Sedang Tayang' : isFinished ? 'Selesai' : `Upcoming - ${formatKickoffTime(date, time)}`}
                    </span>
                    <span className="text-yellow-400 font-semibold truncate max-w-[150px]">
                        {tournament?.name || 'Tennis'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="flex items-center justify-between px-3 py-2.5 gap-2">

                    {/* Player 1 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <div className="flex items-center gap-1">
                            <span className="text-white text-xs sm:text-sm font-medium truncate text-right">
                                {player1?.name || 'Player 1'}
                            </span>
                            {serve === 'First Player' && isLive && (
                                <span className="text-yellow-400 text-xs">●</span>
                            )}
                        </div>
                        {player1?.logo ? (
                            <img
                                src={player1.logo}
                                alt={player1.name}
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0 rounded-full"
                                onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🎾'}
                            />
                        ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <MdSportsTennis size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Score / VS */}
                    <div className="flex-shrink-0 px-2">
                        {(isLive || isFinished) && scores && scores.length > 0 ? (
                            <span className={`text-sm sm:text-base font-bold ${isFinished ? 'text-gray-400' : 'text-white'}`}>
                                {getScoreDisplay()}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs sm:text-sm font-bold">VS</span>
                        )}
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {player2?.logo ? (
                            <img
                                src={player2.logo}
                                alt={player2.name}
                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0 rounded-full"
                                onError={(e) => e.target.src = 'https://placehold.co/32x32/374151/ffffff?text=🎾'}
                            />
                        ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <MdSportsTennis size={14} className="text-white" />
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {serve === 'Second Player' && isLive && (
                                <span className="text-yellow-400 text-xs">●</span>
                            )}
                            <span className="text-white text-xs sm:text-sm font-medium truncate">
                                {player2?.name || 'Player 2'}
                            </span>
                        </div>
                    </div>

                    {/* Tombol Tonton */}
                    <div className="flex-shrink-0 ml-2">
                        {hasStream ? (
                            <span className={`text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 ${isLive ? 'bg-red-600 group-hover:bg-red-700' : 'bg-yellow-500 group-hover:bg-yellow-600'}`}>
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
