'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaPlay } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdLiveTv, MdSportsTennis } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// ========== STATUS HELPERS ==========
function isLiveStatus(match) {
    if (!match) return false;
    if (match.status?.live === true || match.status?.live === '1') return true;
    const status = (match.status?.short || match.status?.long || '').toUpperCase();
    const liveStatuses = ['SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5', 'LIVE', 'IN PROGRESS', 'PLAYING'];
    return liveStatuses.some(s => status.includes(s));
}

function isFinishedStatus(match) {
    if (!match) return false;
    const status = (match.status?.short || match.status?.long || '').toUpperCase();
    const finishedStatuses = ['FINISHED', 'ENDED', 'RETIRED', 'WALKOVER', 'CANCELLED', 'POSTPONED'];
    return finishedStatuses.some(s => status.includes(s));
}

function isUpcomingStatus(match) {
    if (!match) return true;
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

export default function TennisMatchPageClient({ params, searchParams }) {
    // LANGSUNG PAKE params dan searchParams dari props
    const matchId = params?.id;
    const streamIdFromUrl = searchParams?.stream;

    const [match, setMatch] = useState(null);
    const [allMatches, setAllMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        if (matchId) {
            fetchMatch();

            // Refresh setiap 30 detik untuk update skor
            const interval = setInterval(fetchMatch, 30000);
            return () => clearInterval(interval);
        }
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            const res = await fetch(`${API_URL}/api/tennis`);
            const data = await res.json();

            if (data.success && data.matches) {
                // Find current match
                const currentMatch = data.matches.find(m => String(m.id) === String(matchId));
                if (currentMatch) {
                    setMatch(currentMatch);

                    // Auto start stream ONLY if LIVE and has stream
                    const streamId = currentMatch.stream?.streamId || streamIdFromUrl;
                    const isLive = isLiveStatus(currentMatch);
                    if (streamId && isLive && !showPlayer) {
                        startStream(streamId);
                    }
                }
                setAllMatches(data.matches);
            }
        } catch (error) {
            console.error('Failed to fetch Tennis match:', error);
        } finally {
            setLoading(false);
        }
    };

    const startStream = async (streamId) => {
        if (!streamId) return;

        try {
            setStreamLoading(true);

            // Direct IPTV URL
            const directUrl = `${API_URL}/api/stream/${streamId}.m3u8`;

            setStreamUrl(directUrl);
            setShowPlayer(true);
        } catch (error) {
            console.error('Failed to start stream:', error);
        } finally {
            setStreamLoading(false);
        }
    };

    // Share URL - safe access
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = match
        ? encodeURIComponent(`${match.player1?.name || 'Player'} vs ${match.player2?.name || 'Player'} - Tennis`)
        : 'SportMeriah Tennis';

    // Get other matches with streams - FIXED: proper null check
    const otherMatches = allMatches
        .filter(m => String(m.id) !== String(matchId))
        .filter(m => m.hasStream && m.stream?.streamId)
        .slice(0, 5);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
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
            </main>
        );
    }

    if (!match) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <p className="text-4xl mb-4">🎾</p>
                    <p className="text-gray-400 mb-4">Pertandingan tidak ditemukan</p>
                    <Link href="/tennis" className="text-yellow-500 hover:underline">
                        ← Kembali ke Tennis
                    </Link>
                </div>
            </main>
        );
    }

    // Safe destructuring with defaults
    const player1 = match.player1 || { name: 'Player 1', logo: '' };
    const player2 = match.player2 || { name: 'Player 2', logo: '' };
    const status = match.status || { short: '', long: '' };
    const scores = match.scores || [];
    const stream = match.stream;
    const date = match.date;
    const time = match.time;
    const tournament = match.tournament || {};
    const serve = match.serve;
    const gameResult = match.gameResult;

    const isLive = isLiveStatus(match);
    const isFinished = isFinishedStatus(match);
    const isUpcoming = isUpcomingStatus(match);
    const hasStream = !!stream?.streamId || !!streamIdFromUrl;
    const actualStreamId = stream?.streamId || streamIdFromUrl;
    const matchTitle = `${player1.name} vs ${player2.name}`;
    const kickoffDisplay = formatKickoffTime(date, time);

    // Get set display
    const getSetDisplay = () => {
        const statusStr = (status.short || status.long || '').toUpperCase();
        if (statusStr.includes('SET 1')) return 'Set 1';
        if (statusStr.includes('SET 2')) return 'Set 2';
        if (statusStr.includes('SET 3')) return 'Set 3';
        if (statusStr.includes('SET 4')) return 'Set 4';
        if (statusStr.includes('SET 5')) return 'Set 5';
        if (statusStr.includes('FINISHED')) return 'Final';
        return statusStr || '';
    };

    // Format score display
    const getScoreDisplay = () => {
        if (!scores || scores.length === 0) return '-';
        return scores.map(s => `${s.player1}-${s.player2}`).join(' ');
    };

    // ========== FINISHED STATE ==========
    if (isFinished) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-gray-800 rounded-lg p-8 text-center max-w-xl mx-auto">
                        <div className="text-6xl mb-4">🎾</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Pertandingan Sudah Selesai</h1>
                        <p className="text-gray-400 mb-6">
                            Pertandingan Tennis ini sudah berakhir.
                        </p>
                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                {player1.logo ? (
                                    <img
                                        src={player1.logo}
                                        alt={player1.name}
                                        className="w-12 h-12 object-contain rounded-full"
                                        onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                                        <MdSportsTennis size={24} className="text-white" />
                                    </div>
                                )}
                                <span className="text-white text-xl font-bold">
                                    {getScoreDisplay()}
                                </span>
                                {player2.logo ? (
                                    <img
                                        src={player2.logo}
                                        alt={player2.name}
                                        className="w-12 h-12 object-contain rounded-full"
                                        onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                                        <MdSportsTennis size={24} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <p className="text-white font-semibold text-lg">{matchTitle}</p>
                            <p className="text-gray-400 text-sm">{tournament.name || 'Tennis'}</p>
                        </div>
                        <Link
                            href="/tennis"
                            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                        >
                            <MdSportsTennis size={20} />
                            Kembali ke Tennis
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-4 sm:py-6">

                {/* ========== BANNERS ========== */}
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

                {/* ========== PLAYER SECTION ========== */}
                <div className="relative mb-4">
                    {showPlayer && streamUrl ? (
                        /* Video Player - LIVE */
                        <div>
                            {/* Live Badge */}
                            <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="font-bold">LIVE</span>
                                <span className="text-sm">• {getSetDisplay()}</span>
                            </div>
                            {/* Video Player */}
                            <div className="aspect-video bg-black rounded-b-lg overflow-hidden">
                                <VideoPlayer src={streamUrl} />
                            </div>
                        </div>
                    ) : isLive && hasStream ? (
                        /* LIVE - Show Play Button */
                        <div className="bg-black rounded-lg w-full overflow-hidden shadow-2xl relative min-h-[280px] sm:min-h-[350px] md:aspect-video">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-6">

                                {/* Player Names + Match Title */}
                                <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4">
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        {player1.logo ? (
                                            <img
                                                src={player1.logo}
                                                alt={player1.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2 rounded-full"
                                                onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                <MdSportsTennis size={24} className="text-white" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{player1.name}</p>
                                        {serve === 'First Player' && (
                                            <span className="text-yellow-400 text-xs">● Serving</span>
                                        )}
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                                            {getScoreDisplay()}
                                        </div>
                                        {gameResult && gameResult !== '-' && (
                                            <div className="text-yellow-400 text-sm">Game: {gameResult}</div>
                                        )}
                                    </div>
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        {player2.logo ? (
                                            <img
                                                src={player2.logo}
                                                alt={player2.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2 rounded-full"
                                                onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                <MdSportsTennis size={24} className="text-white" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{player2.name}</p>
                                        {serve === 'Second Player' && (
                                            <span className="text-yellow-400 text-xs">● Serving</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-red-500 animate-pulse mb-3 sm:mb-4">
                                    🔴 LIVE - {getSetDisplay()}
                                </div>

                                {/* Play Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startStream(actualStreamId);
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-8 md:py-4 md:px-10 rounded-full text-sm sm:text-lg md:text-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <FaPlay />
                                    <span>Tonton Sekarang</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* UPCOMING - Show Info Only */
                        <div className="bg-black rounded-lg w-full overflow-hidden shadow-2xl relative min-h-[280px] sm:min-h-[350px] md:aspect-video">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-6">

                                {/* Player Names + Match Title */}
                                <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4">
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        {player1.logo ? (
                                            <img
                                                src={player1.logo}
                                                alt={player1.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2 rounded-full"
                                                onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                <MdSportsTennis size={24} className="text-white" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{player1.name}</p>
                                    </div>
                                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-400 px-1">VS</div>
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        {player2.logo ? (
                                            <img
                                                src={player2.logo}
                                                alt={player2.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2 rounded-full"
                                                onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🎾'}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                <MdSportsTennis size={24} className="text-white" />
                                            </div>
                                        )}
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{player2.name}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-[11px] sm:text-sm mb-2 sm:mb-3">{tournament.name || 'Tennis'}</p>

                                {/* Upcoming Status */}
                                <div className="mb-3 sm:mb-4">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-1">
                                        🎾 Upcoming
                                    </div>
                                    <p className="text-sm sm:text-base md:text-lg text-gray-300">Kickoff: {kickoffDisplay}</p>
                                </div>

                                {/* Info Message */}
                                <div className="text-center">
                                    <p className="text-gray-400 text-[11px] sm:text-sm px-2 mb-3">
                                        {hasStream
                                            ? 'Stream akan tersedia saat match dimulai.'
                                            : 'Stream belum tersedia untuk pertandingan ini.'}
                                    </p>
                                    <Link
                                        href="/tennis"
                                        className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-full text-xs sm:text-sm transition-colors"
                                    >
                                        ← Kembali ke Tennis
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========== MATCH DETAILS ========== */}
                <div className="flex flex-col">

                    {/* Title */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 order-1">
                        <div className="flex-grow min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                                {matchTitle}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <span className="text-yellow-400 font-semibold flex items-center gap-1">
                                    <MdSportsTennis /> {tournament.name || 'Tennis'}
                                </span>
                                <span>•</span>
                                <span>{isLive ? `🔴 ${getSetDisplay()}` : isFinished ? 'Final' : `Upcoming - ${kickoffDisplay}`}</span>
                                {tournament.round && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="hidden sm:inline">{tournament.round}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Set Scores */}
                    {(isLive || isFinished) && scores && scores.length > 0 && (
                        <div className="mb-4 bg-gray-800 rounded-lg p-3 order-2">
                            <table className="w-full text-xs sm:text-sm">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="text-left py-1">Player</th>
                                        {scores.map((_, idx) => (
                                            <th key={idx} className="text-center py-1 w-10">Set {idx + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    <tr>
                                        <td className="py-1 truncate max-w-[100px]">
                                            {player1.name}
                                            {serve === 'First Player' && isLive && <span className="text-yellow-400 ml-1">●</span>}
                                        </td>
                                        {scores.map((s, idx) => (
                                            <td key={idx} className={`text-center py-1 font-bold ${parseInt(s.player1) > parseInt(s.player2) ? 'text-green-400' : ''}`}>
                                                {s.player1}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="py-1 truncate max-w-[100px]">
                                            {player2.name}
                                            {serve === 'Second Player' && isLive && <span className="text-yellow-400 ml-1">●</span>}
                                        </td>
                                        {scores.map((s, idx) => (
                                            <td key={idx} className={`text-center py-1 font-bold ${parseInt(s.player2) > parseInt(s.player1) ? 'text-green-400' : ''}`}>
                                                {s.player2}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                            {isLive && gameResult && gameResult !== '-' && (
                                <div className="mt-2 pt-2 border-t border-gray-700 text-center">
                                    <span className="text-yellow-400 font-bold">Game: {gameResult}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3 order-3">
                        <span className="text-xs sm:text-sm font-semibold text-gray-400">Share:</span>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                <FaFacebook size={16} />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-500 hover:text-white transition-colors"
                            >
                                <FaTwitter size={16} />
                            </a>
                            <a
                                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white transition-colors"
                            >
                                <FaWhatsapp size={16} />
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-600 hover:text-white transition-colors"
                            >
                                <FaTelegram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="mb-2 text-xs sm:text-sm text-gray-400 order-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="hover:text-white">Home</Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <Link href="/tennis" className="hover:text-white">Tennis</Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <span className="text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">{matchTitle}</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* ========== SEO DESCRIPTION ========== */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-700 rounded-lg text-gray-300 text-xs sm:text-sm space-y-2">
                    <p>
                        Watch the <strong>{matchTitle}</strong> Tennis match live and for free on SportMeriah.
                        {!isFinished && <> This Tennis match starts at <strong>{kickoffDisplay}</strong>.</>}
                    </p>
                    <p>
                        Get the best quality stream and real-time score updates right here. Don&apos;t miss any of the action!
                    </p>
                </div>

                {/* ========== OTHER TENNIS MATCHES ========== */}
                {otherMatches.length > 0 && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <MdSportsTennis className="text-yellow-500" />
                            Other Tennis Matches
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {otherMatches.map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/tennis/${m.id}?stream=${m.stream?.streamId || ''}`}
                                    className="block bg-gray-700 p-3 sm:p-4 rounded-lg shadow-md transition-all hover:bg-gray-600 flex justify-between items-center"
                                >
                                    <span className="text-sm sm:text-base font-medium text-white truncate pr-4">
                                        {m.player1?.name || 'Player'} vs {m.player2?.name || 'Player'}
                                    </span>
                                    <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${isLiveStatus(m) ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                                        {isLiveStatus(m) ? 'LIVE' : formatKickoffTime(m.date, m.time)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ========== BOTTOM NAV MOBILE ========== */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden safe-area-bottom">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoHome size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Beranda</span>
                    </Link>
                    <Link href="/tennis" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-yellow-400 transition-colors">
                        <MdSportsTennis size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Tennis</span>
                    </Link>
                    <button className="flex flex-col items-center px-2 sm:px-4 py-2 text-yellow-400">
                        <FaPlay size={18} />
                        <span className="text-[10px] sm:text-xs mt-1">Nonton</span>
                    </button>
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
