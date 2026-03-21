'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Hls from 'hls.js';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsMotorsports, MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdRefresh, MdShare, MdFullscreen, MdVolumeUp, MdVolumeOff } from 'react-icons/md';
import { GiTennisRacket } from 'react-icons/gi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

const parseChannelName = (name) => {
    if (!name) return { title: 'Tennis Live', league: 'Tennis' };

    let cleanName = name;
    cleanName = cleanName.replace(/^TENNIS\s*\d*\s*:\s*/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');

    let league = 'Tennis';
    const lower = name.toLowerCase();
    if (lower.includes('australian open')) league = 'Australian Open';
    else if (lower.includes('roland garros') || lower.includes('french open')) league = 'Roland Garros';
    else if (lower.includes('wimbledon')) league = 'Wimbledon';
    else if (lower.includes('us open')) league = 'US Open';
    else if (lower.includes('atp')) league = 'ATP';
    else if (lower.includes('wta')) league = 'WTA';

    return { title: cleanName.trim() || 'Tennis Live', league };
};

export default function TennisPlayerClient({ streamId }) {
    const searchParams = useSearchParams();
    const provider = searchParams.get('provider') || 'sphere';

    const [streamInfo, setStreamInfo] = useState(null);
    const [parsedInfo, setParsedInfo] = useState({ title: 'Tennis Live', league: 'Tennis' });
    const [relatedChannels, setRelatedChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const playerContainerRef = useRef(null);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedChannels();
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [streamId, provider]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`${API_URL}/api/tennis/stream/${streamId}`);
            const data = await response.json();

            if (data.success) {
                setStreamInfo(data.stream);
                if (data.stream?.name) {
                    setParsedInfo(parseChannelName(data.stream.name));
                }

                // Start stream via VPS
                setStreamLoading(true);
                const startRes = await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
                const startData = await startRes.json();

                const waitTime = startData.message?.includes('already running') ? 1000 : 8000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setStreamUrl(`https://stream.nobarmeriah.com/hls/sphere_${streamId}.m3u8`);
                setStreamLoading(false);
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

    const fetchRelatedChannels = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tennis`);
            const data = await response.json();
            if (data.success) {
                const channels = [
                    ...(data.channels?.all || []),
                    ...(data.sportsTVChannels || [])
                ].filter(ch => String(ch.id) !== String(streamId)).slice(0, 8);
                setRelatedChannels(channels);
            }
        } catch (err) { }
    };

    const initializePlayer = useCallback((url) => {
        if (!videoRef.current || !url) return;

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
            hls.loadSource(url);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        setTimeout(() => hls.startLoad(), 2000);
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
            hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = url;
            videoRef.current.addEventListener('loadedmetadata', () => {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            });
        }
    }, []);

    useEffect(() => {
        if (streamUrl && videoRef.current) {
            initializePlayer(streamUrl);
        }
    }, [streamUrl, initializePlayer]);

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const toggleFullscreen = () => {
        if (!playerContainerRef.current) return;
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const refreshStream = () => {
        fetchStreamInfo();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayTitle = parsedInfo.title;
    const displayLeague = parsedInfo.league;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `🎾 Nonton ${displayTitle} LIVE di NobarMeriah!`;

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    <p className="text-gray-400 mt-4">Memuat stream...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                        <strong className="font-bold">Error: </strong>
                        <span>{error}</span>
                    </div>
                    <Link href="/tennis" className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                        ← Kembali ke Tennis
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-6xl mx-auto px-4 py-4">

                {/* Player Section */}
                <div ref={playerContainerRef} className="relative mb-4">
                    {streamUrl ? (
                        <div className="bg-black rounded-lg overflow-hidden">
                            {/* Player Header */}
                            <div className="bg-green-700 text-white px-3 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></span>
                                    <span className="font-bold text-sm">LIVE</span>
                                    <span className="text-xs truncate ml-2">{displayTitle}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={toggleMute} className="p-1.5 hover:bg-green-800 rounded transition">
                                        {isMuted ? <MdVolumeOff size={18} /> : <MdVolumeUp size={18} />}
                                    </button>
                                    <button onClick={refreshStream} className="p-1.5 hover:bg-green-800 rounded transition">
                                        <MdRefresh size={18} />
                                    </button>
                                    <button onClick={toggleFullscreen} className="p-1.5 hover:bg-green-800 rounded transition">
                                        <MdFullscreen size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Video */}
                            <video
                                ref={videoRef}
                                className="w-full aspect-video bg-black"
                                playsInline
                                controls
                            />
                        </div>
                    ) : streamLoading ? (
                        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                                <p className="text-white mt-4">Memuat Stream...</p>
                                <p className="text-gray-400 text-sm mt-1">Menghubungkan ke server...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                            <div className="text-center p-4">
                                <GiTennisRacket size={48} className="text-green-500 mx-auto mb-4" />
                                <h2 className="text-white text-xl font-bold mb-2">{displayTitle}</h2>
                                <p className="text-gray-400 text-sm mb-4">{displayLeague}</p>
                                <button
                                    onClick={refreshStream}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    <MdPlayArrow size={24} />
                                    Tonton Sekarang
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

                    {/* Left Column */}
                    <div className="w-full lg:w-3/4 space-y-4">

                        {/* Breadcrumb */}
                        <nav className="text-sm text-gray-400 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-white flex items-center gap-1"><IoHome size={14} /> Home</Link></li>
                                <li>/</li>
                                <li><Link href="/tennis" className="hover:text-white flex items-center gap-1"><GiTennisRacket size={14} /> Tennis</Link></li>
                                <li>/</li>
                                <li className="text-white truncate max-w-[200px]">{displayTitle}</li>
                            </ol>
                        </nav>

                        {/* Info Card */}
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-xl font-bold text-white mb-1">{displayTitle}</h2>
                                    <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                                        <GiTennisRacket className="text-green-500 flex-shrink-0" />
                                        <span className="truncate">{displayLeague}</span>
                                    </p>
                                </div>
                                <span className="bg-green-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded flex items-center gap-1 flex-shrink-0">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    LIVE
                                </span>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <MdShare /> Bagikan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition"><FaWhatsapp /></a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition"><FaTelegram /></a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition"><FaTwitter /></a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition"><FaFacebook /></a>
                                <button onClick={copyLink} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm transition">
                                    {copied ? <FaCheck /> : <FaCopy />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="bg-gray-800 rounded-lg p-4 hidden sm:block">
                            <h2 className="text-lg font-semibold text-white mb-2">Streaming {displayLeague} Gratis</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tonton {displayTitle} secara gratis di NobarMeriah. Live streaming tennis dengan kualitas HD.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 lg:sticky lg:top-32">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Channel Lainnya
                            </h3>

                            {relatedChannels.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedChannels.map((channel, index) => {
                                        const parsed = parseChannelName(channel.name);
                                        return (
                                            <Link
                                                key={channel.id || index}
                                                href={`/tennis/${channel.id}?provider=sphere`}
                                                className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-2.5 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GiTennisRacket size={12} className="text-green-500 flex-shrink-0" />
                                                    <span className="text-white text-xs truncate flex-1">{parsed.title}</span>
                                                </div>
                                                <span className="text-gray-400 text-[10px] mt-1 block">{parsed.league}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-xs">Tidak ada channel lainnya</p>
                            )}

                            <div className="mt-4 pt-3 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-2 text-xs sm:text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/tennis" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm">← Semua Tennis</Link>
                                    <Link href="/football" className="block text-gray-400 hover:text-green-400 text-xs sm:text-sm flex items-center gap-2"><MdSportsSoccer size={14} /> Sepakbola</Link>
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-xs sm:text-sm flex items-center gap-2"><MdSportsBasketball size={14} /> Basketball</Link>
                                    <Link href="/motorsport" className="block text-gray-400 hover:text-red-400 text-xs sm:text-sm flex items-center gap-2"><MdSportsMotorsports size={14} /> Motorsport</Link>
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
                    <Link href="/tennis" className="flex flex-col items-center px-2 py-2 text-green-400">
                        <GiTennisRacket size={20} />
                        <span className="text-[10px] mt-1">Tennis</span>
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
