'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaPlay } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdLiveTv, MdSportsBasketball } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// IPTV Config - NigmaTV
const IPTV_SERVER = 'http://cf.business-cdn-8k.ru';
const IPTV_USER = 'd6bc5a36b788';
const IPTV_PASS = '884f0649bc';

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

// ========== FORMAT TIME ==========
function formatKickoffTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function NbaMatchPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const matchId = params.id;
    const streamIdFromUrl = searchParams.get('stream');

    const [match, setMatch] = useState(null);
    const [allMatches, setAllMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchMatch();

        // Refresh setiap 30 detik untuk update skor
        const interval = setInterval(fetchMatch, 30000);
        return () => clearInterval(interval);
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            const res = await fetch(`${API_URL}/api/basketball`);
            const data = await res.json();

            if (data.success && data.matches) {
                // Find current match
                const currentMatch = data.matches.find(m => m.id === parseInt(matchId));
                if (currentMatch) {
                    setMatch(currentMatch);

                    // Auto start stream if has stream
                    const hasStream = currentMatch.stream || streamIdFromUrl;
                    if (hasStream && !showPlayer) {
                        const sid = currentMatch.stream?.streamId || streamIdFromUrl;
                        startStream(sid);
                    }
                }
                setAllMatches(data.matches);
            }
        } catch (error) {
            console.error('Failed to fetch NBA match:', error);
        } finally {
            setLoading(false);
        }
    };

    const startStream = async (streamId) => {
        if (!streamId) return;

        try {
            setStreamLoading(true);

            // Direct IPTV URL
            const directUrl = `${IPTV_SERVER}/live/${IPTV_USER}/${IPTV_PASS}/${streamId}.m3u8`;

            setStreamUrl(directUrl);
            setShowPlayer(true);
        } catch (error) {
            console.error('Failed to start stream:', error);
        } finally {
            setStreamLoading(false);
        }
    };

    // Share URL
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = match ? encodeURIComponent(`${match.homeTeam.name} vs ${match.awayTeam.name} - NBA`) : 'SportMeriah NBA';

    // Get other matches with streams
    const otherMatches = allMatches
        .filter(m => m.id !== parseInt(matchId))
        .filter(m => m.hasStream)
        .slice(0, 5);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
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
            </main>
        );
    }

    if (!match) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <p className="text-4xl mb-4">🏀</p>
                    <p className="text-gray-400 mb-4">Pertandingan tidak ditemukan</p>
                    <Link href="/basketball" className="text-orange-500 hover:underline">
                        ← Kembali ke NBA
                    </Link>
                </div>
            </main>
        );
    }

    const { homeTeam, awayTeam, status, scores, stream, date, venue } = match;
    const isLive = isLiveStatus(status.short);
    const isFinished = isFinishedStatus(status.short);
    const hasStream = !!stream || !!streamIdFromUrl;
    const matchTitle = `${homeTeam.name} vs ${awayTeam.name}`;
    const kickoffDisplay = formatKickoffTime(date);

    // Get quarter display
    const getQuarterDisplay = () => {
        if (status.short === 'Q1') return '1st Quarter';
        if (status.short === 'Q2') return '2nd Quarter';
        if (status.short === 'Q3') return '3rd Quarter';
        if (status.short === 'Q4') return '4th Quarter';
        if (status.short === 'OT') return 'Overtime';
        if (status.short === 'HT') return 'Halftime';
        if (status.short === 'BT') return 'Break';
        if (status.short === 'FT') return 'Final';
        return '';
    };

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-4 sm:py-6">

                {/* ========== VIDEO PLAYER ========== */}
                {showPlayer && streamUrl ? (
                    <div className="mb-4 sm:mb-6">
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <VideoPlayer
                                src={streamUrl}
                                autoPlay={true}
                                title={matchTitle}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 sm:mb-6">
                        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center">
                            {/* Team Logos */}
                            <div className="flex items-center gap-4 sm:gap-8 mb-4">
                                <div className="flex flex-col items-center">
                                    <img
                                        src={homeTeam.logo}
                                        alt={homeTeam.name}
                                        className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                                        onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🏀'}
                                    />
                                    <span className="text-white text-xs sm:text-sm mt-2 text-center max-w-[80px] sm:max-w-[120px] truncate">
                                        {homeTeam.name}
                                    </span>
                                </div>

                                <div className="text-center">
                                    {(isLive || isFinished) && scores?.home?.total !== null ? (
                                        <div className="text-2xl sm:text-4xl font-bold text-white">
                                            {scores.home.total} - {scores.away.total}
                                        </div>
                                    ) : (
                                        <div className="text-xl sm:text-2xl font-bold text-gray-400">VS</div>
                                    )}
                                    <div className={`text-xs sm:text-sm mt-1 ${isLive ? 'text-red-500' : 'text-gray-400'}`}>
                                        {isLive ? `🔴 ${getQuarterDisplay()}` : isFinished ? 'Final' : kickoffDisplay}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <img
                                        src={awayTeam.logo}
                                        alt={awayTeam.name}
                                        className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                                        onError={(e) => e.target.src = 'https://placehold.co/96x96/374151/ffffff?text=🏀'}
                                    />
                                    <span className="text-white text-xs sm:text-sm mt-2 text-center max-w-[80px] sm:max-w-[120px] truncate">
                                        {awayTeam.name}
                                    </span>
                                </div>
                            </div>

                            {/* Play Button or Message */}
                            {hasStream ? (
                                <button
                                    onClick={() => startStream(stream?.streamId || streamIdFromUrl)}
                                    disabled={streamLoading}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {streamLoading ? (
                                        <>Loading...</>
                                    ) : (
                                        <>
                                            <FaPlay /> Tonton Sekarang
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-400 mb-4">
                                        {isFinished ? 'Pertandingan telah selesai' : 'Stream belum tersedia'}
                                    </p>
                                    <Link
                                        href="/basketball"
                                        className="text-orange-500 hover:text-orange-400 text-sm"
                                    >
                                        ← Kembali ke NBA
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== BANNERS ========== */}
                <div className="mb-4 space-y-2">
                    {BANNERS.slice(0, 2).map((banner) => (
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

                {/* ========== MATCH DETAILS ========== */}
                <div className="flex flex-col">

                    {/* Title */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 order-1">
                        <div className="flex-grow min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                                {matchTitle}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <span className="text-orange-400 font-semibold flex items-center gap-1">
                                    <MdSportsBasketball /> NBA
                                </span>
                                <span>•</span>
                                <span>{isLive ? `🔴 ${getQuarterDisplay()}` : isFinished ? 'Final' : `Upcoming - ${kickoffDisplay}`}</span>
                                {venue && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="hidden sm:inline">{venue}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quarter Scores */}
                    {(isLive || isFinished) && scores?.home?.quarter_1 !== null && (
                        <div className="mb-4 bg-gray-800 rounded-lg p-3 order-2">
                            <table className="w-full text-xs sm:text-sm">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="text-left py-1">Team</th>
                                        <th className="text-center py-1 w-10">Q1</th>
                                        <th className="text-center py-1 w-10">Q2</th>
                                        <th className="text-center py-1 w-10">Q3</th>
                                        <th className="text-center py-1 w-10">Q4</th>
                                        {scores.home.over_time && <th className="text-center py-1 w-10">OT</th>}
                                        <th className="text-center py-1 w-12 font-bold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    <tr>
                                        <td className="py-1 truncate max-w-[100px]">{homeTeam.name}</td>
                                        <td className="text-center py-1">{scores.home.quarter_1 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.home.quarter_2 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.home.quarter_3 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.home.quarter_4 ?? '-'}</td>
                                        {scores.home.over_time && <td className="text-center py-1">{scores.home.over_time}</td>}
                                        <td className="text-center py-1 font-bold text-orange-400">{scores.home.total}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 truncate max-w-[100px]">{awayTeam.name}</td>
                                        <td className="text-center py-1">{scores.away.quarter_1 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.away.quarter_2 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.away.quarter_3 ?? '-'}</td>
                                        <td className="text-center py-1">{scores.away.quarter_4 ?? '-'}</td>
                                        {scores.away.over_time && <td className="text-center py-1">{scores.away.over_time}</td>}
                                        <td className="text-center py-1 font-bold text-orange-400">{scores.away.total}</td>
                                    </tr>
                                </tbody>
                            </table>
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
                                        <Link href="/basketball" className="hover:text-white">NBA</Link>
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
                        Watch the <strong>{matchTitle}</strong> NBA game live and for free on SportMeriah.
                        {!isFinished && <> This basketball game tips off at <strong>{kickoffDisplay}</strong>.</>}
                    </p>
                    <p>
                        Get the best quality stream and real-time score updates right here. Don't miss any of the action!
                    </p>
                </div>

                {/* ========== OTHER NBA MATCHES ========== */}
                {otherMatches.length > 0 && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <MdSportsBasketball className="text-orange-500" />
                            Other NBA Games
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {otherMatches.map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/basketball/${m.id}?stream=${m.stream.streamId}`}
                                    className="block bg-gray-700 p-3 sm:p-4 rounded-lg shadow-md transition-all hover:bg-gray-600 flex justify-between items-center"
                                >
                                    <span className="text-sm sm:text-base font-medium text-white truncate pr-4">
                                        {m.homeTeam.name} vs {m.awayTeam.name}
                                    </span>
                                    <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${isLiveStatus(m.status.short) ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                                        {isLiveStatus(m.status.short) ? 'LIVE' : formatKickoffTime(m.date)}
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
                    <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-orange-400 transition-colors">
                        <MdSportsBasketball size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">NBA</span>
                    </Link>
                    <button className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
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
