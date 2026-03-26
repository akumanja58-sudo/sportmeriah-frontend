'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsHockey, MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdShare, MdContentCopy, MdCheck, MdArrowBack } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';
const STREAM_BASE = 'https://stream.nobarmeriah.com';

export default function HockeyPlayerClient({ streamId }) {
    const searchParams = useSearchParams();
    const fixtureId = searchParams?.get('fixture') || null;

    const [streamInfo, setStreamInfo] = useState(null);
    const [matchData, setMatchData] = useState(null);
    const [relatedMatches, setRelatedMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedMatches();
    }, [streamId]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`${API_URL}/api/hockey/stream/${streamId}`);
            const data = await response.json();

            if (data.success) {
                setStreamInfo(data.stream);
                if (data.match) setMatchData(data.match);

                // Start Sphere stream via VPS
                setStreamLoading(true);
                const startRes = await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
                const startData = await startRes.json();
                const waitTime = startData.message?.includes('already running') ? 1000 : 8000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setStreamUrl(`${STREAM_BASE}/hls/sphere_${streamId}.m3u8`);
                setStreamLoading(false);
            } else {
                setError('Stream tidak ditemukan');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Gagal memuat stream');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedMatches = async () => {
        try {
            const response = await fetch(`${API_URL}/api/hockey`);
            const data = await response.json();
            if (data.success) {
                const live = (data.matches?.live || [])
                    .filter(m => m.hasStream && String(m.stream?.id) !== String(streamId))
                    .slice(0, 5);
                setRelatedMatches(live);
            }
        } catch (err) { }
    };

    const refreshStream = () => { setIsPlaying(false); setStreamUrl(null); fetchStreamInfo(); };
    const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const displayTitle = matchData
        ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}`
        : streamInfo?.name || 'NHL Stream';
    const displayLeague = matchData?.league?.name || streamInfo?.league || 'NHL';
    const isLive = matchData?.isLive || true;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Nonton ${displayTitle} live di SportMeriah!`;

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
                        .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #60a5fa; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                        @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </main>
        );
    }

    // ERROR
    if (error && !streamInfo) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <MdSportsHockey size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-300 font-medium mb-1">{error}</p>
                        <Link href="/hockey" className="text-blue-400 hover:text-blue-300 text-sm mt-3 inline-flex items-center gap-1">
                            <MdArrowBack size={16} /> Kembali ke NHL
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

                {/* VIDEO PLAYER */}
                <div className="relative mb-4">
                    {streamUrl && isPlaying ? (
                        <VideoPlayer streamUrl={streamUrl} title={displayTitle} isLive={isLive} onRefresh={refreshStream} />
                    ) : streamLoading ? (
                        <div className="rounded-xl aspect-video flex items-center justify-center" style={{ backgroundColor: '#111318' }}>
                            <div className="text-center">
                                <span className="loader"></span>
                                <p className="text-gray-400 mt-4 text-sm">Memuat Stream...</p>
                                <style>{`
                                    .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                                    .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #60a5fa; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                                    @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}</style>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl aspect-video w-full overflow-hidden relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                                {matchData ? (
                                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                                        <div className="text-center">
                                            <img src={matchData.homeTeam?.logo} alt="" className="w-14 h-14 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[90px]">{matchData.homeTeam?.name}</p>
                                        </div>
                                        <div className="text-center">
                                            {matchData.isLive && matchData.score ? (
                                                <>
                                                    <div className="text-white text-2xl sm:text-3xl font-bold">{matchData.score.home ?? 0} — {matchData.score.away ?? 0}</div>
                                                    <p className="text-red-400 text-sm font-semibold mt-1 flex items-center justify-center gap-1.5">
                                                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                                                        {matchData.status?.long || 'LIVE'}
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="text-2xl sm:text-4xl font-bold text-gray-600 tracking-widest">VS</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <img src={matchData.awayTeam?.logo} alt="" className="w-14 h-14 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[90px]">{matchData.awayTeam?.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <h1 className="text-lg sm:text-2xl font-bold text-white mb-2">{displayTitle}</h1>
                                )}

                                <p className="text-blue-400 text-sm mb-5 flex items-center gap-2"><MdSportsHockey size={14} /> {displayLeague}</p>

                                <button
                                    onClick={() => { if (streamUrl) setIsPlaying(true); }}
                                    disabled={!streamUrl}
                                    className={`font-semibold py-3 px-8 rounded-xl text-base transition-all transform flex items-center gap-2 ${streamUrl ? 'text-white hover:scale-105 shadow-lg' : 'text-gray-500 cursor-wait'}`}
                                    style={{ backgroundColor: streamUrl ? '#60a5fa' : '#232733' }}>
                                    <MdPlayArrow size={22} />
                                    {streamUrl ? 'Mulai Nonton' : 'Mempersiapkan...'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="w-full lg:w-3/4 space-y-4">

                        <nav className="text-sm text-gray-500 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1"><IoHome size={13} /> Home</Link></li>
                                <li className="text-gray-700">/</li>
                                <li><Link href="/hockey" className="hover:text-gray-300 flex items-center gap-1"><MdSportsHockey size={13} /> NHL</Link></li>
                                <li className="text-gray-700">/</li>
                                <li className="text-gray-400 truncate max-w-[200px]">{displayTitle}</li>
                            </ol>
                        </nav>

                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg font-bold text-white mb-1">{displayTitle}</h2>
                                    <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2"><MdSportsHockey className="text-blue-400 flex-shrink-0" size={14} /><span className="truncate">{displayLeague}</span></p>
                                </div>
                                {isLive && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: '#60a5fa' }}>
                                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span></span>
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm"><MdShare size={16} className="text-gray-400" /> Bagikan</h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#25D366' }}><FaWhatsapp size={14} /> <span className="hidden sm:inline">WhatsApp</span></a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#0088cc' }}><FaTelegram size={14} /> <span className="hidden sm:inline">Telegram</span></a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1DA1F2' }}><FaTwitter size={14} /> <span className="hidden sm:inline">Twitter</span></a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1877F2' }}><FaFacebook size={14} /> <span className="hidden sm:inline">Facebook</span></a>
                                <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300" style={{ backgroundColor: '#232733' }}>
                                    {copied ? <MdCheck size={14} className="text-emerald-400" /> : <MdContentCopy size={14} />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl p-4 hidden sm:block" style={{ backgroundColor: '#1a1d27' }}>
                            <h2 className="text-base font-semibold text-white mb-2">Streaming NHL Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">Tonton {displayTitle} secara gratis di SportMeriah. Live streaming NHL Hockey dengan kualitas HD.</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="rounded-xl p-4 lg:sticky lg:top-32" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                                Sedang Live
                            </h3>
                            {relatedMatches.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedMatches.map((match, index) => (
                                        <Link key={match.id || index} href={`/hockey/${match.stream?.id}?fixture=${match.id}`}
                                            className="block rounded-lg p-3 transition-colors" style={{ backgroundColor: '#232733' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2e3a'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232733'}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                                                <span className="text-gray-300 text-xs truncate flex-1">{match.homeTeam?.name}</span>
                                                <span className="text-white text-xs font-bold">{match.score?.home}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                                                <span className="text-gray-300 text-xs truncate flex-1">{match.awayTeam?.name}</span>
                                                <span className="text-white text-xs font-bold">{match.score?.away}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-600 text-[10px]">NHL</span>
                                                <span className="text-red-400 text-[10px] flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>LIVE</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-xs">Tidak ada pertandingan live lainnya</p>
                            )}

                            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link href="/hockey" className="block text-gray-500 hover:text-blue-400 text-sm flex items-center gap-2 transition-colors"><MdSportsHockey size={14} /> Semua NHL</Link>
                                    <Link href="/football" className="block text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors"><MdSportsSoccer size={14} /> Sepakbola</Link>
                                    <Link href="/basketball" className="block text-gray-500 hover:text-orange-400 text-sm flex items-center gap-2 transition-colors"><MdSportsBasketball size={14} /> Basketball</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><IoHome size={20} /><span className="text-[10px] mt-1">Beranda</span></Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400"><MdSportsSoccer size={20} /><span className="text-[10px] mt-1">Sepakbola</span></Link>
                    <Link href="/hockey" className="flex flex-col items-center px-3 py-1 text-blue-400"><MdSportsHockey size={20} /><span className="text-[10px] mt-1 font-medium">NHL</span></Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400"><FaTelegram size={20} /><span className="text-[10px] mt-1">Telegram</span></a>
                </div>
            </nav>
            <div className="h-16 md:hidden"></div>
        </main>
    );
}
