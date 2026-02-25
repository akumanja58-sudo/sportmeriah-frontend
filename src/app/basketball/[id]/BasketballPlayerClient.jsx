'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Hls from 'hls.js';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdRefresh, MdShare, MdFullscreen, MdVolumeUp, MdVolumeOff } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

// VPS proxy through backend to avoid mixed content
const getProxyStreamUrl = (provider, streamId) => {
    if (provider === 'pearl') {
        // Use backend proxy endpoint for Pearl streams
        return `${API_URL}/api/proxy/pearl/${streamId}.m3u8`;
    }
    return null;
};

const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
    { id: 2, src: 'https://inigambarku.site/images/2026/02/01/promo-penaslot.gif', link: '#' },
    { id: 3, src: 'https://inigambarku.site/images/2026/01/20/promo-pesiarbet.gif', link: '#' },
    { id: 4, src: 'https://inigambarku.site/images/2026/01/20/promo-girang4d.gif', link: '#' },
];

// Parse channel name to get clean match title
const parseChannelName = (name) => {
    if (!name) return { title: 'Live Stream', homeTeam: null, awayTeam: null, league: 'NBA' };

    let cleanName = name;

    // Remove prefix like "USA Real NBA 01: " or "NBA 01: " or "NBA 01 :"
    cleanName = cleanName.replace(/^USA\s*(Real\s*)?(NBA|Soccer)\s*\d*:\s*/i, '');
    cleanName = cleanName.replace(/^NBA\s*\d*\s*:\s*/i, '');

    // Remove time suffix like "@ 8:30 PM" or "( ABC Feed ) @ 8:30 PM" or "// UK Sat..."
    cleanName = cleanName.replace(/\s*\([^)]*\)\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');
    cleanName = cleanName.replace(/\s*@\s*Feb.*$/i, '');
    cleanName = cleanName.replace(/\s*\/\/.*$/i, '');
    cleanName = cleanName.replace(/\s*:NBA\s*\d*$/i, '');

    // Try to extract teams from "Team A VS Team B" or "Team A vs Team B" or "Team A @ Team B"
    const vsMatch = cleanName.match(/(.+?)\s+(?:VS|vs|v|@)\s+(.+)/i);
    if (vsMatch) {
        return {
            title: `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}`,
            homeTeam: vsMatch[1].trim(),
            awayTeam: vsMatch[2].trim(),
            league: 'NBA'
        };
    }

    return { title: cleanName.trim() || 'Live Stream', homeTeam: null, awayTeam: null, league: 'NBA' };
};

export default function BasketballPlayerClient({ streamId }) {
    const searchParams = useSearchParams();
    const provider = searchParams.get('provider') || 'sphere';

    const [matchData, setMatchData] = useState(null);
    const [streamInfo, setStreamInfo] = useState(null);
    const [parsedInfo, setParsedInfo] = useState({ title: 'Live Stream', homeTeam: null, awayTeam: null, league: 'NBA' });
    const [relatedMatches, setRelatedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [matchStatus, setMatchStatus] = useState('live'); // Default to live for channels
    const [streamUrl, setStreamUrl] = useState(null);

    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const countdownRef = useRef(null);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedMatches();
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [streamId, provider]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);

            // Fetch stream info with provider parameter
            const response = await fetch(`${API_URL}/api/basketball/stream/${streamId}?provider=${provider}`);
            const data = await response.json();

            if (data.success) {
                setStreamInfo(data.stream);

                // Parse channel name for clean display
                if (data.stream?.name) {
                    setParsedInfo(parseChannelName(data.stream.name));
                }

                if (data.match) {
                    setMatchData(data.match);
                    initializeMatchStatus(data.match);
                } else {
                    // No match data - treat as live channel
                    setMatchStatus('live');
                }

                // For Pearl provider, start the VPS proxy stream
                if (data.stream?.provider === 'pearl') {
                    await startPearlStream(streamId);
                } else {
                    // For Sphere, use direct stream URL
                    setStreamUrl(data.stream?.url);
                }
            } else {
                setError('Stream tidak ditemukan');
            }
        } catch (err) {
            console.error('Error fetching stream:', err);
            setError('Gagal memuat stream');
        } finally {
            setLoading(false);
        }
    };

    // Start Pearl stream via VPS FFmpeg restream
    const startPearlStream = async (id) => {
        try {
            setError(null);

            console.log('Starting Pearl stream via VPS...');
            const response = await fetch(`${API_URL}/api/streams/pearl/start/${id}`);
            const data = await response.json();
            console.log('VPS response:', data);

            if (data.success) {
                // Poll until m3u8 is ready (max 15 detik)
                const hlsUrl = `https://stream.sportmeriah.com/hls/pearl_${id}.m3u8`;
                let ready = false;
                for (let i = 0; i < 15; i++) {
                    try {
                        const check = await fetch(hlsUrl, { method: 'HEAD' });
                        if (check.ok) { ready = true; break; }
                    } catch (e) { }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (ready) {
                    setStreamUrl(hlsUrl);
                } else {
                    // Fallback: set anyway after 15s
                    setStreamUrl(hlsUrl);
                }
            } else {
                setError('Gagal memulai stream');
            }
        } catch (err) {
            console.error('Error starting Pearl stream:', err);
            setError('Gagal memulai stream');
        }
    };

    const fetchRelatedMatches = async () => {
        try {
            const response = await fetch(`${API_URL}/api/basketball`);
            const data = await response.json();
            if (data.success && data.matches) {
                const liveMatches = (data.matches.live || [])
                    .filter(m => m.hasStream && String(m.stream?.id) !== String(streamId))
                    .slice(0, 5);
                setRelatedMatches(liveMatches);
            }
        } catch (err) { }
    };

    const initializeMatchStatus = (match) => {
        if (!match?.date) { setMatchStatus('live'); return; }
        const matchTime = new Date(match.date).getTime();
        const now = Date.now();
        const liveWindow = 3 * 60 * 60 * 1000;
        if (matchTime > now) {
            setMatchStatus('scheduled');
            startCountdown(matchTime);
        } else if (now - matchTime < liveWindow) {
            setMatchStatus('live');
        } else {
            setMatchStatus('finished');
        }
    };

    const startCountdown = (matchTime) => {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = matchTime - now;
            if (diff <= 0) {
                clearInterval(countdownRef.current);
                setMatchStatus('live');
                return;
            }
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };
        updateCountdown();
        countdownRef.current = setInterval(updateCountdown, 1000);
    };

    const startStream = useCallback(() => {
        if (!streamUrl || !videoRef.current) return;

        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 1.0,
                liveSyncDurationCount: 4,
                liveMaxLatencyDurationCount: 8,
                liveDurationInfinity: true,
                manifestLoadingMaxRetry: 10,
                manifestLoadingRetryDelay: 1000,
                levelLoadingMaxRetry: 10,
                levelLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 10,
                fragLoadingRetryDelay: 1000,
                startPosition: -1,
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        console.log('Network error, retrying...');
                        setTimeout(() => hls.startLoad(), 2000);
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setError('Stream error. Silakan refresh.');
                    }
                }
            });
            hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = streamUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            });
        }
    }, [streamUrl]);

    const refreshStream = () => {
        setIsPlaying(false);
        setError(null);
        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

        // Re-fetch stream for Pearl provider
        if (provider === 'pearl') {
            startPearlStream(streamId).then(() => {
                setTimeout(() => startStream(), 1000);
            });
        } else {
            setTimeout(() => startStream(), 500);
        }
    };

    const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(!isMuted); } };
    const toggleFullscreen = () => { if (videoRef.current) { document.fullscreenElement ? document.exitFullscreen() : videoRef.current.requestFullscreen(); } };
    const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const formatMatchDate = (dateStr) => {
        if (!dateStr) return 'Live Channel 24/7';
        return new Date(dateStr).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    // Get display title - prefer matchData, fallback to parsed channel name
    const displayTitle = matchData
        ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}`
        : parsedInfo.title;

    const displayLeague = matchData?.league?.name || parsedInfo.league || 'NBA';

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Nonton ${displayTitle} live di SportMeriah!`;

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <span className="loader-basketball"></span>
                        <p className="text-xl text-white mt-4">Memuat stream...</p>
                        <style jsx>{`
                            .loader-basketball {
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
                            .loader-basketball::after {
                                content: '';
                                box-sizing: border-box;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 48px;
                                height: 48px;
                                border-radius: 50%;
                                border-left: 4px solid #f97316;
                                border-bottom: 4px solid transparent;
                                animation: rotation 0.5s linear infinite reverse;
                            }
                            @keyframes rotation {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !streamInfo) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-md mx-4">
                        <MdSportsBasketball className="text-6xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
                        <p className="text-red-200 mb-4">{error}</p>
                        <Link href="/basketball" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition">← Kembali</Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

                <div className="mb-4 space-y-2">
                    {BANNERS.map((banner) => (
                        <div key={banner.id} className="banner-slot">
                            <a href={banner.link} target="_blank" rel="noopener">
                                <img src={banner.src} alt={`Banner ${banner.id}`} className="w-full rounded-lg hover:opacity-90 transition-opacity" onError={(e) => e.target.parentElement.parentElement.style.display = 'none'} />
                            </a>
                        </div>
                    ))}
                </div>

                {/* ===== VIDEO PLAYER SECTION - ALWAYS FIRST ON MOBILE ===== */}
                <div className="relative mb-4">
                    <div className="bg-black rounded-lg aspect-video w-full overflow-hidden shadow-2xl relative">
                        <video ref={videoRef} className="w-full h-full" controls={isPlaying} playsInline />

                        {/* Pre-game Overlay */}
                        {!isPlaying && (
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 to-gray-800/95 flex flex-col justify-center items-center text-center p-4 cursor-pointer" onClick={() => matchStatus !== 'finished' && startStream()}>

                                {/* Match Title - CLEAN */}
                                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 px-2">
                                    {displayTitle}
                                </h1>

                                {/* League */}
                                <p className="text-orange-400 text-sm sm:text-base mb-4 flex items-center gap-2">
                                    <MdSportsBasketball /> {displayLeague}
                                </p>

                                {/* Provider Badge */}
                                {streamInfo?.provider && (
                                    <p className="text-xs text-gray-500 mb-2">
                                        Provider: {streamInfo.provider.toUpperCase()}
                                    </p>
                                )}

                                {/* Status */}
                                <div className="mb-4">
                                    {matchStatus === 'scheduled' && (
                                        <>
                                            <p className="text-gray-400 text-xs sm:text-sm mb-2">{formatMatchDate(matchData?.date)}</p>
                                            <div className="text-2xl sm:text-4xl font-bold text-white font-mono">
                                                {countdown.days > 0 && `${countdown.days}d `}
                                                {String(countdown.hours).padStart(2, '0')}:
                                                {String(countdown.minutes).padStart(2, '0')}:
                                                {String(countdown.seconds).padStart(2, '0')}
                                            </div>
                                        </>
                                    )}
                                    {matchStatus === 'live' && (
                                        <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold text-red-500">
                                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                        </div>
                                    )}
                                    {matchStatus === 'finished' && (
                                        <div className="text-xl font-bold text-gray-400">Pertandingan Selesai</div>
                                    )}
                                </div>

                                {/* Play Button */}
                                {matchStatus !== 'finished' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (streamUrl) {
                                                startStream();
                                            }
                                            // else: still loading, do nothing (button disabled)
                                        }}
                                        disabled={!streamUrl}
                                        className={`font-bold py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg shadow-lg transition-all transform flex items-center gap-2 ${streamUrl
                                                ? 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 active:scale-95'
                                                : 'bg-gray-700 text-gray-400 cursor-wait'
                                            }`}>
                                        <MdPlayArrow className="text-xl sm:text-2xl" />
                                        {streamUrl ? 'Mulai Nonton' : 'Mempersiapkan...'}
                                    </button>
                                )}
                                {matchStatus === 'finished' && (
                                    <Link href="/basketball" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all">
                                        Lihat Pertandingan Lain
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Error overlay */}
                        {error && isPlaying && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button onClick={refreshStream} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                    <MdRefresh /> Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Player Controls */}
                    {isPlaying && (
                        <div className="flex items-center justify-between mt-2 bg-gray-800 rounded-lg px-3 sm:px-4 py-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="flex items-center gap-1 text-red-500 text-xs sm:text-sm font-medium flex-shrink-0">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    LIVE
                                </span>
                                <span className="text-gray-400 text-xs sm:text-sm truncate">
                                    {displayTitle}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <button onClick={toggleMute} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition text-gray-300">
                                    {isMuted ? <MdVolumeOff size={18} /> : <MdVolumeUp size={18} />}
                                </button>
                                <button onClick={refreshStream} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition text-gray-300">
                                    <MdRefresh size={18} />
                                </button>
                                <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition text-gray-300">
                                    <MdFullscreen size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

                    {/* Left Column - Match Info */}
                    <div className="w-full lg:w-3/4 space-y-4">

                        {/* Breadcrumb - Hidden on mobile */}
                        <nav className="text-sm text-gray-400 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-white flex items-center gap-1"><IoHome size={14} /> Home</Link></li>
                                <li>/</li>
                                <li><Link href="/basketball" className="hover:text-white flex items-center gap-1"><MdSportsBasketball size={14} /> Basketball</Link></li>
                                <li>/</li>
                                <li className="text-white truncate max-w-[200px]">{displayTitle}</li>
                            </ol>
                        </nav>

                        {/* Match Info Card */}
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-xl font-bold text-white mb-1">
                                        {displayTitle}
                                    </h2>
                                    <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                                        <MdSportsBasketball className="text-orange-500 flex-shrink-0" />
                                        <span className="truncate">{displayLeague}</span>
                                    </p>
                                </div>
                                {matchStatus === 'live' && (
                                    <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded flex items-center gap-1 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Share Buttons - Compact on mobile */}
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <MdShare /> Bagikan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    <FaWhatsapp />
                                </a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    <FaTelegram />
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    <FaTwitter />
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    <FaFacebook />
                                </a>
                                <button onClick={copyLink} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    {copied ? <FaCheck /> : <FaCopy />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* SEO Content - Hidden on mobile */}
                        <div className="bg-gray-800 rounded-lg p-4 hidden sm:block">
                            <h2 className="text-lg font-semibold text-white mb-2">Streaming NBA Basketball Gratis</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tonton {displayTitle} secara gratis di SportMeriah. Live streaming NBA Basketball dengan kualitas HD. Nikmati pertandingan tanpa buffering.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 lg:sticky lg:top-32">
                            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Sedang Live
                            </h3>

                            {relatedMatches.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedMatches.map((match, index) => (
                                        <Link key={match.id || index} href={`/basketball/${match.stream?.id}?provider=${match.stream?.provider || 'sphere'}`} className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-2.5 sm:p-3 transition">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'} />
                                                <span className="text-white text-xs truncate flex-1">{match.homeTeam?.name}</span>
                                                {match.score && <span className="text-white text-xs font-bold">{match.score.home}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'} />
                                                <span className="text-white text-xs truncate flex-1">{match.awayTeam?.name}</span>
                                                {match.score && <span className="text-white text-xs font-bold">{match.score.away}</span>}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-400 text-[10px]">{match.league?.name}</span>
                                                <span className="text-red-400 text-[10px] flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                                                    LIVE
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-xs sm:text-sm">Tidak ada pertandingan live lainnya</p>
                            )}

                            {/* Quick Links */}
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-xs sm:text-sm">← Semua Pertandingan</Link>
                                    <Link href="/football" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm flex items-center gap-2">
                                        <MdSportsSoccer size={14} />Lihat Sepakbola
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
                <div className="flex justify-around items-center py-2 px-1">
                    <Link href="/" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-white transition-colors">
                        <IoHome size={20} />
                        <span className="text-[10px] mt-1">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-green-400 transition-colors">
                        <MdSportsSoccer size={20} />
                        <span className="text-[10px] mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-2 py-2 text-orange-400">
                        <MdSportsBasketball size={20} />
                        <span className="text-[10px] mt-1">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-2 py-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTelegram size={20} />
                        <span className="text-[10px] mt-1">Telegram</span>
                    </a>
                </div>
            </nav>

            <div className="h-16 md:hidden"></div>
        </main>
    );
}
