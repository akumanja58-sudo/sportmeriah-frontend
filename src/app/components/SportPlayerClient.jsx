'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';

import { IoHome } from 'react-icons/io5';
import { MdLiveTv, MdPlayArrow, MdArrowBack, MdSportsSoccer, MdSportsBasketball } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa';
import { SPORT_CONFIGS } from './SportPageClient';

const API_URL = 'https://sportmeriah-backend-production.up.railway.app';
const VPS_STREAM_BASE = 'https://stream.nobarmeriah.com';

export default function SportPlayerClient({ sport, streamId }) {
    const config = SPORT_CONFIGS[sport];
    const SportIcon = config?.icon || MdLiveTv;

    const [streamInfo, setStreamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchStreamInfo();
    }, [streamId]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);
            const res = await fetch(`${API_URL}/api/sports/${sport}/stream/${streamId}`);
            const data = await res.json();
            if (data.success) {
                setStreamInfo(data.stream);

                setStreamLoading(true);
                const startRes = await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
                const startData = await startRes.json();
                const waitTime = startData.message?.includes('already running') ? 1000 : 8000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setStreamUrl(`${VPS_STREAM_BASE}/hls/sphere_${streamId}.m3u8`);
                setStreamLoading(false);
            } else {
                setError('Stream tidak ditemukan');
            }
        } catch (err) {
            console.error('Failed to fetch stream:', err);
            setError('Gagal memuat stream');
        } finally {
            setLoading(false);
        }
    };

    const refreshStream = () => { setIsPlaying(false); setStreamUrl(null); fetchStreamInfo(); };

    const displayTitle = streamInfo?.name || `${config?.name || 'Sports'} Stream`;
    const displayLeague = streamInfo?.league || config?.name || 'Sports';
    const accentHex = config?.accentHex || '#fb923c';

    // LOADING
    if (loading) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <span className="loader"></span>
                    <p className="text-gray-500 mt-4 text-sm">Memuat stream...</p>
                    <style>{`
                        .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                        .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid ${accentHex}; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                        @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </main>
        );
    }

    // ERROR
    if (error) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <SportIcon size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-300 font-medium mb-1">{error}</p>
                        <Link href={`/sports/${sport}`} className="text-sm mt-3 inline-flex items-center gap-1 hover:opacity-80" style={{ color: accentHex }}>
                            <MdArrowBack size={16} /> Kembali ke {config?.name || 'Sports'}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-4 hidden sm:block">
                    <ol className="flex items-center gap-2">
                        <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1"><IoHome size={13} /> Home</Link></li>
                        <li className="text-gray-700">/</li>
                        <li><Link href={`/sports/${sport}`} className="hover:text-gray-300 flex items-center gap-1"><SportIcon size={13} /> {config?.name || 'Sports'}</Link></li>
                        <li className="text-gray-700">/</li>
                        <li className="text-gray-400 truncate max-w-[200px]">{displayTitle}</li>
                    </ol>
                </nav>

                {/* VIDEO PLAYER */}
                <div className="relative mb-4">
                    {streamUrl && isPlaying ? (
                        <VideoPlayer
                            streamUrl={streamUrl}
                            title={displayTitle}
                            isLive={true}
                            onRefresh={refreshStream}
                        />
                    ) : streamLoading ? (
                        <div className="rounded-xl aspect-video flex items-center justify-center" style={{ backgroundColor: '#111318' }}>
                            <div className="text-center">
                                <span className="loader"></span>
                                <p className="text-gray-400 mt-4 text-sm">Memuat Stream...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid ${accentHex}; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl aspect-video w-full overflow-hidden relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                <SportIcon size={36} style={{ color: accentHex }} className="mb-3" />
                                <h1 className="text-lg sm:text-2xl font-bold text-white mb-2">{displayTitle}</h1>
                                <p className="text-sm mb-5 flex items-center gap-2" style={{ color: accentHex }}>
                                    <SportIcon size={14} /> {displayLeague}
                                </p>
                                <button
                                    onClick={() => { if (streamUrl) setIsPlaying(true); }}
                                    disabled={!streamUrl}
                                    className="font-semibold py-3 px-8 rounded-xl text-base transition-all transform flex items-center gap-2 text-white hover:scale-105 shadow-lg"
                                    style={{ backgroundColor: streamUrl ? accentHex : '#232733', color: streamUrl ? '#fff' : '#6b7280', cursor: streamUrl ? 'pointer' : 'wait' }}
                                >
                                    <MdPlayArrow size={22} />
                                    {streamUrl ? 'Tonton Sekarang' : 'Mempersiapkan...'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1a1d27' }}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-base sm:text-lg font-bold text-white mb-1">{displayTitle}</h2>
                            <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                                <SportIcon size={14} style={{ color: accentHex }} />
                                {displayLeague}
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: accentHex }}>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </span>
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Back link */}
                <Link href={`/sports/${sport}`} className="text-sm flex items-center gap-1 hover:opacity-80 transition-colors" style={{ color: accentHex }}>
                    <MdArrowBack size={16} /> Kembali ke {config?.name || 'Sports'}
                </Link>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-orange-400"><MdSportsBasketball size={20} /><span className="text-[10px] mt-1">NBA</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-16 md:hidden"></div>
        </main>
    );
}
