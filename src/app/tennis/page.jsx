'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { MdSportsTennis } from 'react-icons/md';
import { IoArrowBack } from 'react-icons/io5';
import { FaTelegram } from 'react-icons/fa';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
];

// ========== STATUS HELPERS ==========
function isLiveStatus(match) {
    if (match.status?.live === true || match.status?.live === '1') return true;
    const status = (match.status?.short || match.status?.long || '').toUpperCase();
    const liveStatuses = ['SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5', 'LIVE', 'IN PROGRESS', 'PLAYING'];
    return liveStatuses.some(s => status.includes(s));
}

function isFinishedStatus(match) {
    const status = (match.status?.short || match.status?.long || '').toUpperCase();
    const finishedStatuses = ['FINISHED', 'ENDED', 'RETIRED', 'WALKOVER', 'CANCELLED', 'POSTPONED'];
    return finishedStatuses.some(s => status.includes(s));
}

function isUpcomingStatus(match) {
    if (isLiveStatus(match) || isFinishedStatus(match)) return false;
    return true;
}

// ========== FORMAT TIME ==========
function formatMatchTime(date, time) {
    if (time) return `${time} WIB`;
    if (date) {
        const d = new Date(date);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes} WIB`;
    }
    return '-';
}

export default function TennisPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, live, upcoming, finished

    useEffect(() => {
        fetchMatches();
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
            console.error('Failed to fetch tennis matches:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter matches
    const filteredMatches = matches.filter(match => {
        if (filter === 'all') return true;
        if (filter === 'live') return isLiveStatus(match);
        if (filter === 'upcoming') return isUpcomingStatus(match);
        if (filter === 'finished') return isFinishedStatus(match);
        return true;
    });

    // Counts
    const liveCount = matches.filter(m => isLiveStatus(m)).length;
    const upcomingCount = matches.filter(m => isUpcomingStatus(m)).length;
    const finishedCount = matches.filter(m => isFinishedStatus(m)).length;
    const withStreamCount = matches.filter(m => m.hasStream).length;

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-4xl mx-auto px-4 py-6">

                {/* Banner */}
                <div className="mb-4 space-y-2">
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

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        <IoArrowBack size={24} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <MdSportsTennis className="text-yellow-500" size={28} />
                        <h1 className="text-2xl font-bold text-white">Tennis</h1>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-red-500">{liveCount}</p>
                        <p className="text-xs text-gray-400">Live</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-orange-500">{upcomingCount}</p>
                        <p className="text-xs text-gray-400">Upcoming</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-gray-500">{finishedCount}</p>
                        <p className="text-xs text-gray-400">Finished</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xl font-bold text-green-500">{withStreamCount}</p>
                        <p className="text-xs text-gray-400">Streams</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'Semua', count: matches.length },
                        { key: 'live', label: '🔴 Live', count: liveCount },
                        { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
                        { key: 'finished', label: 'Selesai', count: finishedCount },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === tab.key
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Match List */}
                {loading ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400">Memuat jadwal tennis...</p>
                    </div>
                ) : filteredMatches.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-4xl mb-4">🎾</p>
                        <p className="text-gray-400">Tidak ada pertandingan {filter !== 'all' ? `(${filter})` : ''}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMatches.map(match => (
                            <TennisMatchCard key={match.id} match={match} />
                        ))}
                    </div>
                )}

                {/* Telegram CTA */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-center">
                    <p className="text-white mb-2">Join Telegram untuk update jadwal terbaru!</p>
                    <a
                        href="https://t.me/sportmeriah"
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                        <FaTelegram size={20} />
                        Join Channel
                    </a>
                </div>

                {/* SEO Content */}
                <div className="mt-8 pt-6 border-t border-gray-700 text-gray-400 text-sm space-y-3">
                    <h2 className="text-lg font-semibold text-white">
                        Nonton Live Streaming Tennis Gratis
                    </h2>
                    <p>
                        Streaming tennis gratis di SportMeriah. Tonton ATP, WTA, Grand Slam (Australian Open, French Open, Wimbledon, US Open), dan turnamen tennis lainnya dengan kualitas HD.
                    </p>
                </div>
            </div>

            {/* Padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}

// ========== TENNIS MATCH CARD ==========
function TennisMatchCard({ match }) {
    const { player1, player2, status, scores, stream, date, time, id, tournament, result, gameResult, serve } = match;
    const hasStream = !!stream?.streamId;
    const isLive = isLiveStatus(match);
    const isFinished = isFinishedStatus(match);

    const matchUrl = hasStream
        ? `/tennis/${id}?stream=${stream.streamId}`
        : `/tennis/${id}`;

    // Format tennis score
    const formatScore = () => {
        if (!scores || scores.length === 0) return null;
        return scores.map(s => `${s.player1}-${s.player2}`).join(' ');
    };

    const tennisScore = formatScore();

    return (
        <Link href={matchUrl}>
            <div className={`bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group overflow-hidden relative ${!hasStream ? 'opacity-70' : ''}`}>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold flex items-center gap-1 z-10">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        {status?.short || 'LIVE'}
                    </div>
                )}

                {/* Finished Badge */}
                {isFinished && (
                    <div className="absolute top-0 left-0 bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-br font-bold z-10">
                        Selesai
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-900 text-[10px] sm:text-xs">
                    <span className={`font-medium ${isLive ? 'text-red-400' : isFinished ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isLive ? `🔴 ${status?.short || 'Live'}` : isFinished ? 'Selesai' : formatMatchTime(date, time)}
                    </span>
                    <span className="text-yellow-400 truncate max-w-[180px] sm:max-w-[250px] flex items-center gap-1">
                        <MdSportsTennis size={12} />
                        {tournament?.name || 'Tennis'}
                    </span>
                </div>

                {/* Match Content */}
                <div className="p-3">
                    {/* Player 1 */}
                    <div className={`flex items-center justify-between mb-2 ${match.winner === 'First Player' ? 'text-green-400' : 'text-white'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {player1?.logo ? (
                                <img
                                    src={player1.logo}
                                    alt={player1.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => e.target.src = 'https://placehold.co/24x24/374151/ffffff?text=🎾'}
                                />
                            ) : (
                                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MdSportsTennis size={14} className="text-white" />
                                </div>
                            )}
                            <span className="text-sm font-medium truncate">
                                {player1?.name || 'Player 1'}
                            </span>
                            {serve === 'First Player' && isLive && (
                                <span className="text-yellow-400 text-xs">●</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {scores?.map((s, idx) => (
                                <span key={idx} className={`w-6 text-center text-sm font-bold ${
                                    parseInt(s.player1) > parseInt(s.player2) ? 'text-green-400' : ''
                                }`}>
                                    {s.player1}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className={`flex items-center justify-between ${match.winner === 'Second Player' ? 'text-green-400' : 'text-white'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {player2?.logo ? (
                                <img
                                    src={player2.logo}
                                    alt={player2.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => e.target.src = 'https://placehold.co/24x24/374151/ffffff?text=🎾'}
                                />
                            ) : (
                                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MdSportsTennis size={14} className="text-white" />
                                </div>
                            )}
                            <span className="text-sm font-medium truncate">
                                {player2?.name || 'Player 2'}
                            </span>
                            {serve === 'Second Player' && isLive && (
                                <span className="text-yellow-400 text-xs">●</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {scores?.map((s, idx) => (
                                <span key={idx} className={`w-6 text-center text-sm font-bold ${
                                    parseInt(s.player2) > parseInt(s.player1) ? 'text-green-400' : ''
                                }`}>
                                    {s.player2}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Game Score (if live) */}
                    {isLive && gameResult && gameResult !== '-' && (
                        <div className="mt-2 pt-2 border-t border-gray-700 text-center">
                            <span className="text-yellow-400 text-sm font-bold">Game: {gameResult}</span>
                        </div>
                    )}
                </div>

                {/* Footer - Watch Button */}
                <div className="px-3 pb-3">
                    {hasStream ? (
                        <div className={`w-full text-center text-white text-sm font-bold py-2 rounded transition-colors ${
                            isLive ? 'bg-red-600 group-hover:bg-red-700' : 'bg-yellow-600 group-hover:bg-yellow-700'
                        }`}>
                            {isLive ? '▶ Tonton Sekarang' : '▶ Tonton'}
                        </div>
                    ) : (
                        <div className="w-full text-center text-gray-400 text-sm font-medium py-2 rounded bg-gray-700">
                            Stream Tidak Tersedia
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
