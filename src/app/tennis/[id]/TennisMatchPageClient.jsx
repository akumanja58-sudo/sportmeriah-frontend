'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdSportsTennis, MdHome, MdRefresh, MdShare, MdPlayArrow, MdTv } from 'react-icons/md';
import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import Hls from 'hls.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

export default function TennisMatchPageClient({ matchId }) {
    const [match, setMatch] = useState(null);
    const [allMatches, setAllMatches] = useState([]);
    const [availableChannels, setAvailableChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showChannelSelector, setShowChannelSelector] = useState(false);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        fetchMatch();
        const interval = setInterval(fetchMatch, 30000);
        return () => clearInterval(interval);
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tennis`);
            const data = await response.json();

            if (data.success && data.matches) {
                setAllMatches(data.matches);
                setAvailableChannels(data.availableChannels || []);

                const foundMatch = data.matches.find(m => String(m.id) === String(matchId));
                if (foundMatch) {
                    setMatch(foundMatch);

                    // Set default channel from match stream or first available
                    if (foundMatch.stream && !selectedChannel) {
                        setSelectedChannel({
                            stream_id: foundMatch.stream.id,
                            name: foundMatch.stream.name,
                            quality: foundMatch.stream.quality
                        });
                    } else if (data.availableChannels?.length > 0 && !selectedChannel) {
                        setSelectedChannel(data.availableChannels[0]);
                    }

                    // Check if finished - redirect to listing
                    if (isFinishedStatus(foundMatch)) {
                        router.push('/tennis');
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching match:', error);
        } finally {
            setLoading(false);
        }
    };

    const isLiveStatus = (match) => {
        if (!match?.status) return false;
        if (match.status.live === true || match.status.live === '1') return true;
        const statusText = (match.status.short || '').toUpperCase();
        return ['SET 1', 'SET 2', 'SET 3', 'SET 4', 'SET 5', 'LIVE', 'IN PROGRESS', 'PLAYING'].some(k => statusText.includes(k));
    };

    const isFinishedStatus = (match) => {
        if (!match?.status) return false;
        const statusText = (match.status.short || '').toUpperCase();
        return ['FINISHED', 'ENDED', 'RETIRED', 'WALKOVER', 'CANCELLED', 'POSTPONED'].some(k => statusText.includes(k));
    };

    const startStream = () => {
        if (!selectedChannel) return;

        const streamUrl = `${API_URL}/api/stream/${selectedChannel.stream_id}.m3u8`;

        if (videoRef.current) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play();
                    setIsPlaying(true);
                });
                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = streamUrl;
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const switchChannel = (channel) => {
        setSelectedChannel(channel);
        setShowChannelSelector(false);

        // If already playing, restart with new channel
        if (isPlaying && hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
            setIsPlaying(false);

            // Small delay then start new stream
            setTimeout(() => {
                const streamUrl = `${API_URL}/api/stream/${channel.stream_id}.m3u8`;
                if (videoRef.current && Hls.isSupported()) {
                    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(videoRef.current);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        videoRef.current.play();
                        setIsPlaying(true);
                    });
                    hlsRef.current = hls;
                }
            }, 100);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = match ? `Nonton ${match.player1?.name} vs ${match.player2?.name} - ${match.tournament?.name}` : '';

    const formatScores = (scores) => {
        if (!scores || scores.length === 0) return null;
        return scores;
    };

    // Get other live matches with streams
    const otherMatches = allMatches
        .filter(m => String(m.id) !== String(matchId) && (m.hasStream || isLiveStatus(m)))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <MdSportsTennis className="text-6xl text-yellow-500 animate-bounce mx-auto mb-4" />
                    <p className="text-xl">Memuat pertandingan Tennis...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <MdSportsTennis className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-xl mb-4">Pertandingan tidak ditemukan</p>
                    <Link href="/tennis" className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg">
                        Kembali ke Daftar
                    </Link>
                </div>
            </div>
        );
    }

    const isLive = isLiveStatus(match);
    const hasStream = match.hasStream || (selectedChannel && isLive);

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-yellow-100 mb-3">
                        <Link href="/" className="hover:text-white flex items-center gap-1">
                            <MdHome /> Home
                        </Link>
                        <span>/</span>
                        <Link href="/tennis" className="hover:text-white">Tennis</Link>
                        <span>/</span>
                        <span className="text-white">Live Match</span>
                    </div>

                    {/* Match Info */}
                    <div className="text-center">
                        <div className="text-sm text-yellow-200 mb-1">{match.tournament?.name}</div>
                        <div className="text-xs text-yellow-300">{match.tournament?.round}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-4">
                {/* Video Player */}
                <div className="bg-black rounded-lg overflow-hidden mb-4 relative aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        playsInline
                        poster="/tennis-poster.jpg"
                    />

                    {/* Play Overlay */}
                    {!isPlaying && hasStream && isLive && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 cursor-pointer"
                            onClick={startStream}
                        >
                            <div className="bg-yellow-600 hover:bg-yellow-700 rounded-full p-6 mb-4 transition-transform hover:scale-110">
                                <MdPlayArrow className="text-5xl" />
                            </div>
                            <p className="text-xl font-bold">{match.player1?.name} vs {match.player2?.name}</p>
                            <p className="text-yellow-400 mt-2">Klik untuk menonton</p>
                            {selectedChannel && (
                                <p className="text-sm text-gray-400 mt-1">Channel: {selectedChannel.name}</p>
                            )}
                        </div>
                    )}

                    {/* Upcoming Match Overlay */}
                    {!isLive && !isFinishedStatus(match) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                            <MdSportsTennis className="text-6xl text-yellow-500 mb-4" />
                            <p className="text-xl font-bold">{match.player1?.name} vs {match.player2?.name}</p>
                            <p className="text-gray-400 mt-2">Pertandingan belum dimulai</p>
                            <p className="text-yellow-400 mt-1">{match.date} - {match.time} WIB</p>
                        </div>
                    )}
                </div>

                {/* Channel Selector */}
                {isLive && availableChannels.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MdTv className="text-yellow-500" />
                                <span className="font-semibold">Channel:</span>
                                <span className="text-yellow-400">{selectedChannel?.name || 'Pilih Channel'}</span>
                                {selectedChannel?.quality && (
                                    <span className="bg-yellow-600 text-xs px-2 py-0.5 rounded">{selectedChannel.quality}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowChannelSelector(!showChannelSelector)}
                                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm"
                            >
                                Ganti Channel
                            </button>
                        </div>

                        {showChannelSelector && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700">
                                {availableChannels.map((channel) => (
                                    <button
                                        key={channel.stream_id}
                                        onClick={() => switchChannel(channel)}
                                        className={`p-3 rounded text-left transition ${selectedChannel?.stream_id === channel.stream_id
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">{channel.name}</div>
                                        <div className="text-xs text-gray-300">{channel.quality}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Score Display */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                        {/* Player 1 */}
                        <div className="flex-1 text-center">
                            <div className="text-lg font-bold flex items-center justify-center gap-2">
                                {match.serve === 'First Player' && <span className="text-yellow-400">●</span>}
                                {match.player1?.name}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="px-4">
                            {isLive ? (
                                <span className="bg-red-600 px-3 py-1 rounded text-sm font-bold animate-pulse">
                                    {match.status?.short || 'LIVE'}
                                </span>
                            ) : (
                                <span className="bg-gray-600 px-3 py-1 rounded text-sm">
                                    {match.status?.short || 'NS'}
                                </span>
                            )}
                        </div>

                        {/* Player 2 */}
                        <div className="flex-1 text-center">
                            <div className="text-lg font-bold flex items-center justify-center gap-2">
                                {match.player2?.name}
                                {match.serve === 'Second Player' && <span className="text-yellow-400">●</span>}
                            </div>
                        </div>
                    </div>

                    {/* Set Scores Table */}
                    {match.scores && match.scores.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="text-gray-400 text-sm">
                                        <th className="py-2">Pemain</th>
                                        {match.scores.map((s, i) => (
                                            <th key={i} className="py-2">Set {s.set}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 font-medium">{match.player1?.name?.split(' ').pop()}</td>
                                        {match.scores.map((s, i) => (
                                            <td key={i} className={`py-2 text-lg font-bold ${parseInt(s.player1) > parseInt(s.player2) ? 'text-green-400' : ''
                                                }`}>
                                                {s.player1}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">{match.player2?.name?.split(' ').pop()}</td>
                                        {match.scores.map((s, i) => (
                                            <td key={i} className={`py-2 text-lg font-bold ${parseInt(s.player2) > parseInt(s.player1) ? 'text-green-400' : ''
                                                }`}>
                                                {s.player2}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Game Score */}
                    {match.gameResult && match.gameResult !== '-' && isLive && (
                        <div className="text-center mt-3 pt-3 border-t border-gray-700">
                            <span className="text-gray-400">Game: </span>
                            <span className="text-yellow-400 font-bold">{match.gameResult}</span>
                        </div>
                    )}
                </div>

                {/* Share Buttons */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MdShare /> Bagikan
                    </h3>
                    <div className="flex gap-3">
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full"
                        >
                            <FaFacebook />
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-500 hover:bg-sky-600 p-3 rounded-full"
                        >
                            <FaTwitter />
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 p-3 rounded-full"
                        >
                            <FaWhatsapp />
                        </a>
                        <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full"
                        >
                            <FaTelegram />
                        </a>
                    </div>
                </div>

                {/* Other Matches */}
                {otherMatches.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold mb-3">Pertandingan Tennis Lainnya</h3>
                        <div className="space-y-2">
                            {otherMatches.map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/tennis/${m.id}${m.stream ? `?stream=${m.stream.id}` : ''}`}
                                    className="block bg-gray-700 hover:bg-gray-600 rounded p-3 transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-sm">
                                                {m.player1?.name} vs {m.player2?.name}
                                            </div>
                                            <div className="text-xs text-gray-400">{m.tournament?.name}</div>
                                        </div>
                                        <div className="text-right">
                                            {isLiveStatus(m) ? (
                                                <span className="bg-red-600 px-2 py-0.5 rounded text-xs">LIVE</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">{m.time}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO Content */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h2 className="font-semibold mb-2">Streaming Tennis Gratis</h2>
                    <p className="text-sm text-gray-400">
                        Tonton pertandingan {match.player1?.name} vs {match.player2?.name} di {match.tournament?.name} secara gratis
                        di SportMeriah. Live streaming tennis dengan kualitas HD dari berbagai turnamen ATP, WTA, dan Grand Slam.
                    </p>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
                <div className="flex justify-around py-3">
                    <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
                        <MdHome className="text-2xl" />
                        <span className="text-xs">Home</span>
                    </Link>
                    <Link href="/tennis" className="flex flex-col items-center text-yellow-500">
                        <MdSportsTennis className="text-2xl" />
                        <span className="text-xs">Tennis</span>
                    </Link>
                    <button onClick={fetchMatch} className="flex flex-col items-center text-gray-400 hover:text-white">
                        <MdRefresh className="text-2xl" />
                        <span className="text-xs">Refresh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
