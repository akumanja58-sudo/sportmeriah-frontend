'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';
import { MdSportsTennis } from 'react-icons/md';
import { IoArrowBack } from 'react-icons/io5';
import { FaTelegram, FaWhatsapp, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';

// Banner images
const BANNERS = [
    { id: 1, src: 'https://inigambarku.site/images/2026/01/20/GIFMERIAH4D965a1f7cfb6a4aac.gif', link: '#' },
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

export default function TennisPlayerPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const matchId = params.id;
    const streamId = searchParams.get('stream');

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (matchId) {
            fetchMatchDetails();
            // Refresh setiap 30 detik untuk update skor
            const interval = setInterval(fetchMatchDetails, 30000);
            return () => clearInterval(interval);
        }
    }, [matchId]);

    const fetchMatchDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/api/tennis`);
            const data = await res.json();

            if (data.success && data.matches) {
                const foundMatch = data.matches.find(m => String(m.id) === String(matchId));
                if (foundMatch) {
                    setMatch(foundMatch);
                } else {
                    setError('Match tidak ditemukan');
                }
            }
        } catch (err) {
            console.error('Failed to fetch match:', err);
            setError('Gagal memuat data pertandingan');
        } finally {
            setLoading(false);
        }
    };

    // Build stream URL
    const getStreamUrl = () => {
        if (match?.stream?.streamUrl) {
            return match.stream.streamUrl;
        }
        if (streamId) {
            // Fallback: construct URL if we have streamId
            return `${process.env.NEXT_PUBLIC_IPTV_SERVER || 'http://cf.business-cdn-8k.ru'}/live/${process.env.NEXT_PUBLIC_IPTV_USER || 'd6bc5a36b788'}/${process.env.NEXT_PUBLIC_IPTV_PASS || '884f0649bc'}/${streamId}.m3u8`;
        }
        return null;
    };

    const streamUrl = getStreamUrl();
    const isLive = match ? isLiveStatus(match) : false;
    const isFinished = match ? isFinishedStatus(match) : false;
    const hasStream = !!streamUrl;

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400">Memuat pertandingan...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !match) {
        return (
            <main className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-4xl mb-4">😕</p>
                        <p className="text-gray-400 mb-4">{error || 'Match tidak ditemukan'}</p>
                        <Link href="/tennis" className="text-yellow-500 hover:underline">
                            ← Kembali ke Tennis
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="container max-w-4xl mx-auto px-4 py-4">

                {/* Banner - Di atas player */}
                <div className="mb-4">
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

                {/* Back Button & Title */}
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/tennis" className="text-gray-400 hover:text-white transition-colors">
                        <IoArrowBack size={24} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <MdSportsTennis className="text-yellow-500" size={24} />
                        <span className="text-white font-medium truncate">
                            {match.tournament?.name || 'Tennis'}
                        </span>
                    </div>
                    {isLive && (
                        <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    )}
                </div>

                {/* Video Player */}
                <div className="mb-4">
                    {hasStream ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <VideoPlayer src={streamUrl} />
                        </div>
                    ) : (
                        <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                            <FaExclamationTriangle className="text-yellow-500 text-4xl mb-3" />
                            <p className="text-gray-400 text-center px-4">
                                {isFinished 
                                    ? 'Pertandingan sudah selesai' 
                                    : 'Stream akan tersedia saat pertandingan dimulai'}
                            </p>
                            {!isLive && !isFinished && (
                                <p className="text-gray-500 text-sm mt-2">
                                    Jadwal: {match.date} {match.time}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Match Info Card */}
                <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
                    {/* Status Bar */}
                    <div className={`px-4 py-2 text-center text-sm font-medium ${
                        isLive ? 'bg-red-600 text-white' : isFinished ? 'bg-gray-700 text-gray-300' : 'bg-yellow-600 text-white'
                    }`}>
                        {isLive ? `🔴 LIVE - ${match.status?.short || 'In Progress'}` : 
                         isFinished ? '✓ Pertandingan Selesai' : 
                         `⏰ ${match.date} - ${match.time} WIB`}
                    </div>

                    {/* Players & Score */}
                    <div className="p-4">
                        {/* Player 1 */}
                        <div className={`flex items-center justify-between mb-4 ${match.winner === 'First Player' ? 'text-green-400' : 'text-white'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {match.player1?.logo ? (
                                    <img
                                        src={match.player1.logo}
                                        alt={match.player1.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => e.target.src = 'https://placehold.co/40x40/374151/ffffff?text=🎾'}
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MdSportsTennis size={20} className="text-white" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{match.player1?.name || 'Player 1'}</p>
                                    {match.serve === 'First Player' && isLive && (
                                        <span className="text-yellow-400 text-xs">● Serving</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {match.scores?.map((s, idx) => (
                                    <span key={idx} className={`w-8 h-8 flex items-center justify-center rounded text-lg font-bold ${
                                        parseInt(s.player1) > parseInt(s.player2) ? 'bg-green-600 text-white' : 'bg-gray-700'
                                    }`}>
                                        {s.player1}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center gap-2 my-2">
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <span className="text-gray-500 text-xs">VS</span>
                            <div className="flex-1 h-px bg-gray-700"></div>
                        </div>

                        {/* Player 2 */}
                        <div className={`flex items-center justify-between mt-4 ${match.winner === 'Second Player' ? 'text-green-400' : 'text-white'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {match.player2?.logo ? (
                                    <img
                                        src={match.player2.logo}
                                        alt={match.player2.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => e.target.src = 'https://placehold.co/40x40/374151/ffffff?text=🎾'}
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MdSportsTennis size={20} className="text-white" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{match.player2?.name || 'Player 2'}</p>
                                    {match.serve === 'Second Player' && isLive && (
                                        <span className="text-yellow-400 text-xs">● Serving</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {match.scores?.map((s, idx) => (
                                    <span key={idx} className={`w-8 h-8 flex items-center justify-center rounded text-lg font-bold ${
                                        parseInt(s.player2) > parseInt(s.player1) ? 'bg-green-600 text-white' : 'bg-gray-700'
                                    }`}>
                                        {s.player2}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Game Score (if live) */}
                        {isLive && match.gameResult && match.gameResult !== '-' && (
                            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                                <span className="text-gray-400 text-sm">Game Score</span>
                                <p className="text-yellow-400 text-2xl font-bold">{match.gameResult}</p>
                            </div>
                        )}
                    </div>

                    {/* Tournament Info */}
                    <div className="px-4 py-3 bg-gray-900 text-sm text-gray-400">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <span className="text-gray-500">Tournament:</span>{' '}
                                <span className="text-white">{match.tournament?.name || '-'}</span>
                            </div>
                            {match.tournament?.round && (
                                <div>
                                    <span className="text-gray-500">Round:</span>{' '}
                                    <span className="text-white">{match.tournament.round}</span>
                                </div>
                            )}
                            {match.tournament?.type && (
                                <div>
                                    <span className="text-gray-500">Category:</span>{' '}
                                    <span className="text-white">{match.tournament.type}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Social Share */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-sm mb-3">Share pertandingan ini:</p>
                    <div className="flex gap-3">
                        <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`🎾 ${match.player1?.name} vs ${match.player2?.name} - Nonton LIVE di SportMeriah!`)}`}
                            target="_blank"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <FaTelegram size={18} />
                            Telegram
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`🎾 ${match.player1?.name} vs ${match.player2?.name} - Nonton LIVE di SportMeriah! ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                            target="_blank"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <FaWhatsapp size={18} />
                            WhatsApp
                        </a>
                    </div>
                </div>

                {/* Other Matches */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Pertandingan Tennis Lainnya</h3>
                    <Link
                        href="/tennis"
                        className="block text-center text-yellow-500 hover:text-yellow-400 text-sm py-2"
                    >
                        Lihat Semua Pertandingan →
                    </Link>
                </div>
            </div>

            {/* Padding for mobile nav */}
            <div className="h-20 md:hidden"></div>
        </main>
    );
}
