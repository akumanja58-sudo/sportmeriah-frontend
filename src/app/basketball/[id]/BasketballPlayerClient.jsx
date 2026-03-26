'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayer from '../../components/VideoPlayer';

import { FaTelegram, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { MdSportsSoccer, MdSportsBasketball, MdPlayArrow, MdShare, MdContentCopy, MdCheck, MdArrowBack } from 'react-icons/md';
import { HiClock } from 'react-icons/hi2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sportmeriah-backend-production.up.railway.app';

const parseChannelName = (name) => {
    if (!name) return { title: 'Live Stream', homeTeam: null, awayTeam: null, league: 'NBA' };
    let cleanName = name;
    cleanName = cleanName.replace(/^USA\s*(Real\s*)?(NBA|Soccer)\s*\d*:\s*/i, '');
    cleanName = cleanName.replace(/^NBA\s*\d*\s*:\s*/i, '');
    cleanName = cleanName.replace(/\s*\([^)]*\)\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');
    cleanName = cleanName.replace(/\s*@\s*[\d:]+\s*(AM|PM)?.*$/i, '');
    cleanName = cleanName.replace(/\s*@\s*Feb.*$/i, '');
    cleanName = cleanName.replace(/\s*\/\/.*$/i, '');
    cleanName = cleanName.replace(/\s*:NBA\s*\d*$/i, '');

    const vsMatch = cleanName.match(/(.+?)\s+(?:VS|vs|v|@)\s+(.+)/i);
    if (vsMatch) {
        return { title: `${vsMatch[1].trim()} vs ${vsMatch[2].trim()}`, homeTeam: vsMatch[1].trim(), awayTeam: vsMatch[2].trim(), league: 'NBA' };
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
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [matchStatus, setMatchStatus] = useState('live');
    const [streamUrl, setStreamUrl] = useState(null);

    const countdownRef = useRef(null);

    useEffect(() => {
        fetchStreamInfo();
        fetchRelatedMatches();
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [streamId, provider]);

    const fetchStreamInfo = async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await fetch(`${API_URL}/api/basketball/stream/${streamId}?provider=${provider}`);
            const data = await response.json();

            if (data.success) {
                setStreamInfo(data.stream);
                if (data.stream?.name) setParsedInfo(parseChannelName(data.stream.name));
                if (data.match) {
                    setMatchData(data.match);
                    initializeMatchStatus(data.match);
                } else {
                    setMatchStatus('live');
                }

                // Sphere only — start VPS stream
                console.log('Starting Sphere stream via VPS...');
                const startRes = await fetch(`${API_URL}/api/streams/sphere/start/${streamId}`);
                const startData = await startRes.json();
                const waitTime = startData.message?.includes('already running') ? 1000 : 8000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setStreamUrl(`https://stream.nobarmeriah.com/hls/sphere_${streamId}.m3u8`);
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
        if (matchTime > now) { setMatchStatus('scheduled'); startCountdown(matchTime); }
        else if (now - matchTime < liveWindow) { setMatchStatus('live'); }
        else { setMatchStatus('finished'); }
    };

    const startCountdown = (matchTime) => {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = matchTime - now;
            if (diff <= 0) { clearInterval(countdownRef.current); setMatchStatus('live'); return; }
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

    const refreshStream = () => { setIsPlaying(false); setStreamUrl(null); fetchStreamInfo(); };
    const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const formatMatchDate = (dateStr) => {
        if (!dateStr) return 'Live Channel';
        return new Date(dateStr).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    const displayTitle = matchData ? `${matchData.homeTeam?.name} vs ${matchData.awayTeam?.name}` : parsedInfo.title;
    const displayLeague = matchData?.league?.name || parsedInfo.league || 'NBA';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Nonton ${displayTitle} live di NobarMeriah!`;

    // ========== LOADING ==========
    if (loading) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <span className="loader"></span>
                    <p className="text-gray-500 mt-4 text-sm">Memuat stream...</p>
                    <style>{`
                        .loader { width: 40px; height: 40px; border-radius: 50%; display: inline-block; border-top: 3px solid #fff; border-right: 3px solid transparent; box-sizing: border-box; animation: rot 1s linear infinite; position: relative; }
                        .loader::after { content: ''; box-sizing: border-box; position: absolute; left: 0; top: 0; width: 40px; height: 40px; border-radius: 50%; border-left: 3px solid #f97316; border-bottom: 3px solid transparent; animation: rot 0.5s linear infinite reverse; }
                        @keyframes rot { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </main>
        );
    }

    // ========== ERROR ==========
    if (error && !streamInfo) {
        return (
            <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <MdSportsBasketball size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-300 font-medium mb-1">{error}</p>
                        <Link href="/basketball" className="text-orange-400 hover:text-orange-300 text-sm mt-3 inline-flex items-center gap-1">
                            <MdArrowBack size={16} /> Kembali ke Basketball
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // ========== MAIN RENDER ==========
    return (
        <main className="min-h-screen" style={{ backgroundColor: '#0a0c14' }}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

                {/* VIDEO PLAYER */}
                <div className="relative mb-4">
                    {streamUrl && isPlaying ? (
                        <VideoPlayer
                            streamUrl={streamUrl}
                            title={displayTitle}
                            isLive={matchStatus === 'live'}
                            onRefresh={refreshStream}
                        />
                    ) : (
                        <div className="rounded-xl aspect-video w-full overflow-hidden relative" style={{ backgroundColor: '#111318' }}>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">

                                {/* Match Info */}
                                {matchData ? (
                                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                                        <div className="text-center">
                                            <img src={matchData.homeTeam?.logo} alt={matchData.homeTeam?.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[90px]">{matchData.homeTeam?.name}</p>
                                        </div>
                                        <div className="text-center">
                                            {matchStatus === 'live' && matchData.score ? (
                                                <>
                                                    <div className="text-white text-2xl sm:text-3xl font-bold">{matchData.score.home ?? 0} — {matchData.score.away ?? 0}</div>
                                                    <p className="text-red-400 text-sm font-semibold mt-1 flex items-center justify-center gap-1.5">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                        </span>
                                                        LIVE
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="text-2xl sm:text-4xl font-bold text-gray-600 tracking-widest">VS</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <img src={matchData.awayTeam?.logo} alt={matchData.awayTeam?.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain mx-auto mb-2" onError={(e) => e.target.src = 'https://placehold.co/80x80/232733/6b7280?text=T'} />
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[90px]">{matchData.awayTeam?.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <h1 className="text-lg sm:text-2xl font-bold text-white mb-2 px-2">{displayTitle}</h1>
                                )}

                                <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                                    <MdSportsBasketball size={14} className="text-orange-500" /> {displayLeague}
                                </p>

                                {/* Countdown for scheduled */}
                                {matchStatus === 'scheduled' && (
                                    <>
                                        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1"><HiClock size={12} /> {formatMatchDate(matchData?.date)}</p>
                                        <div className="flex justify-center gap-3 mb-5">
                                            {countdown.days > 0 && (
                                                <div className="rounded-lg min-w-[50px] px-3 py-2 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <span className="text-xl font-bold text-white">{String(countdown.days).padStart(2, '0')}</span>
                                                    <p className="text-[10px] text-gray-600 mt-1">Hari</p>
                                                </div>
                                            )}
                                            <div className="rounded-lg min-w-[50px] px-3 py-2 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</span>
                                                <p className="text-[10px] text-gray-600 mt-1">Jam</p>
                                            </div>
                                            <div className="rounded-lg min-w-[50px] px-3 py-2 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                                                <p className="text-[10px] text-gray-600 mt-1">Menit</p>
                                            </div>
                                            <div className="rounded-lg min-w-[50px] px-3 py-2 text-center" style={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-xl font-bold text-orange-400">{String(countdown.seconds).padStart(2, '0')}</span>
                                                <p className="text-[10px] text-gray-600 mt-1">Detik</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Live indicator */}
                                {matchStatus === 'live' && !matchData && (
                                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-400 mb-4">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                        LIVE NOW
                                    </div>
                                )}

                                {matchStatus === 'finished' && (
                                    <div className="text-base font-semibold text-gray-500 mb-4">Pertandingan Selesai</div>
                                )}

                                {matchStatus !== 'finished' ? (
                                    <button
                                        onClick={() => { if (streamUrl) setIsPlaying(true); }}
                                        disabled={!streamUrl}
                                        className={`font-semibold py-3 px-8 rounded-xl text-base transition-all transform flex items-center gap-2 ${streamUrl ? 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 shadow-lg' : 'text-gray-500 cursor-wait'}`}
                                        style={!streamUrl ? { backgroundColor: '#232733' } : {}}
                                    >
                                        <MdPlayArrow size={22} />
                                        {streamUrl ? 'Mulai Nonton' : 'Mempersiapkan...'}
                                    </button>
                                ) : (
                                    <Link href="/basketball" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors">
                                        <MdArrowBack size={16} /> Lihat Pertandingan Lain
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col lg:flex-row gap-5">

                    {/* Left Column */}
                    <div className="w-full lg:w-3/4 space-y-4">

                        {/* Breadcrumb */}
                        <nav className="text-sm text-gray-500 hidden sm:block">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><IoHome size={13} /> Home</Link></li>
                                <li className="text-gray-700">/</li>
                                <li><Link href="/basketball" className="hover:text-gray-300 flex items-center gap-1 transition-colors"><MdSportsBasketball size={13} /> Basketball</Link></li>
                                <li className="text-gray-700">/</li>
                                <li className="text-gray-400 truncate max-w-[200px]">{displayTitle}</li>
                            </ol>
                        </nav>

                        {/* Match Info Card */}
                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg font-bold text-white mb-1">{displayTitle}</h2>
                                    <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                                        <MdSportsBasketball className="text-orange-500 flex-shrink-0" size={14} />
                                        <span className="truncate">{displayLeague}</span>
                                    </p>
                                </div>
                                {matchStatus === 'live' && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white flex-shrink-0">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                        </span>
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Share */}
                        <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                                <MdShare size={16} className="text-gray-400" /> Bagikan
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#25D366' }}>
                                    <FaWhatsapp size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                                </a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#0088cc' }}>
                                    <FaTelegram size={14} /> <span className="hidden sm:inline">Telegram</span>
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1DA1F2' }}>
                                    <FaTwitter size={14} /> <span className="hidden sm:inline">Twitter</span>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1877F2' }}>
                                    <FaFacebook size={14} /> <span className="hidden sm:inline">Facebook</span>
                                </a>
                                <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300" style={{ backgroundColor: '#232733' }}>
                                    {copied ? <MdCheck size={14} className="text-emerald-400" /> : <MdContentCopy size={14} />}
                                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="rounded-xl p-4 hidden sm:block" style={{ backgroundColor: '#1a1d27' }}>
                            <h2 className="text-base font-semibold text-white mb-2">Streaming NBA Basketball Gratis</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Tonton {displayTitle} secara gratis di NobarMeriah. Live streaming NBA Basketball dengan kualitas HD, tanpa buffering.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="rounded-xl p-4 lg:sticky lg:top-32" style={{ backgroundColor: '#1a1d27' }}>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Sedang Live
                            </h3>

                            {relatedMatches.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedMatches.map((match, index) => (
                                        <Link key={match.id || index} href={`/basketball/${match.stream?.id}?provider=${match.stream?.provider || 'sphere'}`}
                                            className="block rounded-lg p-3 transition-colors"
                                            style={{ backgroundColor: '#232733' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2e3a'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#232733'}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={match.homeTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                                                <span className="text-gray-300 text-xs truncate flex-1">{match.homeTeam?.name}</span>
                                                {match.score && <span className="text-white text-xs font-bold">{match.score.home}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={match.awayTeam?.logo} alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.src = 'https://placehold.co/16x16/232733/6b7280?text=T'} />
                                                <span className="text-gray-300 text-xs truncate flex-1">{match.awayTeam?.name}</span>
                                                {match.score && <span className="text-white text-xs font-bold">{match.score.away}</span>}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-600 text-[10px]">{match.league?.name}</span>
                                                <span className="text-red-400 text-[10px] flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                                                    LIVE
                                                </span>
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
                                    <Link href="/basketball" className="block text-gray-500 hover:text-orange-400 text-sm flex items-center gap-2 transition-colors">
                                        <MdSportsBasketball size={14} /> Semua Pertandingan
                                    </Link>
                                    <Link href="/football" className="block text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors">
                                        <MdSportsSoccer size={14} /> Sepakbola
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ backgroundColor: '#0a0c14', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-2.5 px-1">
                    <Link href="/" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors">
                        <IoHome size={20} />
                        <span className="text-[10px] mt-1">Beranda</span>
                    </Link>
                    <Link href="/football" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-emerald-400 transition-colors">
                        <MdSportsSoccer size={20} />
                        <span className="text-[10px] mt-1">Sepakbola</span>
                    </Link>
                    <Link href="/basketball" className="flex flex-col items-center px-3 py-1 text-orange-400">
                        <MdSportsBasketball size={20} />
                        <span className="text-[10px] mt-1 font-medium">NBA</span>
                    </Link>
                    <a href="https://t.me/sportmeriah" target="_blank" className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-blue-400 transition-colors">
                        <FaTelegram size={20} />
                        <span className="text-[10px] mt-1">Telegram</span>
                    </a>
                </div>
            </nav>
            <div className="h-16 md:hidden"></div>
        </main>
    );
}
