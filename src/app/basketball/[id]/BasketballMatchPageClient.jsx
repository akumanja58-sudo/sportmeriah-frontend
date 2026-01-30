'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Hls from 'hls.js';

// React Icons
import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdRefresh, MdShare } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

export default function BasketballPlayerClient({ streamId }) {
    const [stream, setStream] = useState(null);
    const [relatedMatches, setRelatedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedMatches();
    }, [streamId]);

    // Cleanup HLS on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, []);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/api/basketball/stream/${streamId}`);
            const data = await response.json();

            if (data.success && data.stream) {
                setStream(data.stream);
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

    const fetchRelatedMatches = async () => {
        try {
            const response = await fetch(`${API_URL}/api/basketball`);
            const data = await response.json();

            if (data.success && data.matches) {
                const allMatches = [
                    ...(data.matches.live || []),
                    ...(data.matches.upcoming || [])
                ].filter(m => m.hasStream && String(m.stream?.id) !== String(streamId))
                    .slice(0, 5);
                setRelatedMatches(allMatches);
            }
        } catch (err) {
            console.error('Error fetching related:', err);
        }
    };

    const startStream = () => {
        if (!streamId) return;

        const streamUrl = `${API_URL}/api/stream/${streamId}.m3u8`;

        if (videoRef.current) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(videoRef.current);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error('Autoplay failed:', err));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                setError('Stream error. Silakan refresh.');
                                break;
                        }
                    }
                });

                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = streamUrl;
                videoRef.current.addEventListener('loadedmetadata', () => {
                    videoRef.current.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error('Autoplay failed:', err));
                });
            }
        }
    };

    const refreshStream = () => {
        setIsPlaying(false);
        setError(null);
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        setTimeout(() => startStream(), 500);
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = stream ? `Nonton ${stream.name} live di SportMeriah!` : 'Live NBA Basketball Streaming';

    // Loading State
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <MdSportsBasketball className="text-6xl text-orange-500 animate-bounce mx-auto mb-4" />
                        <p className="text-xl text-white">Memuat stream...</p>
                    </div>
                </div>
            </main>
        );
    }

    // Error State
    if (error && !stream) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <MdSportsBasketball className="text-6xl text-gray-600 mx-auto mb-4" />
                        <p className="text-xl text-white mb-4">{error}</p>
                        <Link href="/basketball" className="text-orange-500 hover:underline">
                            ← Kembali ke Daftar
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

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            <IoHome size={20} />
                        </Link>
                        <span className="text-gray-600">/</span>
                        <Link href="/basketball" className="text-gray-400 hover:text-white">
                            <MdSportsBasketball size={20} />
                        </Link>
                        <span className="text-gray-600">/</span>
                        <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-[200px] sm:max-w-[400px]">
                            {stream?.name || 'Stream'}
                        </h1>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4 order-2 lg:order-1">
                        <div className="bg-gray-800 rounded-lg p-4 sticky top-32">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <MdSportsBasketball className="text-orange-500" />
                                Pertandingan Lainnya
                            </h3>

                            {relatedMatches.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedMatches.map((match) => (
                                        <Link
                                            key={match.id}
                                            href={`/basketball/${match.stream?.id}`}
                                            className="block bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <img
                                                    src={match.homeTeam?.logo}
                                                    alt=""
                                                    className="w-4 h-4 object-contain"
                                                    onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'}
                                                />
                                                <span className="text-white text-xs truncate flex-1">{match.homeTeam?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={match.awayTeam?.logo}
                                                    alt=""
                                                    className="w-4 h-4 object-contain"
                                                    onError={(e) => e.target.src = 'https://placehold.co/16x16/374151/ffffff?text=🏀'}
                                                />
                                                <span className="text-white text-xs truncate flex-1">{match.awayTeam?.name}</span>
                                            </div>
                                            {match.status === 'LIVE' && (
                                                <span className="text-red-400 text-[10px] mt-1 block">🔴 LIVE</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">Tidak ada pertandingan lain</p>
                            )}

                            {/* Quick Links */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/basketball" className="block text-gray-400 hover:text-orange-400 text-sm">
                                        ← Semua Pertandingan
                                    </Link>
                                    <Link href="/football" className="block text-gray-400 hover:text-green-400 text-sm flex items-center gap-2">
                                        <MdSportsSoccer size={16} />
                                        Lihat Sepakbola
                                    </Link>
                                </div>
                            </div>

                            {/* Share */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                                    <MdShare size={16} />
                                    Bagikan
                                </h4>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                                        target="_blank"
                                        className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition text-white"
                                    >
                                        <FaWhatsapp size={16} />
                                    </a>
                                    <a
                                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                                        target="_blank"
                                        className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition text-white"
                                    >
                                        <FaTelegram size={16} />
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                                        target="_blank"
                                        className="bg-sky-500 hover:bg-sky-600 p-2 rounded-full transition text-white"
                                    >
                                        <FaTwitter size={16} />
                                    </a>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                        target="_blank"
                                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition text-white"
                                    >
                                        <FaFacebook size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4 order-1 lg:order-2 space-y-4">

                        {/* Video Player */}
                        <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                            <video
                                ref={videoRef}
                                className="w-full h-full"
                                controls
                                playsInline
                            />

                            {/* Play Overlay */}
                            {!isPlaying && (
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 cursor-pointer"
                                    onClick={startStream}
                                >
                                    <div className="bg-orange-600 hover:bg-orange-700 rounded-full p-5 mb-4 transition-all hover:scale-110 shadow-lg shadow-orange-500/30">
                                        <MdPlayArrow className="text-5xl text-white" />
                                    </div>
                                    <p className="text-xl font-bold text-white text-center px-4">{stream?.name}</p>
                                    <p className="text-orange-400 mt-2 text-sm">Klik untuk menonton</p>
                                </div>
                            )}

                            {/* Error Overlay */}
                            {error && isPlaying && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                                    <p className="text-red-400 mb-4">{error}</p>
                                    <button
                                        onClick={refreshStream}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <MdRefresh /> Coba Lagi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stream Info */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">{stream?.name}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{stream?.category || 'NBA Basketball'}</p>
                                </div>
                                {isPlaying && (
                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        LIVE
                                    </span>
                                )}
                            </div>

                            {/* Refresh Button */}
                            {isPlaying && (
                                <button
                                    onClick={refreshStream}
                                    className="mt-3 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                                >
                                    <MdRefresh /> Refresh Stream
                                </button>
                            )}
                        </div>

                        {/* SEO Description */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-white mb-2">
                                Streaming NBA Basketball Gratis
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Tonton {stream?.name} secara gratis di SportMeriah. Live streaming NBA Basketball
                                dengan kualitas HD. Los Angeles Lakers, Golden State Warriors, Boston Celtics, dan tim
                                NBA lainnya. Nikmati pertandingan tanpa buffering dengan server yang stabil.
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
                    <Link href="/football" className="flex flex-col items-center px-2 sm:px-4 py-2 text-gray-400 hover:text-green-400 transition-colors">
                        <MdSportsSoccer size={22} />
                        <span className="text-[10px] sm:text-xs mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-2 sm:px-4 py-2 text-orange-400">
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
