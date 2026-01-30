'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import Link from 'next/link';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaPlay } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdLiveTv } from 'react-icons/md';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

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
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
}

export default function MatchPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const fixtureId = params.id;
    const streamIdFromUrl = searchParams.get('stream');

    const [fixture, setFixture] = useState(null);
    const [allFixtures, setAllFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchFixture();

        // Refresh setiap 30 detik untuk update skor
        const interval = setInterval(fetchFixture, 30000);
        return () => clearInterval(interval);
    }, [fixtureId]);

    const fetchFixture = async () => {
        try {
            const [fixtureRes, allRes] = await Promise.all([
                fetch(`${API_URL}/api/fixtures/${fixtureId}`),
                fetch(`${API_URL}/api/fixtures/today`)
            ]);

            const fixtureData = await fixtureRes.json();
            const allData = await allRes.json();

            if (fixtureData.success && fixtureData.fixture) {
                setFixture(fixtureData.fixture);

                // Auto start stream if LIVE and has stream
                const hasStream = fixtureData.fixture.stream || streamIdFromUrl;
                if (isLiveStatus(fixtureData.fixture.status.short) && hasStream && !showPlayer) {
                    const sid = fixtureData.fixture.stream?.stream_id || streamIdFromUrl;
                    startStream(sid);
                }
            }

            if (allData.success && allData.fixtures) {
                setAllFixtures(allData.fixtures);
            }
        } catch (error) {
            console.error('Failed to fetch fixture:', error);
        } finally {
            setLoading(false);
        }
    };

    const startStream = async (streamId) => {
        if (!streamId) return;

        try {
            setStreamLoading(true);

            // Direct IPTV HTTPS URL - no VPS needed!
            const directUrl = `${API_URL}/api/stream/${streamId}.m3u8`;

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
    const shareTitle = fixture ? encodeURIComponent(`${fixture.teams.home.name} vs ${fixture.teams.away.name}`) : 'SportMeriah';

    // Get other live matches
    const otherLiveMatches = allFixtures
        .filter(f => f.id !== parseInt(fixtureId))
        .filter(f => isLiveStatus(f.status.short) && f.stream)
        .slice(0, 5);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <span className="loader"></span>
                    <p className="text-gray-400 mt-4">Memuat pertandingan...</p>
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
            </main>
        );
    }

    if (!fixture) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                        <strong className="font-bold">Oops! An Error Occurred:</strong>
                        <span className="block sm:inline ml-1">
                            This content is currently unavailable.
                        </span>
                    </div>
                    <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    const { teams, league, status, goals, stream, date } = fixture;
    const isLive = isLiveStatus(status.short);
    const isFinished = isFinishedStatus(status.short);
    const hasStream = !!stream || !!streamIdFromUrl;
    const actualStreamId = stream?.stream_id || streamIdFromUrl;
    const matchTitle = `${teams.home.name} vs ${teams.away.name}`;
    const kickoffDisplay = formatKickoffTime(date);

    // Match finished
    if (isFinished) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-gray-800 rounded-lg p-8 text-center max-w-xl mx-auto">
                        <div className="text-6xl mb-4">⏰</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Pertandingan Sudah Selesai</h1>
                        <p className="text-gray-400 mb-6">
                            Pertandingan ini sudah berakhir.
                        </p>
                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <img src={teams.home.logo} alt={teams.home.name} className="w-12 h-12 object-contain" />
                                <span className="text-white text-2xl font-bold">{goals.home ?? 0} - {goals.away ?? 0}</span>
                                <img src={teams.away.logo} alt={teams.away.name} className="w-12 h-12 object-contain" />
                            </div>
                            <p className="text-white font-semibold text-lg">{matchTitle}</p>
                            <p className="text-gray-400 text-sm">{league.name}</p>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                        >
                            <IoHome size={20} />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-6">

                {/* ========== BANNER SECTION ========== */}
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

                {/* ========== PLAYER SECTION ========== */}
                <div className="relative mb-4">
                    {showPlayer && streamUrl ? (
                        /* Video Player - LIVE */
                        <div>
                            {/* Live Badge */}
                            <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="font-bold">{isLive ? (status.elapsed ? `${status.elapsed}'` : 'LIVE') : 'Playing'}</span>
                                {isLive && <span className="font-bold ml-2">{goals.home ?? 0} - {goals.away ?? 0}</span>}
                                <span className="ml-2 text-sm truncate">{matchTitle}</span>
                            </div>
                            <VideoPlayer streamUrl={streamUrl} />
                        </div>
                    ) : streamLoading ? (
                        /* Loading Stream */
                        <div className="bg-black rounded-lg aspect-video w-full overflow-hidden shadow-2xl relative flex items-center justify-center">
                            <div className="text-center">
                                <span className="loader"></span>
                                <p className="text-white mt-4">Memuat Stream...</p>
                            </div>
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
                    ) : isLive && hasStream ? (
                        /* LIVE but not started yet - show play button */
                        <div
                            className="bg-black rounded-lg w-full overflow-hidden shadow-2xl relative cursor-pointer min-h-[280px] sm:min-h-[350px] md:aspect-video"
                            onClick={() => startStream(actualStreamId)}
                        >
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-90"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-6">

                                {/* Team Logos + Match Title */}
                                <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4">
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        <img
                                            src={teams.home.logo}
                                            alt={teams.home.name}
                                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                        />
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{teams.home.name}</p>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                                            {goals.home ?? 0} - {goals.away ?? 0}
                                        </div>
                                    </div>
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        <img
                                            src={teams.away.logo}
                                            alt={teams.away.name}
                                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                        />
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{teams.away.name}</p>
                                    </div>
                                </div>

                                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-red-500 animate-pulse mb-3 sm:mb-4">
                                    🔴 LIVE NOW
                                </div>

                                {/* Play Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startStream(actualStreamId);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-8 md:py-4 md:px-10 rounded-full text-sm sm:text-lg md:text-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
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

                                {/* Team Logos + Match Title */}
                                <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4">
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        <img
                                            src={teams.home.logo}
                                            alt={teams.home.name}
                                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                        />
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{teams.home.name}</p>
                                    </div>
                                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-400 px-1">VS</div>
                                    <div className="text-center flex-1 max-w-[100px] sm:max-w-[120px]">
                                        <img
                                            src={teams.away.logo}
                                            alt={teams.away.name}
                                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mx-auto mb-1 sm:mb-2"
                                        />
                                        <p className="text-white font-semibold text-[11px] sm:text-sm md:text-base truncate">{teams.away.name}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-[11px] sm:text-sm mb-2 sm:mb-3">{league.name}</p>

                                {/* Upcoming Status */}
                                <div className="mb-3 sm:mb-4">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400 mb-1">
                                        ⏰ Upcoming
                                    </div>
                                    <p className="text-sm sm:text-base md:text-lg text-gray-300">Kickoff: {kickoffDisplay}</p>
                                </div>

                                {/* Info Message */}
                                <div className="text-center">
                                    <p className="text-gray-400 text-[11px] sm:text-sm px-2 mb-3">
                                        {hasStream
                                            ? 'Stream akan tersedia saat match dimulai.'
                                            : 'Silakan kembali saat match sudah LIVE.'}
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-full text-xs sm:text-sm transition-colors"
                                    >
                                        ← Kembali ke Beranda
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========== MATCH DETAILS ========== */}
                <div className="flex flex-col">

                    {/* Title - Show first on mobile */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 order-1">
                        <div className="flex-grow min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 leading-tight">
                                {matchTitle}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <span>{isLive ? '🔴 LIVE' : `Upcoming - ${kickoffDisplay}`}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{league.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3 order-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-400">Share this match:</span>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                                title="Share on Facebook"
                            >
                                <FaFacebook size={16} />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-500 hover:text-white transition-colors"
                                title="Share on Twitter"
                            >
                                <FaTwitter size={16} />
                            </a>
                            <a
                                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-green-500 hover:text-white transition-colors"
                                title="Share on WhatsApp"
                            >
                                <FaWhatsapp size={16} />
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-sky-600 hover:text-white transition-colors"
                                title="Share on Telegram"
                            >
                                <FaTelegram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Breadcrumb - Show last on mobile */}
                    <div className="mb-2 text-xs sm:text-sm text-gray-400 order-3">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1">
                                <li className="inline-flex items-center">
                                    <Link href="/" className="hover:text-white">Home</Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <span className="capitalize hover:text-white">{league.name}</span>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
                                        <span className="mx-1">/</span>
                                        <span className="text-gray-500 capitalize truncate max-w-[120px] sm:max-w-[200px]">{matchTitle}</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* ========== SEO DESCRIPTION ========== */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-700 rounded-lg text-gray-300 text-xs sm:text-sm space-y-2">
                    <p>
                        Watch the <strong>{matchTitle}</strong> stream live and for free on SportMeriah.
                        This football match kickoff at <strong>{kickoffDisplay}</strong>.
                    </p>
                    <p>
                        Get the best quality stream and real-time updates right here. Don't miss any of the action!
                    </p>
                </div>

                {/* ========== OTHER LIVE MATCHES ========== */}
                {otherLiveMatches.length > 0 && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <MdLiveTv className="text-red-500" />
                            Other Live Matches
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                            {otherLiveMatches.map((f) => (
                                <Link
                                    key={f.id}
                                    href={`/match/${f.id}?stream=${f.stream.stream_id}`}
                                    className="block bg-gray-700 p-3 sm:p-4 rounded-lg shadow-md transition-all hover:bg-gray-600 flex justify-between items-center"
                                >
                                    <span className="text-sm sm:text-base font-medium text-white truncate pr-4">
                                        {f.teams.home.name} vs {f.teams.away.name}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-red-500 animate-pulse flex-shrink-0">
                                        LIVE
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
                    <button className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
                        <FaPlay size={18} />
                        <span className="text-[10px] sm:text-xs mt-1">Nonton</span>
                    </button>
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

            {/* Bottom padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}
